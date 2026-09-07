import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, isDbConnected } from '../config/database';
import { env } from '../config/env';
import { AppError } from '../middleware/errorHandler';
import { memoryStore, UserRecord } from '../models/db';

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
  studio_id?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export const authService = {
  async register(data: RegisterDTO) {
    const email = data.email.toLowerCase().trim();
    const role = data.role || 'studio_admin';
    const passwordHash = await bcrypt.hash(data.password, 10);
    const userId = `usr_${Date.now()}`;

    if (isDbConnected) {
      // Check existing email
      const existing = await query('SELECT id FROM users WHERE LOWER(email) = $1', [email]);
      if (existing.rows.length > 0) {
        throw new AppError('An account with this email already exists', 409, 'EMAIL_EXISTS');
      }

      const res = await query(
        `INSERT INTO users (id, studio_id, name, email, password_hash, phone, role, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
         RETURNING id, studio_id, name, email, phone, role, status, created_at`,
        [userId, data.studio_id || null, data.name, email, passwordHash, data.phone || null, role]
      );

      const user = res.rows[0];
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name, studio_id: user.studio_id },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN as any }
      );

      return { user, token };
    } else {
      // Memory Store Fallback
      const existing = memoryStore.users.find(u => u.email.toLowerCase() === email);
      if (existing) {
        throw new AppError('An account with this email already exists', 409, 'EMAIL_EXISTS');
      }

      const newUser: UserRecord = {
        id: userId,
        studioId: data.studio_id,
        name: data.name,
        email,
        phone: data.phone,
        role: role as any,
        passwordHash,
        created_at: new Date().toISOString(),
      };

      memoryStore.users.push(newUser);
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name, studio_id: newUser.studioId },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN as any }
      );

      const { passwordHash: _, ...safeUser } = newUser;
      return { user: safeUser, token };
    }
  },

  async login(data: LoginDTO) {
    const email = data.email.toLowerCase().trim();

    if (isDbConnected) {
      const res = await query(
        `SELECT u.id, u.studio_id, u.name, u.email, u.password_hash, u.phone, u.role, u.avatar, u.status,
                s.name as studio_name, s.slug as studio_slug, s.status as studio_status
         FROM users u
         LEFT JOIN studios s ON u.studio_id = s.id
         WHERE LOWER(u.email) = $1`,
        [email]
      );

      if (res.rows.length === 0) {
        throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
      }

      const user = res.rows[0];
      const isMatch = await bcrypt.compare(data.password, user.password_hash);
      if (!isMatch) {
        throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
      }

      if (user.status !== 'active') {
        throw new AppError('Your account has been deactivated or suspended.', 403, 'ACCOUNT_INACTIVE');
      }

      // Update last_login
      await query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name, studio_id: user.studio_id },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN as any }
      );

      const { password_hash: _, ...safeUser } = user;
      return { user: safeUser, token };
    } else {
      // Memory store fallback
      const user = memoryStore.users.find(u => u.email.toLowerCase() === email);
      if (!user || !user.passwordHash) {
        throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
      }

      const isMatch = await bcrypt.compare(data.password, user.passwordHash);
      if (!isMatch) {
        throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
      }

      const studio = user.studioId ? memoryStore.studios.find(s => s.id === user.studioId) : undefined;
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name, studio_id: user.studioId },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN as any }
      );

      const { passwordHash: _, ...safeUser } = user;
      return { user: safeUser, studio, token };
    }
  },

  async getMe(userId: string) {
    if (isDbConnected) {
      const res = await query(
        `SELECT u.id, u.studio_id, u.name, u.email, u.phone, u.role, u.avatar, u.status, u.created_at,
                s.name as studio_name, s.plan as studio_plan, s.status as studio_status
         FROM users u
         LEFT JOIN studios s ON u.studio_id = s.id
         WHERE u.id = $1`,
        [userId]
      );
      if (res.rows.length === 0) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }
      return res.rows[0];
    } else {
      const user = memoryStore.users.find(u => u.id === userId);
      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }
      const studio = user.studioId ? memoryStore.studios.find(s => s.id === user.studioId) : undefined;
      const { passwordHash: _, ...safeUser } = user;
      return { ...safeUser, studio };
    }
  },

  async updateProfile(userId: string, data: { name?: string; phone?: string; avatar?: string }) {
    if (isDbConnected) {
      const fields: string[] = [];
      const values: any[] = [];
      let idx = 1;

      if (data.name) { fields.push(`name = $${idx++}`); values.push(data.name); }
      if (data.phone) { fields.push(`phone = $${idx++}`); values.push(data.phone); }
      if (data.avatar) { fields.push(`avatar = $${idx++}`); values.push(data.avatar); }

      if (fields.length === 0) return this.getMe(userId);

      values.push(userId);
      const sql = `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING id, name, email, phone, role, avatar, status`;
      const res = await query(sql, values);
      return res.rows[0];
    } else {
      const user = memoryStore.users.find(u => u.id === userId);
      if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      if (data.name) user.name = data.name;
      if (data.phone) user.phone = data.phone;
      if (data.avatar) user.avatar = data.avatar;
      const { passwordHash: _, ...safeUser } = user;
      return safeUser;
    }
  },

  async changePassword(userId: string, currentPass: string, newPass: string) {
    if (isDbConnected) {
      const res = await query('SELECT password_hash FROM users WHERE id = $1', [userId]);
      if (res.rows.length === 0) throw new AppError('User not found', 404, 'USER_NOT_FOUND');

      const isMatch = await bcrypt.compare(currentPass, res.rows[0].password_hash);
      if (!isMatch) throw new AppError('Current password is incorrect', 400, 'INCORRECT_PASSWORD');

      const newHash = await bcrypt.hash(newPass, 10);
      await query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [newHash, userId]);
      return true;
    } else {
      const user = memoryStore.users.find(u => u.id === userId);
      if (!user || !user.passwordHash) throw new AppError('User not found', 404, 'USER_NOT_FOUND');

      const isMatch = await bcrypt.compare(currentPass, user.passwordHash);
      if (!isMatch) throw new AppError('Current password is incorrect', 400, 'INCORRECT_PASSWORD');

      user.passwordHash = await bcrypt.hash(newPass, 10);
      return true;
    }
  }
};

import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { sendSuccess, sendError } from '../utils/response';
import { validateRequired, validateEmail, validatePassword } from '../validations';
import { memoryStore } from '../models/db';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      validateRequired(req.body, ['name', 'email', 'password']);
      validateEmail(req.body.email);
      validatePassword(req.body.password);

      const result = await authService.register(req.body);
      return sendSuccess(res, result, 'User registered successfully', 201);
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      validateRequired(req.body, ['email', 'password']);
      validateEmail(req.body.email);

      const result = await authService.login(req.body);
      return sendSuccess(res, result, 'Login successful');
    } catch (err) {
      next(err);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      return sendSuccess(res, { loggedOut: true }, 'Logged out successfully');
    } catch (err) {
      next(err);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 'UNAUTHORIZED', 401);
      }
      const user = await authService.getMe(req.user.id);
      return sendSuccess(res, { user }, 'Token refreshed successfully');
    } catch (err) {
      next(err);
    }
  },

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || (req.query.role === 'great_master' ? 'usr_super_admin' : 'usr_super_admin');
      const user = await authService.getMe(userId);
      return sendSuccess(res, { user });
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 'UNAUTHORIZED', 401);
      const updated = await authService.updateProfile(req.user.id, req.body);
      return sendSuccess(res, updated, 'Profile updated successfully');
    } catch (err) {
      next(err);
    }
  },

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 'UNAUTHORIZED', 401);
      validateRequired(req.body, ['currentPassword', 'newPassword']);
      validatePassword(req.body.newPassword);

      await authService.changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
      return sendSuccess(res, { changed: true }, 'Password changed successfully');
    } catch (err) {
      next(err);
    }
  },

  // Backwards-compatible persona switch for demo testing
  async getPersonas(req: Request, res: Response, next: NextFunction) {
    try {
      const personas = [
        {
          role: 'great_master',
          title: 'Great Master (Platform Admin)',
          user: memoryStore.users.find(u => u.role === 'great_master') || { email: 'master@greatmaster.io', name: 'Rajesh Malhotra' },
        },
        {
          role: 'studio_admin',
          title: 'Studio Aurora Admin (Priya)',
          user: memoryStore.users.find(u => u.id === 'usr_studio_aurora') || { email: 'priya@studioaurora.in', name: 'Priya Sharma' },
        },
        {
          role: 'sales',
          title: 'Lead Manager (Krishna S)',
          user: { email: 'krishna@lumina.io', name: 'Krishna S', role: 'sales' },
        },
      ];
      return sendSuccess(res, personas);
    } catch (err) {
      next(err);
    }
  }
};

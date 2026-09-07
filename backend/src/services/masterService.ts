import { query, isDbConnected } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { memoryStore, StudioRecord, calculateStudioTrialAndPaymentStatus } from '../models/db';

export const masterService = {
  async getMasters(params: { search?: string; status?: string; page?: number; limit?: number }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 20));
    const offset = (page - 1) * limit;

    if (isDbConnected) {
      const conditions: string[] = [];
      const values: any[] = [];
      let idx = 1;

      if (params.status && params.status !== 'all') {
        conditions.push(`status = $${idx++}`);
        values.push(params.status);
      }

      if (params.search) {
        conditions.push(`(LOWER(name) LIKE $${idx} OR LOWER(city) LIKE $${idx} OR LOWER(email) LIKE $${idx})`);
        values.push(`%${params.search.toLowerCase()}%`);
        idx++;
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const countRes = await query(`SELECT COUNT(*) FROM studios ${whereClause}`, values);
      const total = parseInt(countRes.rows[0].count, 10);

      values.push(limit, offset);
      const res = await query(
        `SELECT * FROM studios ${whereClause} ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`,
        values
      );

      return { data: res.rows, total, page, limit };
    } else {
      let filtered = [...memoryStore.studios];
      if (params.status && params.status !== 'all') {
        filtered = filtered.filter(s => s.status === params.status);
      }
      if (params.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(s => s.name.toLowerCase().includes(q) || s.city.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));
      }
      const total = filtered.length;
      const paginated = filtered.slice(offset, offset + limit).map(calculateStudioTrialAndPaymentStatus);
      return { data: paginated, total, page, limit };
    }
  },

  async getMasterById(id: string) {
    if (isDbConnected) {
      const res = await query('SELECT * FROM studios WHERE id = $1', [id]);
      if (res.rows.length === 0) throw new AppError('Master studio not found', 404, 'NOT_FOUND');

      const users = await query('SELECT id, name, email, role, phone, status FROM users WHERE studio_id = $1', [id]);
      const shootsCount = await query('SELECT COUNT(*) FROM projects WHERE studio_id = $1', [id]);
      const clientsCount = await query('SELECT COUNT(*) FROM clients WHERE studio_id = $1', [id]);

      return {
        ...res.rows[0],
        users: users.rows,
        activeShootsCount: parseInt(shootsCount.rows[0].count, 10),
        activeClientsCount: parseInt(clientsCount.rows[0].count, 10),
      };
    } else {
      const studio = memoryStore.studios.find(s => s.id === id);
      if (!studio) throw new AppError('Master studio not found', 404, 'NOT_FOUND');
      const enriched = calculateStudioTrialAndPaymentStatus(studio);
      const users = memoryStore.users.filter(u => u.studioId === id);
      return { ...enriched, users };
    }
  },

  async createMaster(data: any) {
    const id = data.id || `studio_${Date.now()}`;
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const now = new Date().toISOString();

    if (isDbConnected) {
      const res = await query(
        `INSERT INTO studios (id, name, slug, tagline, logo, cover_image, email, phone, city, state, status, plan, amount)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING *`,
        [
          id, data.name, slug, data.tagline || '', data.logo || '', data.cover_image || '',
          data.email, data.phone || '', data.city, data.state, data.status || 'pending',
          data.plan || 'Studio Pro', data.amount || 0
        ]
      );
      return res.rows[0];
    } else {
      const newStudio: StudioRecord = {
        id,
        name: data.name,
        slug,
        tagline: data.tagline || '',
        logo: data.logo || '',
        coverImage: data.coverImage || '',
        email: data.email,
        phone: data.phone || '',
        city: data.city,
        state: data.state,
        status: data.status || 'pending',
        plan: data.plan || 'Studio Pro',
        amount: data.amount || 0,
        activeShootsCount: 0,
        completedShootsCount: 0,
        totalRevenue: 0,
        created_at: now,
      };
      memoryStore.studios.unshift(newStudio);
      return newStudio;
    }
  },

  async updateMaster(id: string, data: any) {
    if (isDbConnected) {
      const fields: string[] = [];
      const values: any[] = [];
      let idx = 1;

      for (const [key, val] of Object.entries(data)) {
        if (['name', 'tagline', 'logo', 'cover_image', 'email', 'phone', 'city', 'state', 'plan', 'amount', 'status'].includes(key)) {
          fields.push(`${key} = $${idx++}`);
          values.push(val);
        }
      }

      if (fields.length === 0) return this.getMasterById(id);

      values.push(id);
      const sql = `UPDATE studios SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING *`;
      const res = await query(sql, values);
      if (res.rows.length === 0) throw new AppError('Master studio not found', 404, 'NOT_FOUND');
      return res.rows[0];
    } else {
      const idx = memoryStore.studios.findIndex(s => s.id === id);
      if (idx === -1) throw new AppError('Master studio not found', 404, 'NOT_FOUND');
      memoryStore.studios[idx] = { ...memoryStore.studios[idx], ...data };
      return memoryStore.studios[idx];
    }
  },

  async deleteMaster(id: string) {
    if (isDbConnected) {
      const res = await query('DELETE FROM studios WHERE id = $1 RETURNING id', [id]);
      if (res.rows.length === 0) throw new AppError('Master studio not found', 404, 'NOT_FOUND');
      return { id };
    } else {
      const idx = memoryStore.studios.findIndex(s => s.id === id);
      if (idx === -1) throw new AppError('Master studio not found', 404, 'NOT_FOUND');
      memoryStore.studios.splice(idx, 1);
      return { id };
    }
  },

  async updateStatus(id: string, status: string, reason?: string) {
    const validStatuses = ['active', 'pending', 'approved', 'rejected', 'suspended'];
    if (!validStatuses.includes(status)) {
      throw new AppError(`Invalid status. Allowed: ${validStatuses.join(', ')}`, 400, 'INVALID_STATUS');
    }

    if (isDbConnected) {
      const res = await query('UPDATE studios SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *', [status, id]);
      if (res.rows.length === 0) throw new AppError('Master studio not found', 404, 'NOT_FOUND');
      return res.rows[0];
    } else {
      const studio = memoryStore.studios.find(s => s.id === id);
      if (!studio) throw new AppError('Master studio not found', 404, 'NOT_FOUND');
      studio.status = status as any;
      if (status === 'approved' || status === 'active') {
        studio.trialStatus = 'ACTIVE';
        studio.trialStartDate = new Date().toISOString();
        studio.trialEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      }
      return studio;
    }
  }
};

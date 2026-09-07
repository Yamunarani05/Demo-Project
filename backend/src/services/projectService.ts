import { query, transaction, isDbConnected } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { memoryStore, ShootRecord, ShootStatus } from '../models/db';

export interface ProjectListParams {
  studioId?: string;
  clientId?: string;
  status?: string;
  type?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const projectService = {
  async getProjects(params: ProjectListParams) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 20));
    const offset = (page - 1) * limit;

    if (isDbConnected) {
      const conditions: string[] = [];
      const values: any[] = [];
      let idx = 1;

      if (params.studioId && params.studioId !== 'all') {
        conditions.push(`p.studio_id = $${idx++}`);
        values.push(params.studioId);
      }
      if (params.clientId) {
        conditions.push(`p.client_id = $${idx++}`);
        values.push(params.clientId);
      }
      if (params.status && params.status !== 'all') {
        conditions.push(`p.status = $${idx++}`);
        values.push(params.status);
      }
      if (params.type && params.type !== 'all') {
        conditions.push(`p.project_type = $${idx++}`);
        values.push(params.type);
      }
      if (params.search) {
        conditions.push(`(LOWER(p.project_name) LIKE $${idx} OR LOWER(p.location) LIKE $${idx} OR LOWER(c.name) LIKE $${idx})`);
        values.push(`%${params.search.toLowerCase()}%`);
        idx++;
      }

      const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const countRes = await query(
        `SELECT COUNT(*) FROM projects p LEFT JOIN clients c ON p.client_id = c.id ${where}`,
        values
      );
      const total = parseInt(countRes.rows[0].count, 10);

      values.push(limit, offset);
      const res = await query(
        `SELECT p.*, c.name as client_name, c.email as client_email, c.phone as client_phone
         FROM projects p
         LEFT JOIN clients c ON p.client_id = c.id
         ${where}
         ORDER BY p.event_date ASC
         LIMIT $${idx++} OFFSET $${idx++}`,
        values
      );

      return { data: res.rows, total, page, limit };
    } else {
      let filtered = [...memoryStore.shoots];
      if (params.studioId && params.studioId !== 'all') {
        filtered = filtered.filter(s => s.studioId === params.studioId);
      }
      if (params.clientId) {
        filtered = filtered.filter(s => s.clientId === params.clientId);
      }
      if (params.status && params.status !== 'all') {
        filtered = filtered.filter(s => s.status === params.status);
      }
      if (params.type && params.type !== 'all') {
        filtered = filtered.filter(s => s.type === params.type);
      }
      if (params.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(s => s.title.toLowerCase().includes(q) || s.location.toLowerCase().includes(q));
      }
      const total = filtered.length;
      const paginated = filtered.slice(offset, offset + limit);
      return { data: paginated, total, page, limit };
    }
  },

  async getProjectById(id: string) {
    if (isDbConnected) {
      const res = await query(
        `SELECT p.*, c.name as client_name, c.email as client_email, c.phone as client_phone
         FROM projects p
         LEFT JOIN clients c ON p.client_id = c.id
         WHERE p.id = $1`,
        [id]
      );
      if (res.rows.length === 0) throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');

      const history = await query('SELECT * FROM project_status_history WHERE project_id = $1 ORDER BY created_at DESC', [id]);
      const photos = await query('SELECT * FROM gallery_photos WHERE shoot_id = $1 LIMIT 50', [id]);
      const deliverables = await query('SELECT * FROM deliverables WHERE shoot_id = $1', [id]);

      return {
        ...res.rows[0],
        statusHistory: history.rows,
        photos: photos.rows,
        deliverables: deliverables.rows,
      };
    } else {
      const shoot = memoryStore.shoots.find(s => s.id === id);
      if (!shoot) throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
      const photos = memoryStore.photos.filter(p => p.shootId === id);
      const deliverables = memoryStore.deliverables.filter(d => d.shootId === id);
      return { ...shoot, photos, deliverables };
    }
  },

  async createProject(data: any) {
    const id = data.id || `proj_${Date.now()}`;
    const studioId = data.studioId || data.studio_id || 'studio_1';

    if (isDbConnected) {
      const res = await query(
        `INSERT INTO projects (
           id, studio_id, client_id, project_name, project_type, event_date, location, theme,
           description, status, budget, advance_paid, balance_due, photographer_name, cinematographer_name, notes
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
         RETURNING *`,
        [
          id, studioId, data.clientId || data.client_id, data.projectName || data.title || 'Photography Project',
          data.projectType || data.type || 'Pre-Wedding', data.eventDate || data.shootDate || new Date().toISOString().split('T')[0],
          data.location || '', data.theme || '', data.description || '', data.status || 'LEAD',
          Number(data.budget || data.packageAmount) || 0, Number(data.advancePaid || data.paidAmount) || 0,
          Number(data.balanceDue) || 0, data.photographerName || '', data.cinematographerName || '', data.notes || ''
        ]
      );
      return res.rows[0];
    } else {
      const newShoot: ShootRecord = {
        id,
        studioId,
        clientId: data.clientId || 'client_1',
        title: data.projectName || data.title || 'Photography Project',
        type: data.projectType || data.type || 'Pre-Wedding',
        shootDate: data.eventDate || data.shootDate || new Date().toISOString().split('T')[0],
        location: data.location || 'Bangalore',
        status: (data.status as ShootStatus) || 'LEAD',
        progressPercent: 10,
        photoCount: 0,
        selectedPhotoCount: 0,
        editedPhotoCount: 0,
        packageAmount: Number(data.budget) || 100000,
        paidAmount: Number(data.advancePaid) || 0,
        notes: data.notes || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      memoryStore.shoots.unshift(newShoot);
      return newShoot;
    }
  },

  async updateProject(id: string, data: any) {
    if (isDbConnected) {
      const fields: string[] = [];
      const values: any[] = [];
      let idx = 1;

      const allowed = [
        'project_name', 'project_type', 'event_date', 'location', 'theme', 'description',
        'status', 'budget', 'advance_paid', 'balance_due', 'photographer_name',
        'cinematographer_name', 'progress_percent', 'photo_count', 'selected_photo_count',
        'edited_photo_count', 'notes', 'deliverables_summary'
      ];

      for (const [key, val] of Object.entries(data)) {
        const col = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        if (allowed.includes(col)) {
          fields.push(`${col} = $${idx++}`);
          values.push(val);
        }
      }

      if (fields.length === 0) return this.getProjectById(id);

      values.push(id);
      const sql = `UPDATE projects SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING *`;
      const res = await query(sql, values);
      if (res.rows.length === 0) throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
      return res.rows[0];
    } else {
      const idx = memoryStore.shoots.findIndex(s => s.id === id);
      if (idx === -1) throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
      memoryStore.shoots[idx] = { ...memoryStore.shoots[idx], ...data, updated_at: new Date().toISOString() };
      return memoryStore.shoots[idx];
    }
  },

  async updateStatus(id: string, newStatus: string, actorName = 'Admin', notes?: string) {
    if (isDbConnected) {
      return await transaction(async (client) => {
        const current = await client.query('SELECT status, studio_id FROM projects WHERE id = $1', [id]);
        if (current.rows.length === 0) throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');

        const prevStatus = current.rows[0].status;
        const studioId = current.rows[0].studio_id;

        const updated = await client.query(
          'UPDATE projects SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
          [newStatus, id]
        );

        // Record history
        await client.query(
          `INSERT INTO project_status_history (id, project_id, previous_status, new_status, changed_by, notes)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [`hist_${Date.now()}`, id, prevStatus, newStatus, actorName, notes || '']
        );

        // Audit log
        await client.query(
          `INSERT INTO activity_logs (id, studio_id, shoot_id, actor_name, actor_role, action, entity_type, entity_id, description)
           VALUES ($1, $2, $3, $4, 'admin', 'Status Change', 'Project', $5, $6)`,
          [`act_${Date.now()}`, studioId, id, actorName, id, `Project moved from ${prevStatus} to ${newStatus}`]
        );

        return updated.rows[0];
      });
    } else {
      const shoot = memoryStore.shoots.find(s => s.id === id);
      if (!shoot) throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
      shoot.status = newStatus as ShootStatus;
      shoot.updated_at = new Date().toISOString();
      return shoot;
    }
  },

  async deleteProject(id: string) {
    if (isDbConnected) {
      const res = await query('DELETE FROM projects WHERE id = $1 RETURNING id', [id]);
      if (res.rows.length === 0) throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
      return { id };
    } else {
      const idx = memoryStore.shoots.findIndex(s => s.id === id);
      if (idx === -1) throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
      memoryStore.shoots.splice(idx, 1);
      return { id };
    }
  }
};

import { query, transaction, isDbConnected } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { memoryStore, ClientRecord } from '../models/db';

export interface ClientListParams {
  studioId?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const clientService = {
  async getClients(params: ClientListParams) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 10));
    const offset = (page - 1) * limit;
    const sortBy = ['created_at', 'name', 'event_date', 'budget'].includes(params.sortBy || '') ? params.sortBy! : 'created_at';
    const sortOrder = params.sortOrder?.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    if (isDbConnected) {
      const conditions: string[] = [];
      const values: any[] = [];
      let idx = 1;

      if (params.studioId && params.studioId !== 'all') {
        conditions.push(`c.studio_id = $${idx++}`);
        values.push(params.studioId);
      }

      if (params.status && params.status !== 'all') {
        conditions.push(`c.status = $${idx++}`);
        values.push(params.status);
      }

      if (params.search) {
        conditions.push(`(LOWER(c.name) LIKE $${idx} OR LOWER(c.couple_name) LIKE $${idx} OR LOWER(c.email) LIKE $${idx} OR LOWER(c.phone) LIKE $${idx})`);
        values.push(`%${params.search.toLowerCase()}%`);
        idx++;
      }

      const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const countRes = await query(`SELECT COUNT(*) FROM clients c ${where}`, values);
      const total = parseInt(countRes.rows[0].count, 10);

      values.push(limit, offset);
      const res = await query(
        `SELECT c.*, 
                p.id as active_shoot_id, p.project_name as active_shoot_name, p.status as shoot_status
         FROM clients c
         LEFT JOIN projects p ON p.client_id = c.id AND p.status NOT IN ('COMPLETED', 'CANCELLED')
         ${where}
         ORDER BY c.${sortBy} ${sortOrder}
         LIMIT $${idx++} OFFSET $${idx++}`,
        values
      );

      return { data: res.rows, total, page, limit };
    } else {
      let filtered = [...memoryStore.clients];
      if (params.studioId && params.studioId !== 'all') {
        filtered = filtered.filter(c => c.studioId === params.studioId);
      }
      if (params.status && params.status !== 'all') {
        filtered = filtered.filter(c => c.status === params.status);
      }
      if (params.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(c =>
          c.name.toLowerCase().includes(q) ||
          c.coupleName.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q)
        );
      }
      const total = filtered.length;
      const paginated = filtered.slice(offset, offset + limit).map(c => {
        const shoots = memoryStore.shoots.filter(s => s.clientId === c.id);
        const activeShoot = shoots.find(s => s.status !== 'COMPLETED' && s.status !== 'CANCELLED') || shoots[0];
        return { ...c, shoots, activeShoot };
      });
      return { data: paginated, total, page, limit };
    }
  },

  async getClientById(id: string) {
    if (isDbConnected) {
      const res = await query('SELECT * FROM clients WHERE id = $1', [id]);
      if (res.rows.length === 0) throw new AppError('Client not found', 404, 'CLIENT_NOT_FOUND');

      const shoots = await query('SELECT * FROM projects WHERE client_id = $1 ORDER BY event_date ASC', [id]);
      const payments = await query('SELECT * FROM payments WHERE client_id = $1 ORDER BY date DESC', [id]);
      const studio = await query('SELECT id, name, slug, email, phone, city FROM studios WHERE id = $1', [res.rows[0].studio_id]);

      return {
        ...res.rows[0],
        shoots: shoots.rows,
        payments: payments.rows,
        studio: studio.rows[0] || null,
      };
    } else {
      const client = memoryStore.clients.find(c => c.id === id);
      if (!client) throw new AppError('Client not found', 404, 'CLIENT_NOT_FOUND');
      const shoots = memoryStore.shoots.filter(s => s.clientId === id);
      const payments = memoryStore.payments.filter(p => p.clientId === id);
      const studio = memoryStore.studios.find(s => s.id === client.studioId);
      return { ...client, shoots, payments, studio };
    }
  },

  async createClient(data: any) {
    const clientId = data.id || `client_${Date.now()}`;
    const studioId = data.studioId || data.studio_id || 'studio_1';
    const coupleName = data.coupleName || data.couple_name || data.name;

    if (isDbConnected) {
      return await transaction(async (client) => {
        // 1. Create client
        const clientRes = await client.query(
          `INSERT INTO clients (id, studio_id, serial_number, name, couple_name, email, phone, address, city, event_type, shoot_type, event_date, location, package, budget, notes, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 'active')
           RETURNING *`,
          [
            clientId, studioId, data.serialNumber || `CL-${Date.now().toString().slice(-4)}`,
            data.name, coupleName, data.email, data.phone || '',
            data.address || '', data.city || 'Bangalore', data.eventType || 'Pre-Wedding',
            data.shootType || 'Pre-Wedding', data.eventDate || new Date().toISOString().split('T')[0],
            data.location || 'Bangalore', data.package || 'Standard Photography',
            Number(data.budget) || 100000, data.notes || ''
          ]
        );

        // 2. Create initial project / shoot
        const shootId = `proj_${Date.now()}`;
        await client.query(
          `INSERT INTO projects (id, studio_id, client_id, project_name, project_type, event_date, location, status, budget, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'LEAD', $8, $9)`,
          [
            shootId, studioId, clientId, `${coupleName} — Photography Project`,
            data.shootType || 'Pre-Wedding', data.eventDate || new Date().toISOString().split('T')[0],
            data.location || 'Bangalore', Number(data.budget) || 100000, data.notes || ''
          ]
        );

        // 3. Log audit activity
        await client.query(
          `INSERT INTO activity_logs (id, studio_id, shoot_id, actor_name, actor_role, action, entity_type, entity_id, description)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            `act_${Date.now()}`, studioId, shootId, 'Studio Admin', 'studio_admin',
            'Created Client', 'Client', clientId, `Added new client ${coupleName}`
          ]
        );

        return clientRes.rows[0];
      });
    } else {
      const newClient: ClientRecord = {
        id: clientId,
        studioId,
        name: data.name,
        coupleName,
        email: data.email,
        phone: data.phone || '+91 90000 00000',
        eventDate: data.eventDate || new Date().toISOString().split('T')[0],
        location: data.location || 'Bangalore',
        package: data.package || 'Custom Photography Package',
        budget: Number(data.budget) || 150000,
        notes: data.notes || '',
        status: 'active',
        created_at: new Date().toISOString(),
      };
      memoryStore.clients.unshift(newClient);
      return newClient;
    }
  },

  async updateClient(id: string, data: any) {
    if (isDbConnected) {
      const fields: string[] = [];
      const values: any[] = [];
      let idx = 1;

      const allowed = ['name', 'couple_name', 'email', 'phone', 'address', 'city', 'event_type', 'shoot_type', 'event_date', 'location', 'package', 'budget', 'status', 'notes'];
      for (const [key, val] of Object.entries(data)) {
        const col = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        if (allowed.includes(col)) {
          fields.push(`${col} = $${idx++}`);
          values.push(val);
        }
      }

      if (fields.length === 0) return this.getClientById(id);

      values.push(id);
      const sql = `UPDATE clients SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING *`;
      const res = await query(sql, values);
      if (res.rows.length === 0) throw new AppError('Client not found', 404, 'CLIENT_NOT_FOUND');
      return res.rows[0];
    } else {
      const idx = memoryStore.clients.findIndex(c => c.id === id);
      if (idx === -1) throw new AppError('Client not found', 404, 'CLIENT_NOT_FOUND');
      memoryStore.clients[idx] = { ...memoryStore.clients[idx], ...data };
      return memoryStore.clients[idx];
    }
  },

  async deleteClient(id: string) {
    if (isDbConnected) {
      const res = await query('DELETE FROM clients WHERE id = $1 RETURNING id', [id]);
      if (res.rows.length === 0) throw new AppError('Client not found', 404, 'CLIENT_NOT_FOUND');
      return { id };
    } else {
      const idx = memoryStore.clients.findIndex(c => c.id === id);
      if (idx === -1) throw new AppError('Client not found', 404, 'CLIENT_NOT_FOUND');
      memoryStore.clients.splice(idx, 1);
      return { id };
    }
  },

  async updateStatus(id: string, status: string) {
    if (isDbConnected) {
      const res = await query('UPDATE clients SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *', [status, id]);
      if (res.rows.length === 0) throw new AppError('Client not found', 404, 'CLIENT_NOT_FOUND');
      return res.rows[0];
    } else {
      const client = memoryStore.clients.find(c => c.id === id);
      if (!client) throw new AppError('Client not found', 404, 'CLIENT_NOT_FOUND');
      client.status = status as any;
      return client;
    }
  }
};

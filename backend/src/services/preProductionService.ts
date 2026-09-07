import { query, isDbConnected } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { memoryStore } from '../models/db';

export const preProductionService = {
  async getProjects(studioId = 'studio_1') {
    if (isDbConnected) {
      const res = await query(
        `SELECT p.*, c.name as client_name, c.email as client_email, c.phone as client_phone, c.event_type as client_event_type
         FROM projects p
         JOIN clients c ON p.client_id = c.id
         WHERE p.studio_id = $1 AND p.status IN ('CONFIRMED', 'PLANNING', 'PHOTOGRAPHER_ASSIGNED')
         ORDER BY p.event_date ASC`,
        [studioId]
      );
      return res.rows;
    } else {
      const shoots = memoryStore.shoots.filter(
        s => s.studioId === studioId && (s.status === 'CONFIRMED' || s.status === 'PLANNED' || (s.status as any) === 'PLANNING')
      );
      return shoots.map(s => {
        const client = memoryStore.clients.find(c => c.id === s.clientId);
        return { ...s, client_name: client?.name, client_email: client?.email, client_phone: client?.phone };
      });
    }
  },

  async assignTeam(projectId: string, data: { photographerName?: string; cinematographerName?: string; dronePilot?: string; makeupArtist?: string }) {
    if (isDbConnected) {
      const res = await query(
        `UPDATE projects 
         SET photographer_name = COALESCE($1, photographer_name),
             cinematographer_name = COALESCE($2, cinematographer_name),
             drone_pilot = COALESCE($3, drone_pilot),
             makeup_artist = COALESCE($4, makeup_artist),
             status = 'PHOTOGRAPHER_ASSIGNED',
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $5
         RETURNING *`,
        [data.photographerName, data.cinematographerName, data.dronePilot, data.makeupArtist, projectId]
      );
      if (res.rows.length === 0) throw new AppError('Project not found', 404, 'NOT_FOUND');
      return res.rows[0];
    } else {
      const shoot = memoryStore.shoots.find(s => s.id === projectId);
      if (!shoot) throw new AppError('Project not found', 404, 'NOT_FOUND');
      if (data.photographerName) shoot.photographerName = data.photographerName;
      if (data.cinematographerName) shoot.cinematographerName = data.cinematographerName;
      shoot.status = 'PHOTOGRAPHER_ASSIGNED';
      return shoot;
    }
  },

  async advanceToProduction(projectId: string) {
    if (isDbConnected) {
      const res = await query(
        `UPDATE projects SET status = 'SHOOTING', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
        [projectId]
      );
      if (res.rows.length === 0) throw new AppError('Project not found', 404, 'NOT_FOUND');
      return res.rows[0];
    } else {
      const shoot = memoryStore.shoots.find(s => s.id === projectId);
      if (!shoot) throw new AppError('Project not found', 404, 'NOT_FOUND');
      shoot.status = 'SHOOTING';
      return shoot;
    }
  }
};

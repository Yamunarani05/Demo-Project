import { Request, Response, NextFunction } from 'express';
import { query, isDbConnected } from '../config/database';
import { sendSuccess } from '../utils/response';
import { memoryStore } from '../models/db';

export const activityController = {
  async getActivityLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = Math.min(100, Number(req.query.limit) || 30);
      const studioId = req.query.studioId ? String(req.query.studioId) : undefined;

      if (isDbConnected) {
        const filter = studioId && studioId !== 'all' ? 'WHERE studio_id = $1' : '';
        const params = studioId && studioId !== 'all' ? [studioId, limit] : [limit];
        const sql = `SELECT * FROM activity_logs ${filter} ORDER BY created_at DESC LIMIT $${params.length}`;
        const result = await query(sql, params);
        return sendSuccess(res, result.rows, 'Activity logs fetched successfully');
      } else {
        const list = memoryStore.activityLogs.slice(0, limit);
        return sendSuccess(res, list, 'Activity logs fetched successfully');
      }
    } catch (err) {
      next(err);
    }
  }
};

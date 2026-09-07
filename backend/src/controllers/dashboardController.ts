import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboardService';
import { sendSuccess } from '../utils/response';
import { memoryStore } from '../models/db';

export const dashboardController = {
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const studioId = req.query.studioId ? String(req.query.studioId) : undefined;
      const stats = await dashboardService.getStats(studioId);
      return sendSuccess(res, stats, 'Dashboard statistics fetched successfully');
    } catch (err) {
      next(err);
    }
  },

  async getRevenue(req: Request, res: Response, next: NextFunction) {
    try {
      const studioId = req.query.studioId ? String(req.query.studioId) : undefined;
      const revenue = await dashboardService.getRevenueData(studioId);
      return sendSuccess(res, revenue, 'Revenue analytics fetched successfully');
    } catch (err) {
      next(err);
    }
  },

  async getSuperAdminDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await dashboardService.getStats('all');
      const studiosCount = memoryStore.studios.length;
      return sendSuccess(res, {
        ...stats,
        totalStudios: studiosCount,
        activeStudios: memoryStore.studios.filter(s => s.status === 'active').length,
        pendingApprovals: memoryStore.studios.filter(s => s.status === 'pending').length,
      }, 'Great Master dashboard fetched successfully');
    } catch (err) {
      next(err);
    }
  }
};

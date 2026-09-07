import { Request, Response, NextFunction } from 'express';
import { greatMasterService } from '../services/greatMasterService';
import { sendSuccess, sendError } from '../utils/response';

export const greatMasterController = {
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await greatMasterService.getPlatformOverview();
      return sendSuccess(res, data, 'Great Master platform overview fetched successfully');
    } catch (err) {
      next(err);
    }
  },

  async getMasterOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await greatMasterService.getMasterOverview(req.params.masterId);
      if (!data) return sendError(res, 'Master studio not found', 'NOT_FOUND', 404);
      return sendSuccess(res, data, 'Master studio overview fetched successfully');
    } catch (err) {
      next(err);
    }
  }
};

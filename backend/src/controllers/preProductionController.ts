import { Request, Response, NextFunction } from 'express';
import { preProductionService } from '../services/preProductionService';
import { sendSuccess } from '../utils/response';
import { validateRequired } from '../validations';

export const preProductionController = {
  async getProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const studioId = String(req.query.studioId || 'studio_1');
      const projects = await preProductionService.getProjects(studioId);
      return sendSuccess(res, projects, 'Pre-production projects fetched successfully');
    } catch (err) {
      next(err);
    }
  },

  async assignTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await preProductionService.assignTeam(req.params.projectId, req.body);
      return sendSuccess(res, updated, 'Team assigned successfully for pre-production');
    } catch (err) {
      next(err);
    }
  },

  async advanceToProduction(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await preProductionService.advanceToProduction(req.params.projectId);
      return sendSuccess(res, updated, 'Project moved to Production phase');
    } catch (err) {
      next(err);
    }
  }
};

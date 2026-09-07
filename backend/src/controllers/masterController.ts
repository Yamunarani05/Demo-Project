import { Request, Response, NextFunction } from 'express';
import { masterService } from '../services/masterService';
import { sendSuccess, sendPaginated } from '../utils/response';
import { validateRequired } from '../validations';

export const masterController = {
  async getMasters(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, status, page, limit } = req.query;
      const result = await masterService.getMasters({
        search: search ? String(search) : undefined,
        status: status ? String(status) : undefined,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      });
      return sendPaginated(res, result.data, result.total, result.page, result.limit, 'Masters fetched successfully');
    } catch (err) {
      next(err);
    }
  },

  async getMasterById(req: Request, res: Response, next: NextFunction) {
    try {
      const studio = await masterService.getMasterById(req.params.id);
      return sendSuccess(res, studio, 'Master studio fetched successfully');
    } catch (err) {
      next(err);
    }
  },

  async createMaster(req: Request, res: Response, next: NextFunction) {
    try {
      validateRequired(req.body, ['name', 'email', 'city', 'state']);
      const studio = await masterService.createMaster(req.body);
      return sendSuccess(res, studio, 'Master studio created successfully', 201);
    } catch (err) {
      next(err);
    }
  },

  async updateMaster(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await masterService.updateMaster(req.params.id, req.body);
      return sendSuccess(res, updated, 'Master studio updated successfully');
    } catch (err) {
      next(err);
    }
  },

  async deleteMaster(req: Request, res: Response, next: NextFunction) {
    try {
      const deleted = await masterService.deleteMaster(req.params.id);
      return sendSuccess(res, deleted, 'Master studio deleted successfully');
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      validateRequired(req.body, ['status']);
      const updated = await masterService.updateStatus(req.params.id, req.body.status, req.body.reason);
      return sendSuccess(res, updated, `Studio status updated to ${req.body.status}`);
    } catch (err) {
      next(err);
    }
  }
};

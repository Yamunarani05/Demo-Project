import { Request, Response, NextFunction } from 'express';
import { projectService } from '../services/projectService';
import { sendSuccess, sendPaginated } from '../utils/response';
import { validateRequired } from '../validations';

export const projectController = {
  async getProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const { studioId, clientId, status, type, search, page, limit } = req.query;
      const result = await projectService.getProjects({
        studioId: studioId ? String(studioId) : undefined,
        clientId: clientId ? String(clientId) : undefined,
        status: status ? String(status) : undefined,
        type: type ? String(type) : undefined,
        search: search ? String(search) : undefined,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      });
      return sendPaginated(res, result.data, result.total, result.page, result.limit, 'Projects fetched successfully');
    } catch (err) {
      next(err);
    }
  },

  async getProjectById(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await projectService.getProjectById(req.params.id);
      return sendSuccess(res, project, 'Project fetched successfully');
    } catch (err) {
      next(err);
    }
  },

  async createProject(req: Request, res: Response, next: NextFunction) {
    try {
      validateRequired(req.body, ['clientId', 'projectType', 'eventDate']);
      const project = await projectService.createProject(req.body);
      return sendSuccess(res, project, 'Project created successfully', 201);
    } catch (err) {
      next(err);
    }
  },

  async updateProject(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await projectService.updateProject(req.params.id, req.body);
      return sendSuccess(res, updated, 'Project updated successfully');
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      validateRequired(req.body, ['status']);
      const actorName = req.user?.name || req.body.actorName || 'Staff';
      const updated = await projectService.updateStatus(req.params.id, req.body.status, actorName, req.body.notes);
      return sendSuccess(res, updated, `Project status changed to ${req.body.status}`);
    } catch (err) {
      next(err);
    }
  },

  async deleteProject(req: Request, res: Response, next: NextFunction) {
    try {
      const deleted = await projectService.deleteProject(req.params.id);
      return sendSuccess(res, deleted, 'Project deleted successfully');
    } catch (err) {
      next(err);
    }
  }
};

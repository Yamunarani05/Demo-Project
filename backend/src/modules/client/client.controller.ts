import { Request, Response, NextFunction } from 'express';
import { clientService } from '../../services/clientService';
import { sendSuccess, sendPaginated } from '../../utils/response';
import { validateRequired, validateEmail } from '../../validations';

export const clientController = {
  async getClients(req: Request, res: Response, next: NextFunction) {
    try {
      const { studioId, status, search, page, limit, sortBy, sortOrder } = req.query;
      const result = await clientService.getClients({
        studioId: studioId ? String(studioId) : undefined,
        status: status ? String(status) : undefined,
        search: search ? String(search) : undefined,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
        sortBy: sortBy ? String(sortBy) : undefined,
        sortOrder: sortOrder === 'asc' ? 'asc' : 'desc',
      });
      return sendPaginated(res, result.data, result.total, result.page, result.limit, 'Clients fetched successfully');
    } catch (err) {
      next(err);
    }
  },

  async getClientById(req: Request, res: Response, next: NextFunction) {
    try {
      const client = await clientService.getClientById(req.params.id);
      return sendSuccess(res, client, 'Client details fetched successfully');
    } catch (err) {
      next(err);
    }
  },

  async createClient(req: Request, res: Response, next: NextFunction) {
    try {
      validateRequired(req.body, ['name', 'email']);
      validateEmail(req.body.email);

      const client = await clientService.createClient(req.body);
      return sendSuccess(res, client, 'Client created successfully', 201);
    } catch (err) {
      next(err);
    }
  },

  async updateClient(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await clientService.updateClient(req.params.id, req.body);
      return sendSuccess(res, updated, 'Client updated successfully');
    } catch (err) {
      next(err);
    }
  },

  async deleteClient(req: Request, res: Response, next: NextFunction) {
    try {
      const deleted = await clientService.deleteClient(req.params.id);
      return sendSuccess(res, deleted, 'Client deleted successfully');
    } catch (err) {
      next(err);
    }
  },

  async updateWorkflowStage(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await clientService.updateClient(req.params.id, {
        status: req.body.newStatus,
        activeShootId: req.body.activeShootId,
      });
      return sendSuccess(res, updated, 'Client workflow stage updated successfully');
    } catch (err) {
      next(err);
    }
  }
};

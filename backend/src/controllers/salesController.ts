import { Request, Response, NextFunction } from 'express';
import { salesService } from '../services/salesService';
import { sendSuccess, sendPaginated } from '../utils/response';
import { validateRequired } from '../validations';

export const salesController = {
  async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const studioId = String(req.query.studioId || 'studio_1');
      const data = await salesService.getOverview(studioId);
      return sendSuccess(res, data, 'Sales overview statistics fetched successfully');
    } catch (err) {
      next(err);
    }
  },

  async getLeads(req: Request, res: Response, next: NextFunction) {
    try {
      const { studioId, status, search, page, limit } = req.query;
      const result = await salesService.getLeads({
        studioId: studioId ? String(studioId) : undefined,
        status: status ? String(status) : undefined,
        search: search ? String(search) : undefined,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      });
      return sendPaginated(res, result.data, result.total, result.page, result.limit, 'Leads fetched successfully');
    } catch (err) {
      next(err);
    }
  },

  async getLeadById(req: Request, res: Response, next: NextFunction) {
    try {
      const lead = await salesService.getLeadById(req.params.id);
      return sendSuccess(res, lead, 'Lead details fetched successfully');
    } catch (err) {
      next(err);
    }
  },

  async createLead(req: Request, res: Response, next: NextFunction) {
    try {
      validateRequired(req.body, ['clientName', 'phone']);
      const lead = await salesService.createLead(req.body);
      return sendSuccess(res, lead, 'Lead created successfully', 201);
    } catch (err) {
      next(err);
    }
  },

  async updateLead(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await salesService.updateLead(req.params.id, req.body);
      return sendSuccess(res, updated, 'Lead updated successfully');
    } catch (err) {
      next(err);
    }
  },

  async convertLead(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await salesService.convertLead(req.params.id, req.body);
      return sendSuccess(res, result, 'Lead converted to active client & project successfully');
    } catch (err) {
      next(err);
    }
  },

  async getFollowUps(req: Request, res: Response, next: NextFunction) {
    try {
      const followUps = await salesService.getFollowUps({
        studioId: req.query.studioId ? String(req.query.studioId) : undefined,
        status: req.query.status ? String(req.query.status) : undefined,
      });
      return sendSuccess(res, followUps);
    } catch (err) {
      next(err);
    }
  },

  async getPackages(req: Request, res: Response, next: NextFunction) {
    try {
      const packages = await salesService.getPackages(String(req.query.studioId || 'studio_1'));
      return sendSuccess(res, packages);
    } catch (err) {
      next(err);
    }
  },

  async getQuotations(req: Request, res: Response, next: NextFunction) {
    try {
      const quotations = await salesService.getQuotations(String(req.query.studioId || 'studio_1'));
      return sendSuccess(res, quotations);
    } catch (err) {
      next(err);
    }
  },

  async createQuotation(req: Request, res: Response, next: NextFunction) {
    try {
      validateRequired(req.body, ['clientName']);
      const quotation = await salesService.createQuotation(req.body);
      return sendSuccess(res, quotation, 'Quotation generated successfully', 201);
    } catch (err) {
      next(err);
    }
  },

  async getInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const invoices = await salesService.getInvoices(String(req.query.studioId || 'studio_1'));
      return sendSuccess(res, invoices, 'Invoices fetched successfully');
    } catch (err) {
      next(err);
    }
  },

  async getAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const attendance = await salesService.getAttendance(String(req.query.studioId || 'studio_1'));
      return sendSuccess(res, attendance, 'Attendance records fetched successfully');
    } catch (err) {
      next(err);
    }
  },

  async getApprovals(req: Request, res: Response, next: NextFunction) {
    try {
      const approvals = await salesService.getApprovals(String(req.query.studioId || 'studio_1'));
      return sendSuccess(res, approvals, 'Approvals fetched successfully');
    } catch (err) {
      next(err);
    }
  },

  async updateApprovalStatus(req: Request, res: Response, next: NextFunction) {
    try {
      validateRequired(req.body, ['status']);
      const updated = await salesService.updateApprovalStatus(req.params.id, req.body.status);
      return sendSuccess(res, updated, `Approval status updated to ${req.body.status}`);
    } catch (err) {
      next(err);
    }
  }
};

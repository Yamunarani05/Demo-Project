import { Request, Response, NextFunction } from 'express';
import { salesService } from '../../services/salesService';
import { invoiceController } from '../../controllers/invoiceController';
import { sendSuccess, sendPaginated } from '../../utils/response';
import { validateRequired } from '../../validations';
import { memoryStore } from '../../models/db';

export const salesController = {
  // 1. Overview & Statistics
  async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const studioId = String(req.query.studioId || 'studio_1');
      const data = await salesService.getOverview(studioId);
      return sendSuccess(res, data, 'Sales overview statistics fetched successfully');
    } catch (err) {
      next(err);
    }
  },

  // 2. Leads Pipeline
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

  // Bulk Lead Upload (Dinesh XLSX / CSV Import Support)
  async bulkCreateLeads(req: Request, res: Response, next: NextFunction) {
    try {
      const leads = Array.isArray(req.body) ? req.body : req.body.leads;
      if (!Array.isArray(leads) || leads.length === 0) {
        return res.status(400).json({ success: false, message: 'Expected an array of leads' });
      }

      const createdLeads = [];
      for (const item of leads) {
        if (!item.clientName && !item.leadName) continue;
        const created = await salesService.createLead({
          clientName: item.clientName || item.leadName,
          phone: item.phone || item.contactNumber || '9999999999',
          email: item.email || '',
          eventType: item.eventType || 'Wedding',
          eventDate: item.eventDate || new Date().toISOString().split('T')[0],
          location: item.location || 'Local',
          source: item.source || item.leadSource || 'Bulk Import',
          estimatedBudget: Number(item.budget || item.estimatedBudget || 100000),
          notes: item.notes || 'Imported from spreadsheet',
        });
        createdLeads.push(created);
      }

      return sendSuccess(res, { count: createdLeads.length, leads: createdLeads }, `Successfully imported ${createdLeads.length} leads`, 201);
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

  async assignLead(req: Request, res: Response, next: NextFunction) {
    try {
      const { assignedEmployee, assignedSalesPerson } = req.body;
      const updated = await salesService.updateLead(req.params.id, {
        assignedSalesPerson: assignedSalesPerson || assignedEmployee,
      });
      return sendSuccess(res, updated, 'Lead assigned successfully');
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

  // 3. Follow-Ups & Call Logs
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

  async getCallLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const logs = [
        { id: 'call_1', leadId: 'lead_1', clientName: 'Aditya & Priya', duration: '4m 32s', date: '2026-09-08', notes: 'Discussed luxury wedding package with 4K drone cinematography', agent: 'Krishna S' },
        { id: 'call_2', leadId: 'lead_2', clientName: 'Siddharth & Meera', duration: '2m 15s', date: '2026-09-07', notes: 'Scheduled studio visit for next Friday', agent: 'Arjun Reddy' },
      ];
      return sendSuccess(res, logs);
    } catch (err) {
      next(err);
    }
  },

  async createCallLog(req: Request, res: Response, next: NextFunction) {
    try {
      const log = {
        id: `call_${Date.now()}`,
        leadId: req.body.leadId,
        clientName: req.body.clientName || 'Lead Client',
        duration: req.body.duration || '0m 00s',
        date: new Date().toISOString().split('T')[0],
        notes: req.body.notes || '',
        agent: req.body.agent || 'Sales Agent',
      };
      return sendSuccess(res, log, 'Call log recorded successfully', 201);
    } catch (err) {
      next(err);
    }
  },

  // 4. Packages & Services
  async getPackages(req: Request, res: Response, next: NextFunction) {
    try {
      const packages = await salesService.getPackages(String(req.query.studioId || 'studio_1'));
      return sendSuccess(res, packages);
    } catch (err) {
      next(err);
    }
  },

  // 5. Quotations (Builder & Public Token Flow)
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

  async getPublicQuotation(req: Request, res: Response, next: NextFunction) {
    try {
      const quotations = await salesService.getQuotations();
      const quo = quotations.find(q => q.id === req.params.id || q.quotationNumber === req.params.id);
      if (!quo) {
        return res.status(404).json({ success: false, message: 'Quotation not found or link expired' });
      }
      return sendSuccess(res, quo);
    } catch (err) {
      next(err);
    }
  },

  async respondPublicQuotation(req: Request, res: Response, next: NextFunction) {
    try {
      const { action, reason } = req.body; // 'accept' | 'reject' | 'issue'
      return sendSuccess(res, {
        quotationId: req.params.id,
        action,
        status: action === 'accept' ? 'ACCEPTED' : action === 'reject' ? 'REJECTED' : 'UNDER_REVIEW',
        updatedAt: new Date().toISOString(),
      }, `Quotation response recorded: ${action}`);
    } catch (err) {
      next(err);
    }
  },

  // 6. Invoices & Approvals
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

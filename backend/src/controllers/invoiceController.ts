import { Request, Response, NextFunction } from 'express';
import { query, transaction, isDbConnected } from '../config/database';
import { sendSuccess, sendPaginated } from '../utils/response';
import { validateRequired } from '../validations';
import { AppError } from '../middleware/errorHandler';
import { salesService } from '../services/salesService';

export const invoiceController = {
  async getInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const studioId = String(req.query.studioId || 'studio_1');
      const invoices = await salesService.getInvoices(studioId);
      return sendSuccess(res, invoices, 'Invoices fetched successfully');
    } catch (err) {
      next(err);
    }
  },

  async getInvoiceById(req: Request, res: Response, next: NextFunction) {
    try {
      if (isDbConnected) {
        const resDb = await query('SELECT * FROM invoices WHERE id = $1', [req.params.id]);
        if (resDb.rows.length === 0) throw new AppError('Invoice not found', 404, 'NOT_FOUND');
        return sendSuccess(res, resDb.rows[0]);
      } else {
        const invoices = await salesService.getInvoices();
        const inv = invoices.find(i => i.id === req.params.id);
        if (!inv) throw new AppError('Invoice not found', 404, 'NOT_FOUND');
        return sendSuccess(res, inv);
      }
    } catch (err) {
      next(err);
    }
  },

  async createInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      validateRequired(req.body, ['clientName', 'totalAmount']);
      const studioId = req.body.studioId || 'studio_1';
      const id = req.body.id || `inv_${Date.now()}`;
      const invNum = req.body.invoiceNumber || `INV-${Math.floor(Math.random() * 900) + 100}`;
      const total = Number(req.body.totalAmount) || 0;
      const discount = Number(req.body.discount) || 0;
      const paid = Number(req.body.paidAmount) || 0;
      const balance = Math.max(0, total - discount - paid);

      if (isDbConnected) {
        const result = await transaction(async (client) => {
          const inserted = await client.query(
            `INSERT INTO invoices (
               id, invoice_number, studio_id, lead_id, client_id, project_id, client_name,
               contact_number, employee_assigned, plan, billing_date, due_date, total_amount,
               discount, paid_amount, balance_amount, payment_status, approval_status, notes
             ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
             RETURNING *`,
            [
              id, invNum, studioId, req.body.leadId || null, req.body.clientId || null, req.body.projectId || null,
              req.body.clientName, req.body.contactNumber || '', req.body.employeeAssigned || 'Not Assigned',
              req.body.plan || 'Standard', req.body.billingDate || new Date().toISOString().split('T')[0],
              req.body.dueDate || null, total, discount, paid, balance,
              req.body.paymentStatus || (paid >= total ? 'Paid' : paid > 0 ? 'Partial Payment' : 'Unpaid'),
              req.body.approvalStatus || 'Approved', req.body.notes || ''
            ]
          );
          return inserted.rows[0];
        });
        return sendSuccess(res, result, 'Invoice created successfully', 201);
      } else {
        const newInv = {
          id,
          invoiceId: invNum,
          clientName: req.body.clientName,
          leadName: req.body.clientName,
          leadId: req.body.leadId || 'LD-NEW',
          contactId: req.body.contactNumber || '9999999999',
          billingDate: req.body.billingDate || '8/24/2026',
          assignedInitials: (req.body.employeeAssigned || 'N')[0],
          assignedColor: 'bg-purple-600 text-white',
          employeeAssigned: req.body.employeeAssigned || 'Not Assigned',
          plan: req.body.plan || 'Standard',
          payment: paid >= total ? 'Paid' : 'Partial Payment',
          status: req.body.approvalStatus || 'Approved',
          amount: total,
        };
        return sendSuccess(res, newInv, 'Invoice created successfully', 201);
      }
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { approvalStatus, paymentStatus } = req.body;
      if (isDbConnected) {
        const fields: string[] = [];
        const values: any[] = [];
        let idx = 1;
        if (approvalStatus) { fields.push(`approval_status = $${idx++}`); values.push(approvalStatus); }
        if (paymentStatus) { fields.push(`payment_status = $${idx++}`); values.push(paymentStatus); }
        values.push(req.params.id);

        const resDb = await query(`UPDATE invoices SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING *`, values);
        if (resDb.rows.length === 0) throw new AppError('Invoice not found', 404, 'NOT_FOUND');
        return sendSuccess(res, resDb.rows[0], 'Invoice status updated successfully');
      } else {
        return sendSuccess(res, { id: req.params.id, approvalStatus, paymentStatus }, 'Invoice status updated successfully');
      }
    } catch (err) {
      next(err);
    }
  }
};

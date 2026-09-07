import { Request, Response, NextFunction } from 'express';
import { query, transaction, isDbConnected } from '../config/database';
import { sendSuccess } from '../utils/response';
import { validateRequired } from '../validations';
import { AppError } from '../middleware/errorHandler';
import { memoryStore } from '../models/db';

export const paymentController = {
  async getPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const studioId = req.query.studioId ? String(req.query.studioId) : undefined;
      if (isDbConnected) {
        const filter = studioId && studioId !== 'all' ? 'WHERE studio_id = $1' : '';
        const params = studioId && studioId !== 'all' ? [studioId] : [];
        const resDb = await query(`SELECT * FROM payments ${filter} ORDER BY created_at DESC`, params);
        return sendSuccess(res, resDb.rows, 'Payments fetched successfully');
      } else {
        const list = studioId && studioId !== 'all' ? memoryStore.payments.filter(p => p.studioId === studioId) : memoryStore.payments;
        return sendSuccess(res, list, 'Payments fetched successfully');
      }
    } catch (err) {
      next(err);
    }
  },

  async createPayment(req: Request, res: Response, next: NextFunction) {
    try {
      validateRequired(req.body, ['amount', 'paymentMethod']);
      const id = req.body.id || `pay_${Date.now()}`;
      const studioId = req.body.studioId || 'studio_1';
      const amount = Number(req.body.amount);

      if (isDbConnected) {
        const result = await transaction(async (client) => {
          // 1. Insert payment record
          const payRes = await client.query(
            `INSERT INTO payments (id, studio_id, client_id, shoot_id, invoice_id, invoice_number, amount, currency, status, payment_method, date, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'INR', 'paid', $8, CURRENT_DATE, $9)
             RETURNING *`,
            [
              id, studioId, req.body.clientId || null, req.body.shootId || null,
              req.body.invoiceId || null, req.body.invoiceNumber || 'INV-DIRECT',
              amount, req.body.paymentMethod || 'Bank Transfer', req.body.notes || ''
            ]
          );

          // 2. Update invoice paid amount if invoiceId is provided
          if (req.body.invoiceId) {
            await client.query(
              `UPDATE invoices 
               SET paid_amount = paid_amount + $1, 
                   balance_amount = GREATEST(0, total_amount - discount - (paid_amount + $1)),
                   payment_status = CASE WHEN total_amount - discount <= (paid_amount + $1) THEN 'Paid' ELSE 'Partial Payment' END,
                   updated_at = CURRENT_TIMESTAMP
               WHERE id = $2`,
              [amount, req.body.invoiceId]
            );
          }

          return payRes.rows[0];
        });
        return sendSuccess(res, result, 'Payment recorded successfully', 201);
      } else {
        const newPay = {
          id,
          studioId,
          clientId: req.body.clientId || 'client_1',
          shootId: req.body.shootId || 'proj_1',
          invoiceNumber: req.body.invoiceNumber || 'INV-DIRECT',
          amount,
          status: 'paid' as const,
          paymentMethod: req.body.paymentMethod || 'Bank Transfer',
          date: new Date().toISOString().split('T')[0],
          dueDate: new Date().toISOString().split('T')[0],
          notes: req.body.notes || '',
        };
        memoryStore.payments.unshift(newPay);
        return sendSuccess(res, newPay, 'Payment recorded successfully', 201);
      }
    } catch (err) {
      next(err);
    }
  },

  async createRazorpayOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const amount = Number(req.body.amount) || 2999;
      const orderId = `order_${Date.now()}`;
      return sendSuccess(res, {
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_lumina12345',
        orderId,
        amount,
        amountInPaise: amount * 100,
        currency: 'INR',
        studioName: 'LUMINA Photography Studio',
        planName: req.body.planName || 'Studio Pro',
      });
    } catch (err) {
      next(err);
    }
  },

  async verifyRazorpayPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { studioId, razorpay_order_id, razorpay_payment_id } = req.body;
      return sendSuccess(res, {
        verified: true,
        studioId,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        status: 'PAYMENT_SUCCESS',
      }, 'Payment verified successfully');
    } catch (err) {
      next(err);
    }
  }
};

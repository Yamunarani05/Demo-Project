import { Request, Response, NextFunction } from 'express';
import { invoiceController } from '../../controllers/invoiceController';
import { paymentController } from '../../controllers/paymentController';
import { verifyRazorpaySignature } from '../../services/payment/razorpayService';
import { memoryStore } from '../../models/db';
import { sendSuccess } from '../../utils/response';
import { validateRequired } from '../../validations';

export const financeController = {
  // 1. Invoices
  getInvoices: invoiceController.getInvoices,
  getInvoiceById: invoiceController.getInvoiceById,
  createInvoice: invoiceController.createInvoice,
  updateInvoiceStatus: invoiceController.updateStatus,

  // 2. Payments & Receipts
  getPayments: paymentController.getPayments,
  createPayment: paymentController.createPayment,

  async getPaymentById(req: Request, res: Response, next: NextFunction) {
    try {
      const payment = memoryStore.payments.find(p => p.id === req.params.id);
      if (!payment) return res.status(404).json({ success: false, message: 'Payment record not found' });
      return sendSuccess(res, payment);
    } catch (err) {
      next(err);
    }
  },

  // 3. Razorpay Gateway
  createRazorpayOrder: paymentController.createRazorpayOrder,
  verifyRazorpayPayment: paymentController.verifyRazorpayPayment,

  // 4. Payment Proof Upload & Offline Bank Transfer
  async submitPaymentProof(req: Request, res: Response, next: NextFunction) {
    try {
      validateRequired(req.body, ['invoiceId', 'amount']);
      const proof = {
        id: `proof_${Date.now()}`,
        invoiceId: req.body.invoiceId,
        amount: Number(req.body.amount),
        referenceNumber: req.body.referenceNumber || 'UTR-MOCK-12345',
        proofImageUrl: req.body.proofImageUrl || 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&auto=format&fit=crop&q=80',
        submittedAt: new Date().toISOString(),
        status: 'PENDING_APPROVAL',
      };
      return sendSuccess(res, proof, 'Payment proof submitted for studio approval', 201);
    } catch (err) {
      next(err);
    }
  }
};

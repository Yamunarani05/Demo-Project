import { Router } from 'express';
import { financeController } from './finance.controller';

const router = Router();

// Invoices
router.get('/invoices', financeController.getInvoices);
router.post('/invoices', financeController.createInvoice);
router.get('/invoices/:id', financeController.getInvoiceById);
router.patch('/invoices/:id/status', financeController.updateInvoiceStatus);
router.put('/invoices/:id/status', financeController.updateInvoiceStatus);

// Payments
router.get('/payments', financeController.getPayments);
router.get('/payments/:id', financeController.getPaymentById);

// Razorpay & Proofs
router.post('/razorpay/create-order', financeController.createRazorpayOrder);
router.post('/razorpay/verify', financeController.verifyRazorpayPayment);
router.post('/proofs', financeController.submitPaymentProof);

export default router;

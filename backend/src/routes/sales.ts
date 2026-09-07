import { Router } from 'express';
import { salesController } from '../controllers/salesController';
import { invoiceController } from '../controllers/invoiceController';

const router = Router();

// 1. Overview & Statistics
router.get('/', salesController.getOverview);
router.get('/overview', salesController.getOverview);

// 2. Leads Pipeline
router.get('/leads', salesController.getLeads);
router.get('/leads/:id', salesController.getLeadById);
router.post('/leads', salesController.createLead);
router.put('/leads/:id', salesController.updateLead);
router.post('/leads/:id/convert', salesController.convertLead);

// 3. Follow-Ups
router.get('/follow-ups', salesController.getFollowUps);

// 4. Packages & Services
router.get('/packages', salesController.getPackages);

// 5. Quotations
router.get('/quotations', salesController.getQuotations);
router.post('/quotations', salesController.createQuotation);

// 6. Invoices (Powers SalesInvoice page)
router.get('/invoices', salesController.getInvoices);
router.get('/invoice', salesController.getInvoices);
router.post('/invoices', invoiceController.createInvoice);
router.patch('/invoices/:id/status', invoiceController.updateStatus);
router.put('/invoices/:id/status', invoiceController.updateStatus);

// 7. Attendance
router.get('/attendance', salesController.getAttendance);

// 8. Approvals
router.get('/approvals', salesController.getApprovals);
router.get('/approval', salesController.getApprovals);
router.patch('/approvals/:id/status', salesController.updateApprovalStatus);
router.put('/approvals/:id/status', salesController.updateApprovalStatus);

export default router;

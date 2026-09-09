import { Router } from 'express';
import { salesController } from './sales.controller';
import { invoiceController } from '../../controllers/invoiceController';

const router = Router();

// Overview
router.get('/', salesController.getOverview);
router.get('/overview', salesController.getOverview);

// Leads & Bulk Import
router.get('/leads', salesController.getLeads);
router.post('/leads', salesController.createLead);
router.post('/leads/bulk', salesController.bulkCreateLeads);
router.get('/leads/:id', salesController.getLeadById);
router.put('/leads/:id', salesController.updateLead);
router.put('/leads/:id/assign', salesController.assignLead);
router.post('/leads/:id/convert', salesController.convertLead);

// Follow-ups & Calls
router.get('/follow-ups', salesController.getFollowUps);
router.get('/calls', salesController.getCallLogs);
router.post('/calls', salesController.createCallLog);

// Packages & Services
router.get('/packages', salesController.getPackages);

// Quotations & Public Access
router.get('/quotations', salesController.getQuotations);
router.post('/quotations', salesController.createQuotation);
router.get('/quotations/:id/public', salesController.getPublicQuotation);
router.post('/quotations/:id/respond', salesController.respondPublicQuotation);

// Invoices
router.get('/invoices', salesController.getInvoices);
router.get('/invoice', salesController.getInvoices);
router.post('/invoices', invoiceController.createInvoice);
router.patch('/invoices/:id/status', invoiceController.updateStatus);
router.put('/invoices/:id/status', invoiceController.updateStatus);

// Attendance & Approvals
router.get('/attendance', salesController.getAttendance);
router.get('/approvals', salesController.getApprovals);
router.get('/approval', salesController.getApprovals);
router.patch('/approvals/:id/status', salesController.updateApprovalStatus);
router.put('/approvals/:id/status', salesController.updateApprovalStatus);

export default router;

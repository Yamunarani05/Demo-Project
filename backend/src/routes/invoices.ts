import { Router } from 'express';
import { invoiceController } from '../controllers/invoiceController';

const router = Router();

router.get('/', invoiceController.getInvoices);
router.get('/:id', invoiceController.getInvoiceById);
router.post('/', invoiceController.createInvoice);
router.patch('/:id/status', invoiceController.updateStatus);
router.put('/:id/status', invoiceController.updateStatus);

export default router;

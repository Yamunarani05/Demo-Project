import { Router } from 'express';
import { paymentController } from '../controllers/paymentController';

const router = Router();

router.get('/', paymentController.getPayments);
router.post('/', paymentController.createPayment);
router.post('/create-razorpay-order', paymentController.createRazorpayOrder);
router.post('/verify-razorpay-payment', paymentController.verifyRazorpayPayment);

export default router;

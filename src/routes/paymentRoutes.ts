import { Router } from 'express';
import { paymentController } from '../controllers/paymentController';

const router = Router();

router.post('/initiate', paymentController.initiatePayment);
router.post('/notify', paymentController.handlePaymentNotification);
router.get('/status/:order_id', paymentController.checkPaymentStatus);

export default router; 
import { Router } from 'express';
import { createPayment, verifyPayment } from '../controllers/payment.controller';
import { authMiddleware } from '../middleware';

const router = Router();

router.post('/create', authMiddleware, createPayment);
router.post('/verify', authMiddleware, verifyPayment);

export default router;

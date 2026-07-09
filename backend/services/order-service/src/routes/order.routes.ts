import { Router } from 'express';
import {
  placeOrder,
  getMyOrders,
  getOrderById,
  confirmOrder,
  cancelOrder,
  getOrderInternal,
  attachRazorpayOrderInternal,
  confirmOrderInternal,
} from '../controllers/order.controller';
import { authMiddleware } from '../middleware';
import { internalAuthMiddleware } from '../middleware/internal';

const router = Router();

router.get('/internal/:id', internalAuthMiddleware, getOrderInternal);
router.patch('/internal/:id/razorpay', internalAuthMiddleware, attachRazorpayOrderInternal);
router.post('/internal/:id/confirm', internalAuthMiddleware, confirmOrderInternal);

router.post('/', authMiddleware, placeOrder);
router.get('/mine', authMiddleware, getMyOrders);
router.get('/:id', authMiddleware, getOrderById);
router.post('/:id/confirm', authMiddleware, confirmOrder);
router.post('/:id/cancel', authMiddleware, cancelOrder);

export default router;

import { Router } from 'express';
import { placeOrder, getMyOrders } from '../controllers/order.controller';
import { authMiddleware } from '../middleware';

const router = Router();

router.post('/', authMiddleware, placeOrder);
router.get('/mine', authMiddleware, getMyOrders);

export default router;

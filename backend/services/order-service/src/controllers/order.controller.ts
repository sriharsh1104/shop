import { Response } from 'express';
import { AuthRequest } from '../middleware';
import { orderStore } from '../services/order.service';
import { PlaceOrderRequest } from '../types';

export async function placeOrder(req: AuthRequest, res: Response): Promise<void> {
  const { productId, quantity = 1 }: PlaceOrderRequest = req.body;

  if (!productId) {
    res.status(400).json({ message: 'productId is required' });
    return;
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    res.status(400).json({ message: 'quantity must be a positive integer' });
    return;
  }

  try {
    const order = await orderStore.placeOrder(
      req.userId!,
      req.userEmail!,
      productId,
      quantity
    );

    res.status(201).json({
      message: 'Order placed successfully',
      order,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to place order';
    res.status(400).json({ message });
  }
}

export function getMyOrders(req: AuthRequest, res: Response): void {
  const orders = orderStore.getByUserId(req.userId!);
  res.json({ orders, total: orders.length });
}

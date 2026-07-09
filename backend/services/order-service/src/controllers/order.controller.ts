import { Response } from 'express';
import { AuthRequest } from '../middleware';
import { orderStore } from '../services/order.service';
import { PlaceOrderRequest, ConfirmOrderRequest } from '../types';

export async function placeOrder(req: AuthRequest, res: Response): Promise<void> {
  const { productId, quantity = 1, addressId }: PlaceOrderRequest = req.body;

  if (!productId) {
    res.status(400).json({ message: 'productId is required' });
    return;
  }

  if (!addressId) {
    res.status(400).json({ message: 'addressId is required' });
    return;
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    res.status(400).json({ message: 'quantity must be a positive integer' });
    return;
  }

  try {
    const order = await orderStore.createPendingOrder(
      req.userId!,
      req.userEmail!,
      productId,
      quantity,
      addressId
    );

    res.status(201).json({
      message: 'Order created. Proceed to payment.',
      order,
      amount: order.totalPrice,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create order';
    res.status(400).json({ message });
  }
}

export async function getMyOrders(req: AuthRequest, res: Response): Promise<void> {
  const orders = await orderStore.getByUserId(req.userId!);
  res.json({ orders, total: orders.length });
}

export async function getOrderById(req: AuthRequest, res: Response): Promise<void> {
  const order = await orderStore.getById(req.params.id);
  if (!order || order.userId !== req.userId) {
    res.status(404).json({ message: 'Order not found' });
    return;
  }
  res.json({ order });
}

export async function confirmOrder(req: AuthRequest, res: Response): Promise<void> {
  const { paymentId, razorpayOrderId }: ConfirmOrderRequest = req.body;
  if (!paymentId || !razorpayOrderId) {
    res.status(400).json({ message: 'paymentId and razorpayOrderId are required' });
    return;
  }

  try {
    const order = await orderStore.confirmOrder(req.params.id, paymentId, razorpayOrderId);
    res.json({ message: 'Order confirmed', order });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to confirm order';
    res.status(400).json({ message });
  }
}

export async function cancelOrder(req: AuthRequest, res: Response): Promise<void> {
  const order = await orderStore.cancelOrder(req.params.id, req.userId!);
  if (!order) {
    res.status(404).json({ message: 'Order not found or cannot be cancelled' });
    return;
  }
  res.json({ message: 'Order cancelled', order });
}

export async function getOrderInternal(req: AuthRequest, res: Response): Promise<void> {
  const order = await orderStore.getById(req.params.id);
  if (!order) {
    res.status(404).json({ message: 'Order not found' });
    return;
  }
  res.json({ order });
}

export async function attachRazorpayOrderInternal(req: AuthRequest, res: Response): Promise<void> {
  const { razorpayOrderId } = req.body as { razorpayOrderId?: string };
  if (!razorpayOrderId) {
    res.status(400).json({ message: 'razorpayOrderId is required' });
    return;
  }
  const order = await orderStore.attachRazorpayOrder(req.params.id, razorpayOrderId);
  if (!order) {
    res.status(404).json({ message: 'Order not found' });
    return;
  }
  res.json({ order });
}

export async function confirmOrderInternal(req: AuthRequest, res: Response): Promise<void> {
  const { paymentId, razorpayOrderId } = req.body as ConfirmOrderRequest;
  if (!paymentId || !razorpayOrderId) {
    res.status(400).json({ message: 'paymentId and razorpayOrderId are required' });
    return;
  }
  try {
    const order = await orderStore.confirmOrder(req.params.id, paymentId, razorpayOrderId);
    res.json({ message: 'Order confirmed', order });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to confirm order';
    res.status(400).json({ message });
  }
}

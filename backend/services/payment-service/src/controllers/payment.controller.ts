import { Response } from 'express';
import crypto from 'crypto';
import { config } from '../config';
import { paymentStore } from '../services/payment.service';
import { AuthRequest } from '../middleware';

export async function createPayment(req: AuthRequest, res: Response): Promise<void> {
  const { orderId } = req.body as { orderId?: string };
  if (!orderId) {
    res.status(400).json({ message: 'orderId is required' });
    return;
  }

  try {
    const result = await paymentStore.createPayment(
      orderId,
      req.userId!,
      req.headers.authorization!
    );
    res.status(201).json({
      message: 'Payment initiated',
      ...result,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create payment';
    res.status(400).json({ message });
  }
}

export async function verifyPayment(req: AuthRequest, res: Response): Promise<void> {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body as {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
  };

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res.status(400).json({ message: 'Payment verification fields are required' });
    return;
  }

  try {
    const payment = await paymentStore.verifyPayment(
      req.userId!,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );
    res.json({ message: 'Payment verified', payment });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Payment verification failed';
    res.status(400).json({ message });
  }
}

export async function paymentWebhook(req: AuthRequest, res: Response): Promise<void> {
  const signature = req.headers['x-razorpay-signature'];
  if (config.razorpayWebhookSecret && signature) {
    const expected = crypto
      .createHmac('sha256', config.razorpayWebhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');
    if (expected !== signature) {
      res.status(400).json({ message: 'Invalid webhook signature' });
      return;
    }
  }

  try {
    await paymentStore.handleWebhook(req.body);
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
}

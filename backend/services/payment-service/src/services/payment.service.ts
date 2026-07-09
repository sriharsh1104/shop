import crypto from 'crypto';
import Razorpay from 'razorpay';
import { config } from '../config';
import { IPaymentDoc, PaymentModel } from '../models/payment.model';
import { OrderSummary, Payment } from '../types';

function toPayment(doc: IPaymentDoc): Payment {
  return {
    id: doc._id.toString(),
    orderId: doc.orderId,
    userId: doc.userId,
    amount: doc.amount,
    currency: doc.currency,
    razorpayOrderId: doc.razorpayOrderId,
    razorpayPaymentId: doc.razorpayPaymentId,
    status: doc.status,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

let razorpayClient: Razorpay | null = null;

function getRazorpay(): Razorpay {
  if (!razorpayClient) {
    if (!config.razorpayKeyId || !config.razorpayKeySecret) {
      throw new Error('Razorpay credentials are not configured');
    }
    razorpayClient = new Razorpay({
      key_id: config.razorpayKeyId,
      key_secret: config.razorpayKeySecret,
    });
  }
  return razorpayClient;
}

async function fetchOrder(orderId: string, authHeader: string): Promise<OrderSummary> {
  const response = await fetch(`${config.orderServiceUrl}/api/orders/${orderId}`, {
    headers: { Authorization: authHeader },
  });
  if (!response.ok) {
    throw new Error('Order not found');
  }
  const data = (await response.json()) as { order: OrderSummary };
  return data.order;
}

async function fetchOrderInternal(orderId: string): Promise<OrderSummary> {
  const response = await fetch(`${config.orderServiceUrl}/api/orders/internal/${orderId}`, {
    headers: { 'x-internal-secret': config.internalSecret },
  });
  if (!response.ok) {
    throw new Error('Order not found');
  }
  const data = (await response.json()) as { order: OrderSummary };
  return data.order;
}

async function attachRazorpayOrder(orderId: string, razorpayOrderId: string): Promise<void> {
  await fetch(`${config.orderServiceUrl}/api/orders/internal/${orderId}/razorpay`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-internal-secret': config.internalSecret,
    },
    body: JSON.stringify({ razorpayOrderId }),
  });
}

async function confirmOrderInternal(
  orderId: string,
  paymentId: string,
  razorpayOrderId: string
): Promise<void> {
  const response = await fetch(`${config.orderServiceUrl}/api/orders/internal/${orderId}/confirm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-internal-secret': config.internalSecret,
    },
    body: JSON.stringify({ paymentId, razorpayOrderId }),
  });
  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(data.message || 'Failed to confirm order');
  }
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const body = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac('sha256', config.razorpayKeySecret)
    .update(body)
    .digest('hex');
  return expected === signature;
}

export const paymentStore = {
  async createPayment(orderId: string, userId: string, authHeader: string) {
    const order = await fetchOrder(orderId, authHeader);
    if (order.userId !== userId) {
      throw new Error('Order not found');
    }
    if (order.status !== 'pending_payment') {
      throw new Error('Order is not pending payment');
    }

    const amountPaise = Math.round(order.totalPrice * 100);
    const razorpay = getRazorpay();
    const razorpayOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: orderId,
    });

    const doc = await PaymentModel.create({
      orderId,
      userId,
      amount: order.totalPrice,
      currency: 'INR',
      razorpayOrderId: razorpayOrder.id,
      status: 'created',
    });

    await attachRazorpayOrder(orderId, razorpayOrder.id);

    return {
      payment: toPayment(doc),
      razorpayOrderId: razorpayOrder.id,
      amount: amountPaise,
      currency: 'INR',
      keyId: config.razorpayKeyId,
    };
  },

  async verifyPayment(
    userId: string,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ) {
    const paymentDoc = await PaymentModel.findOne({ razorpayOrderId, userId });
    if (!paymentDoc) {
      throw new Error('Payment not found');
    }
    if (paymentDoc.status === 'paid') {
      return toPayment(paymentDoc);
    }

    const valid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!valid) {
      paymentDoc.status = 'failed';
      await paymentDoc.save();
      throw new Error('Invalid payment signature');
    }

    await confirmOrderInternal(paymentDoc.orderId, razorpayPaymentId, razorpayOrderId);

    paymentDoc.status = 'paid';
    paymentDoc.razorpayPaymentId = razorpayPaymentId;
    await paymentDoc.save();

    return toPayment(paymentDoc);
  },

  async handleWebhook(event: {
    event: string;
    payload: {
      payment?: { entity: { id: string; order_id: string; status: string } };
      order?: { entity: { id: string; receipt: string } };
    };
  }) {
    if (event.event !== 'payment.captured') return;

    const paymentEntity = event.payload.payment?.entity;
    if (!paymentEntity) return;

    const paymentDoc = await PaymentModel.findOne({ razorpayOrderId: paymentEntity.order_id });
    if (!paymentDoc || paymentDoc.status === 'paid') return;

    await confirmOrderInternal(paymentDoc.orderId, paymentEntity.id, paymentEntity.order_id);

    paymentDoc.status = 'paid';
    paymentDoc.razorpayPaymentId = paymentEntity.id;
    await paymentDoc.save();
  },
};

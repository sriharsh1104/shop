import { config } from '../config';
import { getProduct, reserveStock } from '../grpc/product.client';
import { publishOrderPlaced } from '../kafka/producer';
import { IOrderDoc, OrderModel } from '../models/order.model';
import { Order, ShippingAddress } from '../types';

function toOrder(doc: IOrderDoc): Order {
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    userEmail: doc.userEmail,
    productId: doc.productId,
    productName: doc.productName,
    quantity: doc.quantity,
    unitPrice: doc.unitPrice,
    totalPrice: doc.totalPrice,
    status: doc.status,
    addressId: doc.addressId,
    shippingAddress: doc.shippingAddress,
    paymentId: doc.paymentId,
    razorpayOrderId: doc.razorpayOrderId,
    paidAt: doc.paidAt ? doc.paidAt.toISOString() : null,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

async function fetchAddress(userId: string, addressId: string): Promise<ShippingAddress | null> {
  const response = await fetch(
    `${config.userServiceUrl}/internal/users/${userId}/addresses/${addressId}`
  );
  if (!response.ok) return null;
  const data = (await response.json()) as {
    address: ShippingAddress & { label: string };
  };
  return data.address;
}

async function fetchProductPrice(productId: string, quantity: number) {
  const product = await getProduct(productId);
  if (!product.found) {
    throw new Error('Product not found');
  }
  if (product.stock < quantity) {
    throw new Error('Insufficient stock');
  }
  return {
    productName: product.name,
    unitPrice: product.price,
    totalPrice: product.price * quantity,
  };
}

export const orderStore = {
  async getByUserId(userId: string): Promise<Order[]> {
    const docs = await OrderModel.find({ userId }).sort({ createdAt: -1 });
    return docs.map(toOrder);
  },

  async getById(id: string): Promise<Order | null> {
    const doc = await OrderModel.findById(id);
    return doc ? toOrder(doc) : null;
  },

  async createPendingOrder(
    userId: string,
    userEmail: string,
    productId: string,
    quantity: number,
    addressId: string
  ): Promise<Order> {
    const address = await fetchAddress(userId, addressId);
    if (!address) {
      throw new Error('Delivery address not found');
    }

    const productInfo = await fetchProductPrice(productId, quantity);

    const doc = await OrderModel.create({
      userId,
      userEmail,
      productId,
      productName: productInfo.productName,
      quantity,
      unitPrice: productInfo.unitPrice,
      totalPrice: productInfo.totalPrice,
      status: 'pending_payment',
      addressId,
      shippingAddress: address,
    });

    return toOrder(doc);
  },

  async attachRazorpayOrder(orderId: string, razorpayOrderId: string): Promise<Order | null> {
    const doc = await OrderModel.findByIdAndUpdate(
      orderId,
      { $set: { razorpayOrderId } },
      { new: true }
    );
    return doc ? toOrder(doc) : null;
  },

  async confirmOrder(
    orderId: string,
    paymentId: string,
    razorpayOrderId: string
  ): Promise<Order> {
    const existing = await OrderModel.findById(orderId);
    if (!existing) {
      throw new Error('Order not found');
    }
    if (existing.status === 'paid') {
      return toOrder(existing);
    }
    if (existing.status !== 'pending_payment') {
      throw new Error('Order cannot be confirmed');
    }

    const stockResult = await reserveStock(existing.productId, existing.quantity);
    if (!stockResult.success) {
      await OrderModel.findByIdAndUpdate(orderId, { $set: { status: 'failed' } });
      throw new Error(stockResult.message);
    }

    const doc = await OrderModel.findByIdAndUpdate(
      orderId,
      {
        $set: {
          status: 'paid',
          paymentId,
          razorpayOrderId,
          paidAt: new Date(),
          productName: stockResult.product_name || existing.productName,
          unitPrice: stockResult.price,
          totalPrice: stockResult.price * existing.quantity,
        },
      },
      { new: true }
    );

    if (!doc) {
      throw new Error('Order not found');
    }

    await publishOrderPlaced({
      email: doc.userEmail,
      orderId: doc._id.toString(),
      productName: doc.productName,
      quantity: doc.quantity,
      totalPrice: doc.totalPrice,
    });

    return toOrder(doc);
  },

  async cancelOrder(orderId: string, userId: string): Promise<Order | null> {
    const doc = await OrderModel.findOneAndUpdate(
      { _id: orderId, userId, status: 'pending_payment' },
      { $set: { status: 'cancelled' } },
      { new: true }
    );
    return doc ? toOrder(doc) : null;
  },
};

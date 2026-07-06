import { v4 as uuidv4 } from 'uuid';
import { reserveStock } from '../grpc/product.client';
import { publishOrderPlaced } from '../kafka/producer';
import { Order } from '../types';

const orders = new Map<string, Order>();

export const orderStore = {
  getByUserId(userId: string): Order[] {
    return Array.from(orders.values()).filter((o) => o.userId === userId);
  },

  async placeOrder(
    userId: string,
    userEmail: string,
    productId: string,
    quantity: number
  ): Promise<Order> {
    const stockResult = await reserveStock(productId, quantity);

    if (!stockResult.success) {
      throw new Error(stockResult.message);
    }

    const totalPrice = stockResult.price * quantity;
    const order: Order = {
      id: uuidv4(),
      userId,
      userEmail,
      productId,
      productName: stockResult.product_name,
      quantity,
      unitPrice: stockResult.price,
      totalPrice,
      createdAt: new Date().toISOString(),
    };

    orders.set(order.id, order);

    await publishOrderPlaced({
      email: userEmail,
      orderId: order.id,
      productName: order.productName,
      quantity,
      totalPrice,
    });

    return order;
  },
};

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
}

export interface PlaceOrderRequest {
  productId: string;
  quantity: number;
}

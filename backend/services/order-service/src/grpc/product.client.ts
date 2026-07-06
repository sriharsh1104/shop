import path from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { config } from '../config';

const PROTO_PATH = path.join(__dirname, '../../proto/product.client.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const productProto = grpc.loadPackageDefinition(packageDefinition) as {
  product: {
    ProductService: grpc.ServiceClientConstructor;
  };
};

const client = new productProto.product.ProductService(
  config.productGrpcUrl,
  grpc.credentials.createInsecure()
);

interface ReserveStockResponse {
  success: boolean;
  message: string;
  remaining_stock: number;
  product_name: string;
  price: number;
}

export function reserveStock(
  productId: string,
  quantity: number
): Promise<ReserveStockResponse> {
  return new Promise((resolve, reject) => {
    client.ReserveStock(
      { product_id: productId, quantity },
      (err: grpc.ServiceError | null, response: ReserveStockResponse) => {
        if (err) reject(err);
        else resolve(response);
      }
    );
  });
}

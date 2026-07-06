import path from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { config } from '../config';
import { productStore } from '../services/product.service';

const PROTO_PATH = path.join(__dirname, '../../proto/product.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const productProto = grpc.loadPackageDefinition(packageDefinition) as {
  product: {
    ProductService: grpc.ServiceClientConstructor & { service: grpc.ServiceDefinition };
  };
};

function getProduct(
  call: grpc.ServerUnaryCall<{ id: string }, unknown>,
  callback: grpc.sendUnaryData<unknown>
): void {
  const product = productStore.getById(call.request.id);
  if (!product) {
    callback(null, { id: call.request.id, name: '', price: 0, stock: 0, found: false });
    return;
  }
  callback(null, {
    id: product.id,
    name: product.name,
    price: product.price,
    stock: product.stock,
    found: true,
  });
}

function reserveStock(
  call: grpc.ServerUnaryCall<{ product_id: string; quantity: number }, unknown>,
  callback: grpc.sendUnaryData<unknown>
): void {
  const { product_id, quantity } = call.request;
  const result = productStore.reserveStock(product_id, quantity);
  callback(null, {
    success: result.success,
    message: result.message,
    remaining_stock: result.remainingStock,
    product_name: result.productName,
    price: result.price,
  });
}

export function startGrpcServer(): void {
  const server = new grpc.Server();

  server.addService(productProto.product.ProductService.service, {
    GetProduct: getProduct,
    ReserveStock: reserveStock,
  });

  server.bindAsync(
    `0.0.0.0:${config.grpcPort}`,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error('Failed to start gRPC server:', err);
        return;
      }
      console.log(`Product gRPC server running on port ${port}`);
    }
  );
}

# Backend — Microservices

Four independent Node.js + Express + TypeScript microservices, plus Kafka for async messaging.

## Architecture

| Service | Port | Protocol | Responsibility |
|---------|------|----------|----------------|
| user-service | 3001 | REST + Kafka producer | Auth, JWT, publishes `otp.requested` |
| email-service | 3002 | REST + Kafka consumer | OTP verify (REST), email send (Kafka) |
| product-service | 3003 REST, 50051 gRPC | Catalog (REST), stock ops (gRPC) |
| order-service | 3004 | REST + gRPC client + Kafka | Buy flow, calls product gRPC, publishes `order.placed` |

Each service is fully self-contained with its own `package.json`, `.env`, and Dockerfile.

## Proto files (per service, not shared)

| Service | Proto file | Role |
|---------|-----------|------|
| product-service | `proto/product.proto` | gRPC **server** contract (owner) |
| order-service | `proto/product.client.proto` | gRPC **client** contract (consumer copy) |

## Running locally

```bash
# 1. Start Kafka
cd backend && docker compose up -d kafka

# 2. Start each service in a separate terminal
cd services/email-service   && npm install && npm run dev
cd services/user-service    && npm install && npm run dev
cd services/product-service && npm install && npm run dev
cd services/order-service   && npm install && npm run dev
```

## Service communication

```
Frontend --REST--> user-service --Kafka--> email-service
Frontend --REST--> product-service (catalog)
Frontend --REST--> order-service --gRPC--> product-service
order-service --Kafka--> email-service
user-service --REST--> email-service (OTP verify only)
```

## API overview

| Method | Endpoint | Service | Description |
|--------|----------|---------|-------------|
| POST | /api/auth/signup | user | Register, triggers OTP via Kafka |
| POST | /api/auth/login | user | Login |
| POST | /api/auth/verify-otp | user | Verify OTP |
| POST | /api/otp/verify | email | Internal OTP verification |
| GET | /api/products | product | List products |
| POST | /api/orders | order | Place order (Buy Now) |
| GET | /api/orders/mine | order | User's orders |

## Docker

```bash
cd backend && docker compose up --build
```

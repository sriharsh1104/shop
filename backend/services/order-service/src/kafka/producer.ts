import { Kafka, Producer } from 'kafkajs';
import { config } from '../config';
import { retry } from '../utils/retry';

export const TOPICS = {
  ORDER_PLACED: 'order.placed',
} as const;

export interface OrderPlacedEvent {
  email: string;
  orderId: string;
  productName: string;
  quantity: number;
  totalPrice: number;
}

let producer: Producer | null = null;

async function connectProducer(): Promise<Producer> {
  const kafka = new Kafka({
    clientId: 'order-service',
    brokers: config.kafkaBrokers,
    retry: { initialRetryTime: 300, retries: 8 },
  });
  const p = kafka.producer();
  await p.connect();
  console.log('Kafka producer connected');
  return p;
}

async function getProducer(): Promise<Producer> {
  if (!producer) {
    producer = await retry(() => connectProducer(), 'order-service-kafka');
  }
  return producer;
}

export async function publishOrderPlaced(event: OrderPlacedEvent): Promise<void> {
  const p = await getProducer();
  await p.send({
    topic: TOPICS.ORDER_PLACED,
    messages: [{ value: JSON.stringify(event) }],
  });
}

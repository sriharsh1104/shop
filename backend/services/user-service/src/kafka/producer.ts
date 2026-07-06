import { Kafka, Producer } from 'kafkajs';
import { config } from '../config';
import { retry } from '../utils/retry';

export const TOPICS = {
  OTP_REQUESTED: 'otp.requested',
} as const;

export interface OtpRequestedEvent {
  email: string;
  purpose: string;
}

let producer: Producer | null = null;

async function connectProducer(): Promise<Producer> {
  const kafka = new Kafka({
    clientId: 'user-service',
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
    producer = await retry(() => connectProducer(), 'user-service-kafka');
  }
  return producer;
}

export async function publishOtpRequested(event: OtpRequestedEvent): Promise<void> {
  const p = await getProducer();
  await p.send({
    topic: TOPICS.OTP_REQUESTED,
    messages: [{ value: JSON.stringify(event) }],
  });
}

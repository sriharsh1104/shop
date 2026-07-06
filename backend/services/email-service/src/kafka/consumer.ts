import { Kafka, Consumer } from 'kafkajs';
import { config } from '../config';
import { otpService, sendEmailNotification } from '../services/otp.service';
import { retry } from '../utils/retry';

export const TOPICS = {
  OTP_REQUESTED: 'otp.requested',
  ORDER_PLACED: 'order.placed',
} as const;

interface OtpRequestedEvent {
  email: string;
  purpose: string;
}

interface OrderPlacedEvent {
  email: string;
  orderId: string;
  productName: string;
  quantity: number;
  totalPrice: number;
}

let consumer: Consumer | null = null;

async function handleOtpRequested(event: OtpRequestedEvent): Promise<void> {
  const { email, purpose } = event;
  const { otp } = otpService.create(email, purpose);

  await sendEmailNotification(
    email,
    'Your Verification Code',
    `Your OTP for ${purpose} is: ${otp}. It expires in 10 minutes.`
  );
}

async function handleOrderPlaced(event: OrderPlacedEvent): Promise<void> {
  const { email, orderId, productName, quantity, totalPrice } = event;

  await sendEmailNotification(
    email,
    'Order Confirmation',
    `Your order #${orderId.slice(0, 8)} has been placed!\n\n` +
      `Product: ${productName}\n` +
      `Quantity: ${quantity}\n` +
      `Total: $${totalPrice.toFixed(2)}\n\n` +
      `Thank you for shopping with us!`
  );
}

async function connectConsumer(): Promise<void> {
  const kafka = new Kafka({
    clientId: 'email-service',
    brokers: config.kafkaBrokers,
    retry: { initialRetryTime: 300, retries: 8 },
  });

  consumer = kafka.consumer({ groupId: 'email-service-group' });
  await consumer.connect();
  await consumer.subscribe({
    topics: [TOPICS.OTP_REQUESTED, TOPICS.ORDER_PLACED],
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      const value = message.value?.toString();
      if (!value) return;

      try {
        if (topic === TOPICS.OTP_REQUESTED) {
          await handleOtpRequested(JSON.parse(value) as OtpRequestedEvent);
        } else if (topic === TOPICS.ORDER_PLACED) {
          await handleOrderPlaced(JSON.parse(value) as OrderPlacedEvent);
        }
      } catch (err) {
        console.error(`Failed to process ${topic} event:`, err);
      }
    },
  });

  console.log('Kafka consumer listening on otp.requested, order.placed');
}

export function startKafkaConsumer(): void {
  retry(() => connectConsumer(), 'email-service-kafka').catch((err) => {
    console.error('Kafka consumer stopped retrying:', err);
  });
}

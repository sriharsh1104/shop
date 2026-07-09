import { Kafka, Consumer } from 'kafkajs';
import { config } from '../config';
import { otpService } from '../services/otp.service';
import { sendEmail } from '../services/email.service';
import { buildOtpEmail, buildOrderEmail } from '../templates/email.templates';
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

function logOtpToConsole(email: string, purpose: string, otp: string): void {
  console.log('\n╔══════════════════════════════════════╗');
  console.log(`║  OTP for ${purpose.padEnd(24)} ║`);
  console.log('╠══════════════════════════════════════╣');
  console.log(`║  Email: ${email.padEnd(27)} ║`);
  console.log(`║  Code:  ${otp.padEnd(27)} ║`);
  console.log('╚══════════════════════════════════════╝\n');
}

async function handleOtpRequested(event: OtpRequestedEvent): Promise<void> {
  const { email, purpose } = event;
  const { otp } = await otpService.create(email, purpose);
  const { subject, html, text } = buildOtpEmail(otp, purpose);

  if (config.devLogOtp) {
    logOtpToConsole(email, purpose, otp);
  }

  try {
    await sendEmail({ to: email, subject, html, text });
    console.log(`OTP email sent for ${purpose} → ${email}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Failed to send OTP email to ${email}: ${message}`);
    if (config.devLogOtp) {
      console.warn('[DEV] Email failed — use the OTP printed above to verify.');
      return;
    }
    throw err;
  }
}

async function handleOrderPlaced(event: OrderPlacedEvent): Promise<void> {
  const { email, orderId, productName, quantity, totalPrice } = event;
  const { subject, html, text } = buildOrderEmail(orderId, productName, quantity, totalPrice);

  await sendEmail({ to: email, subject, html, text });
  console.log(`Order confirmation sent → ${email}`);
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

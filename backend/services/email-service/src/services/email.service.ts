import { Resend } from 'resend';
import { config } from '../config';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
}

let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    resendClient = new Resend(config.resendApiKey);
  }
  return resendClient;
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams): Promise<void> {
  if (!config.resendApiKey) {
    console.log(`\n[DEV] Email to: ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Body: ${text}\n`);
    return;
  }

  const { error } = await getResendClient().emails.send({
    from: config.fromEmail,
    to,
    subject,
    html,
    text,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }

  console.log(`Email sent to ${to} — ${subject}`);
}

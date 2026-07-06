import { config } from '../config';

export function buildOtpEmail(otp: string, purpose: string): { subject: string; html: string; text: string } {
  const purposeLabel =
    purpose === 'signup' ? 'account signup' : purpose === 'login' ? 'login' : purpose;

  const subject = 'Your Shop verification code';
  const text = `Your verification code for ${purposeLabel} is: ${otp}. It expires in ${config.otpExpiryMinutes} minutes.`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; padding: 32px;">
  <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
    <h2 style="margin: 0 0 8px; color: #111;">Verify your email</h2>
    <p style="color: #555; margin: 0 0 24px;">Use this code to complete your ${purposeLabel}:</p>
    <div style="background: #f0f4ff; border-radius: 8px; padding: 20px; text-align: center; letter-spacing: 8px; font-size: 32px; font-weight: 700; color: #1a56db;">
      ${otp}
    </div>
    <p style="color: #888; font-size: 13px; margin: 24px 0 0;">This code expires in ${config.otpExpiryMinutes} minutes. If you didn't request this, ignore this email.</p>
  </div>
</body>
</html>`.trim();

  return { subject, html, text };
}

export function buildOrderEmail(
  orderId: string,
  productName: string,
  quantity: number,
  totalPrice: number
): { subject: string; html: string; text: string } {
  const subject = `Order confirmed — #${orderId.slice(0, 8)}`;
  const text =
    `Your order #${orderId.slice(0, 8)} has been placed!\n\n` +
    `Product: ${productName}\nQuantity: ${quantity}\nTotal: $${totalPrice.toFixed(2)}\n\n` +
    `Thank you for shopping with us!`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; padding: 32px;">
  <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
    <h2 style="margin: 0 0 8px; color: #111;">Order confirmed</h2>
    <p style="color: #555; margin: 0 0 16px;">Order <strong>#${orderId.slice(0, 8)}</strong></p>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
      <tr><td style="padding: 8px 0; color: #555;">Product</td><td style="padding: 8px 0; text-align: right;">${productName}</td></tr>
      <tr><td style="padding: 8px 0; color: #555;">Quantity</td><td style="padding: 8px 0; text-align: right;">${quantity}</td></tr>
      <tr><td style="padding: 8px 0; color: #555; font-weight: 600;">Total</td><td style="padding: 8px 0; text-align: right; font-weight: 600;">$${totalPrice.toFixed(2)}</td></tr>
    </table>
    <p style="color: #888; font-size: 13px; margin: 0;">Thank you for shopping with us!</p>
  </div>
</body>
</html>`.trim();

  return { subject, html, text };
}

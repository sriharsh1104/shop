import { useState, useRef, FormEvent, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services';
import { useAuth } from '../context/AuthContext';
import { AuthLayout, Button } from '../components/common/FormElements';

const OTP_LENGTH = 6;

export default function OtpPage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const otp = digits.join('');

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    const next = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((d, i) => (next[i] = d));
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (otp.length !== OTP_LENGTH) {
      setError('Please enter the full 6-digit code');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await userService.verifyOtp(otp);
      setUser(res.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    try {
      await userService.resendOtp();
      setDigits(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout
      title="Verify your email"
      subtitle={`We sent a 6-digit code to ${user?.email || 'your email'}`}
    >
      <form onSubmit={handleSubmit} className="auth-form">
        {error && <div className="alert alert-error">{error}</div>}

        <div className="otp-inputs" onPaste={handlePaste}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="otp-digit"
              autoFocus={i === 0}
            />
          ))}
        </div>

        <Button type="submit" loading={loading} className="btn-full" disabled={otp.length !== OTP_LENGTH}>
          Verify Email
        </Button>

        <p className="auth-footer">
          Didn&apos;t receive the code?{' '}
          <button type="button" className="link-btn" onClick={handleResend} disabled={resending}>
            {resending ? 'Sending...' : 'Resend OTP'}
          </button>
        </p>

        <p className="dev-hint">
          Check your inbox for the 6-digit verification code.
        </p>
      </form>
    </AuthLayout>
  );
}

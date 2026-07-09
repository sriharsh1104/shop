import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { userService } from '../services';
import { useAuth } from '../context/AuthContext';
import { AuthLayout, Button } from '../components/common/FormElements';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export default function OtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser, logout } = useAuth();
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [shake, setShake] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const verifyingRef = useRef(false);

  const from = (location.state as { from?: string } | null)?.from;
  const backPath = from === 'signup' ? '/signup' : '/login';
  const backLabel = from === 'signup' ? 'Back to signup' : 'Back to sign in';

  const otp = digits.join('');

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    setError('');
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
    setError('');
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const verify = async (code: string) => {
    if (verifyingRef.current) return;
    verifyingRef.current = true;
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await userService.verifyOtp(code);
      setUser(res.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
      triggerShake();
      setDigits(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
      verifyingRef.current = false;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (otp.length !== OTP_LENGTH) {
      setError('Please enter the full 6-digit code');
      triggerShake();
      return;
    }
    await verify(otp);
  };

  useEffect(() => {
    if (otp.length === OTP_LENGTH && !loading) {
      verify(otp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  const handleResend = async () => {
    if (cooldown > 0) return;
    setResending(true);
    setError('');
    setSuccess('');
    try {
      await userService.resendOtp();
      setDigits(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
      setCooldown(RESEND_COOLDOWN);
      setSuccess('A new code has been sent to your email');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  const handleBack = async () => {
    await logout();
    navigate(backPath);
  };

  return (
    <AuthLayout
      title="Verify your email"
      subtitle={`We sent a 6-digit code to ${user?.email || 'your email'}`}
      showBack
      onBack={handleBack}
      backLabel={backLabel}
      step={{ current: 2, total: 2 }}
    >
      <form onSubmit={handleSubmit} className="auth-form">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className={`otp-inputs${shake ? ' shake' : ''}`} onPaste={handlePaste}>
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
              className={`otp-digit${digit ? ' filled' : ''}`}
              autoFocus={i === 0}
              disabled={loading}
              aria-label={`Digit ${i + 1}`}
            />
          ))}
        </div>

        <Button type="submit" loading={loading} className="btn-full" disabled={otp.length !== OTP_LENGTH}>
          Verify Email
        </Button>

        <p className="auth-footer">
          Didn&apos;t receive the code?{' '}
          {cooldown > 0 ? (
            <span className="otp-resend-timer">Resend in {cooldown}s</span>
          ) : (
            <button type="button" className="link-btn" onClick={handleResend} disabled={resending}>
              {resending ? 'Sending...' : 'Resend OTP'}
            </button>
          )}
        </p>

        <p className="dev-hint">
          Check your inbox for the 6-digit verification code.
        </p>
      </form>
    </AuthLayout>
  );
}

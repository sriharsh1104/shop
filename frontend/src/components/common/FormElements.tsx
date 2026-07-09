import { useState } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, id, ...props }: InputProps) {
  const inputId = id || label.toLowerCase().replace(/\s/g, '-');
  return (
    <div className="form-group">
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        className={error ? 'input-error' : ''}
        aria-invalid={!!error}
        {...props}
      />
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export function PasswordInput({ label, error, id, ...props }: InputProps) {
  const [visible, setVisible] = useState(false);
  const inputId = id || label.toLowerCase().replace(/\s/g, '-');

  return (
    <div className="form-group">
      <label htmlFor={inputId}>{label}</label>
      <div className="input-with-toggle">
        <input
          id={inputId}
          type={visible ? 'text' : 'password'}
          className={error ? 'input-error' : ''}
          aria-invalid={!!error}
          {...props}
        />
        <button
          type="button"
          className="password-toggle-btn"
          onClick={() => setVisible((v) => !v)}
          tabIndex={-1}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

function ChevronLeftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

export function BackButton({ onClick, label = 'Back' }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" className="auth-back-btn" onClick={onClick}>
      <ChevronLeftIcon />
      <span>{label}</span>
    </button>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  loading,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className="btn-spinner" /> : children}
    </button>
  );
}

export function AuthLayout({
  title,
  subtitle,
  children,
  showBack,
  onBack,
  backLabel,
  step,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  backLabel?: string;
  step?: { current: number; total: number };
}) {
  return (
    <div className="auth-layout">
      <div className="auth-bg-orbs" aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>
      <div className="auth-card">
        {showBack && onBack && <BackButton onClick={onBack} label={backLabel} />}
        {step && (
          <div className="auth-steps" aria-label={`Step ${step.current} of ${step.total}`}>
            {Array.from({ length: step.total }, (_, i) => (
              <div
                key={i}
                className={`auth-step-dot ${i < step.current ? 'done' : ''} ${i === step.current - 1 ? 'active' : ''}`}
              />
            ))}
          </div>
        )}
        <div className="auth-header">
          <div className="logo">Shop</div>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}

import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userService } from '../services';
import { useAuth } from '../context/AuthContext';
import { AuthLayout, Input, PasswordInput, Button } from '../components/common/FormElements';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await userService.login({ email, password });
      if (res.token && res.user) {
        login(res.token, res.user);
        navigate(
          res.requiresOtp ? '/verify-otp' : '/dashboard',
          res.requiresOtp ? { state: { from: 'login' } } : undefined,
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account"
      showBack
      onBack={() => navigate(-1)}
      backLabel="Back"
      step={{ current: 1, total: 2 }}
    >
      <form onSubmit={handleSubmit} className="auth-form">
        {error && <div className="alert alert-error">{error}</div>}

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
        />

        <PasswordInput
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete="current-password"
        />

        <Button type="submit" loading={loading} className="btn-full">
          Sign In
        </Button>

        <p className="auth-footer">
          Don&apos;t have an account? <Link to="/signup">Sign up</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

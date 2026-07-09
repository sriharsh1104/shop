import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userService } from '../services';
import { useAuth } from '../context/AuthContext';
import { AuthLayout, Input, PasswordInput, Button } from '../components/common/FormElements';

export default function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    email: '',
    username: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await userService.signup({
        email: form.email,
        username: form.username,
        phone: form.phone,
        password: form.password,
      });
      if (res.token && res.user) {
        login(res.token, res.user);
        navigate('/verify-otp', { state: { from: 'signup' } });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create account"
      subtitle="Join Shop and start shopping"
      showBack
      onBack={() => navigate('/login')}
      backLabel="Sign in"
      step={{ current: 1, total: 2 }}
    >
      <form onSubmit={handleSubmit} className="auth-form">
        {error && <div className="alert alert-error">{error}</div>}

        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={update('email')}
          placeholder="you@example.com"
          required
          autoComplete="email"
        />

        <Input
          label="Username"
          type="text"
          value={form.username}
          onChange={update('username')}
          placeholder="johndoe"
          required
          autoComplete="username"
        />

        <Input
          label="Phone Number"
          type="tel"
          value={form.phone}
          onChange={update('phone')}
          placeholder="9876543210"
          required
          autoComplete="tel"
        />

        <PasswordInput
          label="Password"
          value={form.password}
          onChange={update('password')}
          placeholder="Min. 6 characters"
          required
          minLength={6}
          autoComplete="new-password"
        />

        <PasswordInput
          label="Confirm Password"
          value={form.confirmPassword}
          onChange={update('confirmPassword')}
          placeholder="••••••••"
          required
          autoComplete="new-password"
        />

        <Button type="submit" loading={loading} className="btn-full">
          Create Account
        </Button>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

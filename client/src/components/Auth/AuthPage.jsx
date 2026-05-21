import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function AuthPage() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        if (form.username.length < 3)
          return setError('Username must be at least 3 characters');
        if (form.password.length < 6)
          return setError('Password must be at least 6 characters');
        await register(form.username, form.email, form.password);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const toggle = () => {
    setIsLogin(!isLogin);
    setError('');
    setForm({ username: '', email: '', password: '' });
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-logo">
          <div className="auth-logo-icon">💬</div>
          <h1>ChatterBox</h1>
          <p>Your place to talk</p>
        </div>

        <h2>{isLogin ? 'Welcome back!' : 'Create an account'}</h2>
        <p className="auth-subtitle">
          {isLogin ? "We're so excited to see you again!" : 'Join thousands of users worldwide'}
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label>USERNAME</label>
              <input
                type="text"
                placeholder="cool_username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>EMAIL</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>PASSWORD</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Loading...' : isLogin ? 'Log In' : 'Continue'}
          </button>
        </form>

        <p className="auth-switch">
          {isLogin ? "Need an account? " : "Already have an account? "}
          <span onClick={toggle}>
            {isLogin ? 'Register' : 'Log in'}
          </span>
        </p>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { login, register } from './api';
import TaskList from './TaskList';

export default function App() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        await register(email, password);
      }
      const data = await login(email, password);
      localStorage.setItem('token', data.token);
      setToken(data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (token) {
    return (
      <TaskList
        token={token}
        onLogout={() => {
          localStorage.removeItem('token');
          setToken(null);
        }}
      />
    );
  }

  return (
    <div style={{ padding: 32, fontFamily: 'system-ui', maxWidth: 360 }}>
      <h1>{mode === 'login' ? 'Log in' : 'Create account'}</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          style={{ display: 'block', width: '100%', marginBottom: 8, padding: 8 }}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          style={{ display: 'block', width: '100%', marginBottom: 8, padding: 8 }}
        />
        <button type="submit" disabled={loading} style={{ padding: '8px 16px' }}>
          {loading ? 'Working…' : mode === 'login' ? 'Log in' : 'Sign up'}
        </button>
      </form>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      <button
        onClick={() => {
          setMode(mode === 'login' ? 'register' : 'login');
          setError(null);
        }}
        style={{ marginTop: 16, background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}
      >
        {mode === 'login' ? 'Need an account?' : 'Already have an account?'}
      </button>
    </div>
  );
}
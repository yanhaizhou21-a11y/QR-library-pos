import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'var(--bg-secondary)',
      padding: 'var(--space-4)'
    }}>
      <div className="card" style={{ maxWidth: '420px', width: '100%' }}>
        <div className="card-header">
          <h1 className="card-title" style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>
            Masuk
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            Masuk ke akun Pustaka Library Anda
          </p>
        </div>

        <div className="card-body">
          {error && (
            <div className="alert alert-error" style={{ marginBottom: 'var(--space-5)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@contoh.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-5)' }}>
              <Link 
                to="/forgot-password" 
                style={{ 
                  fontSize: 'var(--text-sm)', 
                  color: 'var(--primary)',
                  textDecoration: 'none'
                }}
              >
                Lupa password?
              </Link>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>
        </div>

        <div className="card-footer">
          <p style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            Belum punya akun?{' '}
            <Link 
              to="/register" 
              style={{ 
                color: 'var(--primary)', 
                fontWeight: 'var(--weight-medium)',
                textDecoration: 'none'
              }}
            >
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

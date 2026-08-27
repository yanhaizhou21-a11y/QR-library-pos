import { FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';

  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      return setError('Password minimal 6 karakter');
    }

    if (password !== password2) {
      return setError('Konfirmasi password tidak cocok');
    }

    setLoading(true);
    try {
      const data = await api.post<{ message: string }>('/auth/reset-password', { token, password });
      alert(data.message || 'Password berhasil direset');
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Gagal reset password');
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
            Reset Password
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            Masukkan password baru Anda
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
              <label className="form-label" htmlFor="password">
                Password Baru
              </label>
              <input
                id="password"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                required
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password2">
                Konfirmasi Password
              </label>
              <input
                id="password2"
                type="password"
                className="form-input"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                placeholder="Ketik ulang password"
                required
                autoComplete="new-password"
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginBottom: 'var(--space-4)' }}
              disabled={loading}
            >
              {loading ? 'Memproses...' : 'Reset Password'}
            </button>

            <Link 
              to="/login" 
              className="btn btn-secondary"
              style={{ width: '100%', display: 'inline-flex' }}
            >
              Kembali ke Login
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}

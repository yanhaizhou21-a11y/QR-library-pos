import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setInfo(null);
    setLoading(true);

    try {
      const data = await api.post<{ message: string; resetToken?: string }>('/auth/forgot-password', { email });
      setInfo(data.message || 'Link reset password telah dikirim ke email Anda');
    } catch (err: any) {
      setError(err.message || 'Gagal mengirim link reset password');
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
            Lupa Password
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            Masukkan email Anda untuk menerima link reset password
          </p>
        </div>

        <div className="card-body">
          {error && (
            <div className="alert alert-error" style={{ marginBottom: 'var(--space-5)' }}>
              {error}
            </div>
          )}

          {info && (
            <div className="alert alert-success" style={{ marginBottom: 'var(--space-5)' }}>
              {info}
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

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginBottom: 'var(--space-4)' }}
              disabled={loading}
            >
              {loading ? 'Mengirim...' : 'Kirim Link Reset'}
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

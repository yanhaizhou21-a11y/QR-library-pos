import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
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
      await register(nama, email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Pendaftaran gagal');
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
            Daftar Akun
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            Buat akun Pustaka Library baru
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
              <label className="form-label" htmlFor="nama">
                Nama Lengkap
              </label>
              <input
                id="nama"
                type="text"
                className="form-input"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Nama Anda"
                required
                autoComplete="name"
              />
            </div>

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
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? 'Memproses...' : 'Daftar'}
            </button>
          </form>
        </div>

        <div className="card-footer">
          <p style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            Sudah punya akun?{' '}
            <Link 
              to="/login" 
              style={{ 
                color: 'var(--primary)', 
                fontWeight: 'var(--weight-medium)',
                textDecoration: 'none'
              }}
            >
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

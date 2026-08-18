import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const u = await login(email, password);
      navigate(u.role === 'admin' ? '/admin' : '/', { replace: true });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (user) {
    navigate('/', { replace: true });
    return null;
  }

  return (
    <div className="container-narrow page">
      <div className="auth-wrap">
        <h2 style={{ textAlign: 'center' }}>Masuk</h2>
        <p className="muted small" style={{ textAlign: 'center', marginTop: -4 }}>Selamat datang kembali!</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form className="form" onSubmit={submit}>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button className="btn btn-primary btn-lg btn-block" disabled={busy}>
            {busy ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
        <div className="flex-between small mt-2">
          <Link to="/lupa-password">Lupa password?</Link>
          <span className="muted">
            Belum punya akun? <Link to="/daftar">Daftar</Link>
          </span>
        </div>
        <div className="divider" />
        <p className="small muted" style={{ textAlign: 'center', margin: 0 }}>
          Demo: <strong>admin@pustaka.id / admin123</strong> · <strong>budi@pustaka.id / member123</strong>
        </p>
      </div>
    </div>
  );
}
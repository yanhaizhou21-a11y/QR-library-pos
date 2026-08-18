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
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) return setError('Password minimal 6 karakter.');
    if (password !== password2) return setError('Konfirmasi password tidak cocok.');
    setBusy(true);
    try {
      await register(nama, email, password, phone);
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-narrow page">
      <div className="auth-wrap">
        <h2 style={{ textAlign: 'center' }}>Daftar Anggota</h2>
        <p className="muted small" style={{ textAlign: 'center', marginTop: -4 }}>
          Dapatkan kartu anggota digital berisi QR untuk transaksi mandiri.
        </p>
        {error && <div className="alert alert-error">{error}</div>}
        <form className="form" onSubmit={submit}>
          <div className="field">
            <label>Nama lengkap</label>
            <input value={nama} onChange={(e) => setNama(e.target.value)} required autoFocus />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label>No. HP (opsional)</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="form-row">
            <div className="field">
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="field">
              <label>Konfirmasi</label>
              <input type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} required />
            </div>
          </div>
          <button className="btn btn-primary btn-lg btn-block" disabled={busy}>
            {busy ? 'Membuat akun...' : 'Daftar'}
          </button>
        </form>
        <p className="small muted mt-2" style={{ textAlign: 'center', marginBottom: 0 }}>
          Sudah punya akun? <Link to="/masuk">Masuk</Link>
        </p>
      </div>
    </div>
  );
}
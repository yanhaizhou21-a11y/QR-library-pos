import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const d = await api.post<{ message: string; resetToken?: string }>('/auth/forgot-password', { email });
      setInfo(
        d.resetToken
          ? `${d.message} Berikut tautan untuk pengembangan (mode demo): /reset-password?token=${d.resetToken}`
          : d.message,
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-narrow page">
      <div className="auth-wrap">
        <h2>Pulihkan Kata Sandi</h2>
        <p className="muted small">Masukkan email terdaftar, tautan reset akan dikirim.</p>
        {info && <div className="alert alert-ok">{info}</div>}
        {error && <div className="alert alert-error">{error}</div>}
        <form className="form" onSubmit={submit}>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          </div>
          <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Mengirim...' : 'Kirim Tautan Reset'}</button>
        </form>
        <p className="small mt-2" style={{ marginBottom: 0 }}>
          <Link to="/masuk">← Kembali ke masuk</Link>
        </p>
      </div>
    </div>
  );
}
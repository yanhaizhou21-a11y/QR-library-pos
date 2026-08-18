import { FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const d = await api.post<{ message: string }>('/auth/reset-password', { token, password });
      setInfo(d.message);
      setTimeout(() => navigate('/masuk'), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-narrow page">
      <div className="auth-wrap">
        <h2>Atur Password Baru</h2>
        {info && <div className="alert alert-ok">{info}</div>}
        {error && <div className="alert alert-error">{error}</div>}
        {!token ? (
          <p className="muted small">Tautan reset tidak valid. <Link to="/lupa-password">Minta ulang</Link></p>
        ) : (
          <form className="form" onSubmit={submit}>
            <div className="field">
              <label>Password baru (min. 6 karakter)</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Menyimpan...' : 'Simpan Password'}</button>
          </form>
        )}
      </div>
    </div>
  );
}
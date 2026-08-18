import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, authImageUrl } from '../api/client';
import { StatusBadge } from '../components/ui';

export default function Profile() {
  const { user, logout, refreshUser } = useAuth();
  const [nama, setNama] = useState(user?.nama || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === 'member') {
      authImageUrl('/auth/me/qr')
        .then(setQrUrl)
        .catch(() => setQrUrl(null));
    }
  }, [user]);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    setError('');
    try {
      await api.put('/auth/me', { nama, phone });
      await refreshUser();
      setMsg('Profil berhasil diperbarui.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container-narrow page">
      <div className="page-head">
        <h2>Profil & Kartu Anggota</h2>
        <p className="muted small" style={{ margin: 0 }}>Data diri & kartu digital untuk transaksi QR</p>
      </div>

      <div className="card mb-2" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div className="avatar" style={{ width: 64, height: 64, fontSize: 26 }}>{user.nama.charAt(0)}</div>
        <h2 style={{ marginTop: 10, marginBottom: 0 }}>{user.nama}</h2>
        <p className="muted small" style={{ margin: '4px 0 10px' }}>{user.email}</p>
        <div className="flex gap-sm">
          <span className="badge badge-gray">No. anggota: {user.no_anggota}</span>
          <StatusBadge status={user.status} />
          <span className="badge badge-blue">Kartu digital</span>
        </div>
        {user.role === 'member' && qrUrl && (
          <img
            src={qrUrl}
            alt="QR kartu anggota"
            width={200}
            height={200}
            style={{ borderRadius: 12, border: '1px solid var(--line)', marginTop: 16 }}
          />
        )}
        {user.role === 'member' && (
          <p className="small muted" style={{ maxWidth: 420 }}>Tunjukkan QR ini kepada petugas atau pindai sendiri untuk meminjam buku. QR ini unik untuk akun Anda.</p>
        )}
      </div>

      <div className="card">
        <h3>Ubah Data Diri</h3>
        {msg && <div className="alert alert-ok">{msg}</div>}
        {error && <div className="alert alert-error">{error}</div>}
        <form className="form" onSubmit={save}>
          <div className="field">
            <label>Nama</label>
            <input value={nama} onChange={(e) => setNama(e.target.value)} required />
          </div>
          <div className="field">
            <label>No. HP</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="flex gap-sm">
            <button className="btn btn-primary" disabled={busy}>{busy ? 'Menyimpan...' : 'Simpan'}</button>
            <button type="button" className="btn btn-danger" onClick={logout}>Keluar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
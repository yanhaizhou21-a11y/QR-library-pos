import { FormEvent, useState } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import {
  Download,
  Copy,
  Check,
  LogOut,
  Save,
  Mail,
  Phone,
  User,
  Calendar,
  Shield,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export default function Profile() {
  const { user, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    nama: user?.nama || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const qrValue = JSON.stringify({ uid: user?.id, no: user?.no_anggota });

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.put('/users/me', form);
      setEditing(false);
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const downloadQR = () => {
    const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `qr-${user?.no_anggota}.png`;
    link.click();
  };

  const copyQR = async () => {
    try {
      await navigator.clipboard.writeText(qrValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e: any) {
      console.error(e);
    }
  };

  if (!user) return null;

  return (
    <div className="container-narrow page">
      <div className="page-head">
        <h2>Profil Anggota</h2>
        <p className="muted small" style={{ margin: 0 }}>
          Kelola informasi dan QR code anggota
        </p>
      </div>

      <div className="card">
        <div className="flex gap" style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div className="flex gap-sm" style={{ alignItems: 'center', marginBottom: 16 }}>
              <div
                className="avatar"
                style={{
                  width: 64,
                  height: 64,
                  background: 'var(--primary)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  fontWeight: 700,
                  borderRadius: 8,
                }}
              >
                {user.nama.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 style={{ margin: 0 }}>{user.nama}</h3>
                <div className="badge badge-green mt-1">
                  {user.role === 'admin' ? 'Administrator' : 'Anggota'}
                </div>
              </div>
            </div>

            {editing ? (
              <form onSubmit={handleSave}>
                <div className="form-group">
                  <label>Nama Lengkap</label>
                  <div className="input-icon">
                    <User size={18} />
                    <input
                      type="text"
                      value={form.nama}
                      onChange={(e) => setForm({ ...form, nama: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <div className="input-icon">
                    <Mail size={18} />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>No. HP</label>
                  <div className="input-icon">
                    <Phone size={18} />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                </div>

                {error && (
                  <div className="alert alert-error">
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex gap-sm">
                  <button type="submit" className="btn btn-primary">
                    <Save size={18} />
                    Simpan
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => {
                      setEditing(false);
                      setForm({ nama: user.nama, email: user.email, phone: user.phone || "" });
                    }}
                  >
                    Batal
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="info-row">
                  <Mail size={18} className="text-muted" />
                  <span>{user.email}</span>
                </div>
                <div className="info-row">
                  <Phone size={18} className="text-muted" />
                  <span>{user.phone || '-'}</span>
                </div>
                <div className="info-row">
                  <Shield size={18} className="text-muted" />
                  <span>No. Anggota: {user.no_anggota}</span>
                </div>
                <div className="info-row">
                  <Calendar size={18} className="text-muted" />
                  <span>Bergabung: {new Date(user.created_at || "").toLocaleDateString('id-ID')}</span>
                </div>

                <div className="flex gap-sm mt-2">
                  <button className="btn btn-primary" onClick={() => setEditing(true)}>
                    Edit Profil
                  </button>
                  <button className="btn btn-ghost" onClick={logout}>
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>

          <div
            className="qr-section"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              padding: 20,
              background: 'var(--bg-secondary)',
              borderRadius: 8,
            }}
          >
            <div
              style={{
                padding: 16,
                background: 'white',
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
            >
              <QRCodeSVG value={qrValue} size={180} level="H" />
              <div style={{ display: 'none' }}>
                <QRCodeCanvas id="qr-canvas" value={qrValue} size={512} level="H" />
              </div>
            </div>

            <p className="small muted text-center" style={{ margin: 0, maxWidth: 200 }}>
              Scan QR ini untuk pinjam/kembalikan buku
            </p>

            <div className="flex gap-sm">
              <button className="btn btn-sm" onClick={downloadQR}>
                <Download size={16} />
                Download
              </button>
              <button className="btn btn-sm" onClick={copyQR}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Tersalin!' : 'Salin'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

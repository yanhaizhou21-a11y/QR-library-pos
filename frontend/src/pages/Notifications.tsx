import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { fmtDateTime } from '../components/ui';

interface Notif {
  id: number;
  tipe: string;
  pesan: string;
  is_read: boolean;
  created_at: string;
}

const ICONS: Record<string, string> = { reminder: '⏰', reservasi: '🔖', denda: '💸', info: '📢' };

export default function Notifications() {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api
      .get<{ notifications: Notif[] }>('/notifications/me')
      .then((d: any) => setNotifs(d.notifications))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (id: number) => {
    await api.post(`/notifications/${id}/read`);
    setNotifs((ns) => ns.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const readAll = async () => {
    await api.post('/notifications/read-all');
    setNotifs((ns) => ns.map((n) => ({ ...n, is_read: true })));
  };

  if (loading) return <div className="container page-loading">Memuat notifikasi...</div>;

  return (
    <div className="container-narrow page">
      <div className="page-head flex-between">
        <div>
          <h2>Notifikasi</h2>
          <p className="muted small" style={{ margin: 0 }}>
            Reminder, reservasi, dan info transaksi
          </p>
        </div>
        <button className="btn btn-sm" onClick={readAll}>
          Tandai semua dibaca
        </button>
      </div>
      {notifs.length === 0 ? (
        <div className="empty">Belum ada notifikasi.</div>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {notifs.map((n) => (
            <div
              key={n.id}
              className="card"
              style={
                n.is_read
                  ? { opacity: 0.65 }
                  : { borderColor: 'var(--primary)', cursor: 'pointer' }
              }
              onClick={() => !n.is_read && markRead(n.id)}
            >
              <div className="flex gap-sm" style={{ alignItems: 'flex-start' }}>
                <span style={{ fontSize: 20 }}>{ICONS[n.tipe] || '📢'}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0 }}>{n.pesan}</p>
                  <div className="small muted mt-1">{fmtDateTime(n.created_at)}</div>
                </div>
                {!n.is_read && <span className="badge badge-blue">Baru</span>}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-2">
        <Link to="/pinjaman" className="btn">
          Lihat Pinjaman →
        </Link>
      </div>
    </div>
  );
}

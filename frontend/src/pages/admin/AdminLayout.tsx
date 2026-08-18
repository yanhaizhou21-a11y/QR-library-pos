import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LINKS = [
  { to: '/admin', icon: '📊', label: 'Ringkasan', end: true },
  { to: '/admin/buku', icon: '📚', label: 'Kelola Buku' },
  { to: '/admin/transaksi', icon: '🔁', label: 'Transaksi' },
  { to: '/admin/anggota', icon: '👥', label: 'Anggota' },
  { to: '/admin/denda', icon: '💸', label: 'Denda' },
  { to: '/admin/reservasi', icon: '🔖', label: 'Reservasi' },
  { to: '/admin/laporan', icon: '📈', label: 'Laporan' },
  { to: '/admin/pengaturan', icon: '⚙️', label: 'Pengaturan' },
];

export default function AdminLayout() {
  const { user } = useAuth();
  return (
    <div className="admin-layout">
      <aside className="admin-side">
        <div className="small" style={{ padding: '4px 12px 12px', color: '#64748b', fontWeight: 700, letterSpacing: '.05em' }}>
          PANEL ADMIN
        </div>
        {LINKS.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end}>
            <span>{l.icon}</span>
            <span>{l.label}</span>
          </NavLink>
        ))}
        <NavLink to="/" end>
          <span>🏠</span><span>Buka Situs</span>
        </NavLink>
        <div className="small" style={{ padding: '14px 12px 0', color: '#64748b' }}>
          Masuk sebagai<br /><strong style={{ color: '#e2e8f0' }}>{user?.nama}</strong>
        </div>
      </aside>
      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  );
}
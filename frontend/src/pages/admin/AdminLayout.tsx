import { NavLink, Outlet, Link } from 'react-router-dom';
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
        <Link to="/" className="admin-brand">
          <span className="brand-logo">P</span>
          <span>Pustaka Admin</span>
        </Link>
        <div className="admin-group-label">MENU</div>
        {LINKS.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end}>
            <span>{l.icon}</span>
            <span>{l.label}</span>
          </NavLink>
        ))}
        <div className="admin-divider" />
        <NavLink to="/" end>
          <span>🏠</span>
          <span>Buka Situs</span>
        </NavLink>
        <div className="admin-user">
          <div className="avatar" style={{ width: 28, height: 28, fontSize: 12 }}>
            {(user?.nama || '?').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="small" style={{ color: '#e2e8f0', fontWeight: 700 }}>
              {user?.nama}
            </div>
            <div className="small" style={{ color: '#64748b' }}>Administrator</div>
          </div>
        </div>
      </aside>
      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  );
}

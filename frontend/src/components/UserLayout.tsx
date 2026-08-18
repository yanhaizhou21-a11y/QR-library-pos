import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

function useUnread() {
  const [unread, setUnread] = useState(0);
  const location = useLocation();
  useEffect(() => {
    if (!localStorage.getItem('pq_access')) return;
    let alive = true;
    const load = () =>
      api
        .get<{ unread: number }>('/notifications/me')
        .then((d) => alive && setUnread(d.unread))
        .catch(() => undefined);
    load();
    const t = setInterval(load, 30000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [location.pathname]);
  return unread;
}

export default function UserLayout() {
  const { user } = useAuth();
  const unread = useUnread();
  const initial = (user?.nama || '?').charAt(0).toUpperCase();

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="brand">
            <span className="brand-logo">P</span>
            <span className="brand-text">Pustaka QR</span>
          </Link>
          <div className="nav-links">
            <NavLink to="/" end className="nav-link">
              Beranda
            </NavLink>
            <NavLink to="/katalog" className="nav-link">
              Katalog
            </NavLink>
            <NavLink to="/scan" className="nav-link">
              Pindai QR
            </NavLink>
            {user?.role === 'admin' && (
              <NavLink to="/admin" className="nav-link">
                Panel Admin
              </NavLink>
            )}
          </div>
          <div className="nav-actions">
            {user ? (
              <>
                <Link to="/notifikasi" className="notif-bell" title="Notifikasi">
                  🔔
                  {unread > 0 && <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>}
                </Link>
                <Link to="/pinjaman" className="nav-link small">
                  Pinjaman
                </Link>
                <Link to="/profil" className="avatar" title={user.nama}>
                  {initial}
                </Link>
              </>
            ) : (
              <>
                <Link to="/masuk" className="btn btn-sm btn-ghost">
                  Masuk
                </Link>
                <Link to="/daftar" className="btn btn-sm btn-primary">
                  Daftar Anggota
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <h4>Pustaka QR</h4>
              <p>
                Sistem POS perpustakaan berbasis QR code untuk peminjaman dan pengembalian buku yang cepat,
                akurat, dan tercatat real-time.
              </p>
            </div>
            <div>
              <h4>Navigasi</h4>
              <div style={{ display: 'grid', gap: 6 }}>
                <Link to="/katalog">Katalog Buku</Link>
                <Link to="/scan">Pindai QR</Link>
                <Link to="/daftar">Daftar Anggota</Link>
              </div>
            </div>
            <div>
              <h4>Layanan</h4>
              <div style={{ display: 'grid', gap: 6 }}>
                <span>Jam operasional: 08.00–20.00</span>
                <span>Jalan Perpustakaan No. 1</span>
                <span>📞 (021) 555-0123</span>
                <span>✉️ halo@pustaka.id</span>
              </div>
            </div>
          </div>
          <p className="small" style={{ marginTop: 24, opacity: 0.7 }}>
            © {new Date().getFullYear()} Pustaka QR. Dibangun dengan Vite, React, Express & SQLite.
          </p>
        </div>
      </footer>
    </>
  );
}
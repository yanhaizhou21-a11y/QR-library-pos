import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../api/client';
import { Logo } from './library/logo';
import { ThemeIcon, BellIcon, DashboardIcon } from './library/icons';
import { QrCode, BookOpen, ShieldCheck, Sparkles } from 'lucide-react';

function useUnread() {
  const [unread, setUnread] = useState(0);
  const location = useLocation();
  useEffect(() => {
    if (!localStorage.getItem('pq_access')) return;
    let alive = true;
    const load = () =>
      api
        .get<{ unread: number }>('/api/notifications/me')
        .then((d) => alive && setUnread(d.unread))
        .catch(() => {});
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
  const { theme, toggle } = useTheme();
  const initial = (user?.nama || '?').charAt(0).toUpperCase();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Sticky Blur Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/85 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <Logo className="size-8 transition-transform group-hover:scale-105" />
              <span className="text-lg font-bold tracking-tight text-foreground">
                Pustaka <span className="text-primary font-mono">QR</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`
                }
              >
                Beranda
              </NavLink>
              <NavLink
                to="/katalog"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`
                }
              >
                Katalog Buku
              </NavLink>
              <NavLink
                to="/scan"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`
                }
              >
                <QrCode className="size-3.5" />
                Pindai QR Loket
              </NavLink>
              {user?.role === 'admin' && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 text-blue-600 dark:text-blue-400 ${
                      isActive ? 'bg-blue-500/10' : 'hover:bg-blue-500/10'
                    }`
                  }
                >
                  <DashboardIcon className="size-4" />
                  Admin Console
                </NavLink>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggle}
              aria-label="Toggle dark/light theme"
              className="size-9 rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <ThemeIcon className="size-4" />
            </button>

            {user ? (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/notifikasi"
                  className="relative size-9 rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-xs"
                  title="Notifikasi"
                >
                  <BellIcon className="size-4" />
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center font-mono ring-2 ring-background">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </Link>
                <Link
                  to="/pinjaman"
                  className="hidden sm:inline-flex px-3 py-1.5 rounded-lg text-xs font-semibold border border-border bg-secondary hover:bg-muted transition-colors"
                >
                  Pinjaman Saya
                </Link>
                <Link
                  to="/profil"
                  className="size-9 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white font-bold text-sm flex items-center justify-center shadow-xs transition-transform hover:scale-105 active:scale-95"
                  title={`Profil: ${user.nama}`}
                >
                  {initial}
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/masuk"
                  className="px-3.5 py-1.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  to="/daftar"
                  className="px-4 py-1.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs transition-all active:scale-95"
                >
                  Daftar Anggota
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Routed Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Modernized Architectural Footer */}
      <footer className="border-t border-border bg-card/60 mt-20 pt-14 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-border/60">
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2.5">
                <Logo className="size-7" />
                <span className="text-base font-bold tracking-tight text-foreground">
                  Pustaka QR POS
                </span>
              </div>
              <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
                Sistem Point-of-Sale dan manajemen perpustakaan modern berbasis pemindaian kode QR. Sirkulasi cepat &lt;15 detik, inventaris real-time, dan kartu anggota digital terverifikasi.
              </p>
              <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium pt-1">
                <ShieldCheck className="size-4" />
                <span>100% Cryptographic QR Validation &amp; ISO Standards</span>
              </div>
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-foreground mb-3 font-mono">
                Navigasi Cepat
              </div>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li>
                  <Link to="/katalog" className="hover:text-primary transition-colors">
                    Katalog Buku Lengkap
                  </Link>
                </li>
                <li>
                  <Link to="/scan" className="hover:text-primary transition-colors">
                    Pindai QR Loket Mandiri
                  </Link>
                </li>
                <li>
                  <Link to="/daftar" className="hover:text-primary transition-colors">
                    Registrasi Kartu Anggota
                  </Link>
                </li>
                <li>
                  <Link to="/admin" className="hover:text-primary transition-colors">
                    Admin Console Studio
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-foreground mb-3 font-mono">
                Pusat Layanan
              </div>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li>Senin – Sabtu: 08.00 – 20.00 WIB</li>
                <li>Jl. Perpustakaan Digital No. 1, Smart City</li>
                <li className="font-mono text-[11px]">halo@pustaka.id • (021) 555-0123</li>
                <li className="pt-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                    <Sparkles className="size-3" />
                    Versi 2.0 Production
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Pustaka QR. Hak Cipta Dilindungi.</p>
            <p className="font-mono text-[11px]">Vite • React • Framer Motion • Base UI • Tailwind</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

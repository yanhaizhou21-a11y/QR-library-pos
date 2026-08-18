import { Routes, Route, Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuth } from './context/AuthContext';
import UserLayout from './components/UserLayout';
import Landing from './pages/Landing';
import Catalog from './pages/Catalog';
import BookDetail from './pages/BookDetail';
import Scan from './pages/Scan';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import MyLoans from './pages/MyLoans';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import AdminLayout from './pages/admin/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminBooks from './pages/admin/AdminBooks';
import AdminLoans from './pages/admin/AdminLoans';
import AdminMembers from './pages/admin/AdminMembers';
import AdminFines from './pages/admin/AdminFines';
import AdminReservations from './pages/admin/AdminReservations';
import AdminReports from './pages/admin/AdminReports';
import AdminSettings from './pages/admin/AdminSettings';

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading">Memuat...</div>;
  if (!user) return <Navigate to="/masuk" replace />;
  return <>{children}</>;
}

function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading">Memuat...</div>;
  if (!user) return <Navigate to="/masuk" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route element={<UserLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/katalog" element={<Catalog />} />
        <Route path="/buku/:id" element={<BookDetail />} />
        <Route path="/scan" element={<Scan />} />
        <Route path="/masuk" element={<Login />} />
        <Route path="/daftar" element={<Register />} />
        <Route path="/lupa-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/notifikasi" element={<RequireAuth><Notifications /></RequireAuth>} />
        <Route path="/pinjaman" element={<RequireAuth><MyLoans /></RequireAuth>} />
        <Route path="/profil" element={<RequireAuth><Profile /></RequireAuth>} />
      </Route>
      <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
        <Route index element={<AdminOverview />} />
        <Route path="buku" element={<AdminBooks />} />
        <Route path="transaksi" element={<AdminLoans />} />
        <Route path="anggota" element={<AdminMembers />} />
        <Route path="denda" element={<AdminFines />} />
        <Route path="reservasi" element={<AdminReservations />} />
        <Route path="laporan" element={<AdminReports />} />
        <Route path="pengaturan" element={<AdminSettings />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
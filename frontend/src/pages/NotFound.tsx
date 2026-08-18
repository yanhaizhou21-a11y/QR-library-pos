import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container-narrow page">
      <div className="empty">
        <div style={{ fontSize: 40 }}>🔍</div>
        <h3>Halaman tidak ditemukan</h3>
        <p className="muted">Alamat yang Anda tuju tidak tersedia atau sudah dipindahkan.</p>
        <Link to="/" className="btn btn-primary">Ke Beranda</Link>
      </div>
    </div>
  );
}
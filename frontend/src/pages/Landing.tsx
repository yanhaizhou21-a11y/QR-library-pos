import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const STEPS = [
  { t: 'Pilih mode', d: 'Buka menu "Pindai QR" lalu pilih Pinjam atau Kembalikan.' },
  { t: 'Scan kartu anggota', d: 'Arahkan kamera ke QR kartu anggota Anda untuk mengidentifikasi diri.' },
  { t: 'Scan buku', d: 'Pindai QR yang ditempel di buku yang ingin dipinjam.' },
  { t: 'Konfirmasi', d: 'Sistem menghitung jatuh tempo otomatis. Selesai — buku tercatat real-time.' },
];

export default function Landing() {
  const { user } = useAuth();
  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Perpustakaan tanpa antre, cukup satu pindai QR.</h1>
          <p>
            Pinjam dan kembalikan buku hanya dengan memindai QR — stok tercatat otomatis, denda terhitung
            adil, dan riwayat selalu terpantau.
          </p>
          <div className="hero-actions">
            <Link to="/scan" className="btn btn-lg">
              📷 Pindai QR
            </Link>
            <Link to="/katalog" className="btn btn-lg btn-primary">
              Jelajahi Katalog
            </Link>
          </div>
        </div>
      </section>

      <div className="container page">
        <div className="grid grid-3">
          <div className="card">
            <div style={{ fontSize: 26 }}>⚡</div>
            <h3>Transaksi {'<'} 15 detik</h3>
            <p className="muted small">Pinjam & kembali cukup dengan pemindaian QR, tanpa form panjang.</p>
          </div>
          <div className="card">
            <div style={{ fontSize: 26 }}>📊</div>
            <h3>Stok real-time</h3>
            <p className="muted small">Ketersediaan buku terbarui otomatis setiap transaksi berjalan.</p>
          </div>
          <div className="card">
            <div style={{ fontSize: 26 }}>⏰</div>
            <h3>Denda & pengingat</h3>
            <p className="muted small">Reminder H-1 dan perhitungan denda keterlambatan otomatis.</p>
          </div>
        </div>

        <h2 className="mt-3">Cara menggunakan</h2>
        <div className="grid grid-4">
          {STEPS.map((s, i) => (
            <div className="card" key={i}>
              <div className="step-num">{i + 1}</div>
              <h3 style={{ marginTop: 12 }}>{s.t}</h3>
              <p className="muted small">{s.d}</p>
            </div>
          ))}
        </div>

        <div className="card mt-3" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ margin: 0 }}>Belum menjadi anggota?</h3>
            <p className="muted small" style={{ margin: '4px 0 0' }}>Daftar gratis, dapatkan kartu anggota digital berisi QR untuk transaksi.</p>
          </div>
          {user ? (
            <Link to="/pinjaman" className="btn btn-primary">Lihat Pinjaman Saya</Link>
          ) : (
            <Link to="/daftar" className="btn btn-primary">Daftar Sekarang</Link>
          )}
        </div>

        <div className="card mt-3">
          <h3>Informasi Perpustakaan</h3>
          <div className="grid grid-2">
            <div>
              <p className="small"><strong>Jam operasional:</strong> Senin–Sabtu, 08.00–20.00</p>
              <p className="small"><strong>Lokasi:</strong> Jalan Perpustakaan No. 1, Kota Nusantara</p>
              <p className="small"><strong>Kontak:</strong> (021) 555-0123 · halo@pustaka.id</p>
            </div>
            <div>
              <p className="small"><strong>Aturan umum:</strong></p>
              <ul className="small muted" style={{ margin: 0, paddingLeft: 18 }}>
                <li>Masa pinjam 7 hari (bisa disesuaikan oleh admin).</li>
                <li>Denda keterlambatan dihitung per hari.</li>
                <li>Batas maksimal 3 buku aktif per anggota.</li>
                <li>Kembalikan buku ke loket untuk proses scan pengembalian.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
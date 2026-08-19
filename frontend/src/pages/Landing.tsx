import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const STEPS = [
  { t: 'Pilih mode', d: 'Buka menu "Pindai QR" lalu pilih Pinjam atau Kembalikan.' },
  { t: 'Scan kartu anggota', d: 'Arahkan kamera ke kartu anggota Anda untuk mengidentifikasi diri.' },
  { t: 'Scan buku', d: 'Pindai QR yang ditempel di buku yang ingin dipinjam.' },
  { t: 'Konfirmasi', d: 'Sistem menghitung jatuh tempo otomatis. Selesai, buku tercatat real-time.' },
];

export default function Landing() {
  const { user } = useAuth();
  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="hero-eyebrow">Pustaka QR · 100% berbasis pindai</span>
            <h1>Perpustakaan tanpa antre, cukup satu pindai QR.</h1>
            <p>
              Pinjam dan kembalikan buku hanya dengan memindai. Stok tercatat otomatis, denda
              terhitung adil, dan riwayat selalu terpantau.
            </p>
            <div className="hero-actions">
              <Link to="/scan" className="btn btn-lg">
                Pindai Sekarang
              </Link>
              <Link to="/katalog" className="btn btn-lg btn-primary">
                Jelajahi Katalog
              </Link>
            </div>
          </div>
          <div className="hero-card">
            <div className="flex-between">
              <h3 style={{ margin: 0, color: '#fff' }}>Cara pinjam</h3>
              <span className="badge" style={{ background: 'rgba(56,189,248,0.2)', color: '#7dd3fc' }}>
                &lt; 15 detik
              </span>
            </div>
            <div className="mt-2" style={{ display: 'grid', gap: 14 }}>
              {STEPS.slice(0, 3).map((s, i) => (
                <div key={i} className="flex gap-sm">
                  <span className="step-num">{i + 1}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14.5, color: '#fff' }}>{s.t}</div>
                    <div className="small muted" style={{ color: '#a9c3e8' }}>{s.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="container page">
        <div className="feature-grid">
          <div className="card card-hover reveal">
            <div style={{ fontSize: 28, marginBottom: 12 }}>⚡</div>
            <h3>Transaksi &lt; 15 detik</h3>
            <p className="muted small" style={{ margin: 0 }}>
              Pinjam kembali cukup dengan pemindaian QR, tanpa form panjang.
            </p>
          </div>
          <div className="card card-hover reveal">
            <div style={{ fontSize: 28, marginBottom: 12 }}>📊</div>
            <h3>Stok real-time</h3>
            <p className="muted small" style={{ margin: 0 }}>
              Ketersediaan buku terbarui otomatis setiap transaksi berjalan.
            </p>
          </div>
          <div className="card card-hover reveal">
            <div style={{ fontSize: 28, marginBottom: 12 }}>⏰</div>
            <h3>Denda &amp; pengingat</h3>
            <p className="muted small" style={{ margin: 0 }}>
              Reminder H-1 dan perhitungan denda keterlambatan otomatis.
            </p>
          </div>
        </div>

        <h2 className="mt-3">Cara menggunakan</h2>
        <div className="grid grid-4">
          {STEPS.map((s, i) => (
            <div className="card card-hover reveal" key={i}>
              <span className="step-num">{i + 1}</span>
              <h3 style={{ marginTop: 14 }}>{s.t}</h3>
              <p className="muted small">{s.d}</p>
            </div>
          ))}
        </div>

        <div
          className="card mt-3"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}
        >
          <div>
            <h3 style={{ margin: 0 }}>Belum menjadi anggota?</h3>
            <p className="muted small" style={{ margin: '4px 0 0' }}>
              Daftar gratis, dapatkan kartu anggota digital berisi untuk transaksi.
            </p>
          </div>
          {user ? (
            <Link to="/pinjaman" className="btn btn-primary">
              Lihat Pinjaman Saya
            </Link>
          ) : (
            <Link to="/daftar" className="btn btn-primary">
              Daftar Sekarang
            </Link>
          )}
        </div>

        <div className="card mt-3">
          <h3>Informasi Perpustakaan</h3>
          <div className="grid grid-2">
            <div>
              <p className="small">
                <strong>Jam operasional:</strong> Senin–Sabtu, 08.00–20.00
              </p>
              <p className="small">
                <strong>Lokasi:</strong> Jalan Perpustakaan No. 1, Kota Nusantara
              </p>
              <p className="small">
                <strong>Kontak:</strong> (021) 555-0123 · halo@pustaka.id
              </p>
            </div>
            <div>
              <p className="small">
                <strong>Aturan umum:</strong>
              </p>
              <ul className="small muted" style={{ margin: 0, paddingLeft: 18 }}>
                <li>Masa pinjam 7 hari (bisa disesuaikan oleh admin).</li>
                <li>Denda keterlambatan dihitung per hari.</li>
                <li>Batas maksimal 3 buku aktif per anggota.</li>
                <li>Kembalikan buku di loket untuk proses scan pengembalian.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

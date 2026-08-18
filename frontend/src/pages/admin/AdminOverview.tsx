import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { Cover, rupiah } from '../../components/ui';

interface Overview {
  totalBuku: number;
  totalAnggota: number;
  aktif: number;
  terlambat: number;
  reservasi: number;
  peminjamanHariIni: number;
  pengembalianHariIni: number;
  totalDenda: number;
  dendaBelum: number;
  bukuKosong: number;
}
interface PopularRow {
  id: number;
  judul: string;
  penulis: string;
  cover_url: string | null;
  total_pinjam: number;
  stok_tersedia: number;
}
interface MonthRow {
  bulan: string;
  pinjam: number;
  kembali: number;
}

export default function AdminOverview() {
  const [ov, setOv] = useState<Overview | null>(null);
  const [popular, setPopular] = useState<PopularRow[]>([]);
  const [months, setMonths] = useState<MonthRow[]>([]);

  useEffect(() => {
    api.get<Overview>('/admin/reports/overview').then(setOv).catch(() => undefined);
    api.get<{ rows: PopularRow[] }>('/admin/reports/popular-books').then((d) => setPopular(d.rows)).catch(() => undefined);
    api.get<{ months: MonthRow[] }>('/admin/reports/monthly-loans').then((d) => setMonths(d.months)).catch(() => undefined);
  }, []);

  if (!ov) return <div className="page-loading">Memuat dashboard...</div>;

  const stats = [
    { label: 'Buku (katalog)', value: ov.totalBuku },
    { label: 'Anggota', value: ov.totalAnggota },
    { label: 'Pinjaman aktif', value: ov.aktif },
    { label: 'Terlambat', value: ov.terlambat, warn: ov.terlambat > 0 },
    { label: 'Antrian reservasi', value: ov.reservasi },
    { label: 'Buku stok habis', value: ov.bukuKosong, warn: ov.bukuKosong > 0 },
    { label: 'Pinjam hari ini', value: ov.peminjamanHariIni },
    { label: 'Kembali hari ini', value: ov.pengembalianHariIni },
  ];
  const maxPinjam = Math.max(1, ...months.map((m) => m.pinjam + m.kembali));
  const maxPop = Math.max(1, ...popular.map((p) => p.total_pinjam));

  return (
    <div>
      <div className="page-head flex-between">
        <div>
          <h2>Ringkasan Perpustakaan</h2>
          <p className="muted small" style={{ margin: 0 }}>Pantau kondisi operasional secara real-time</p>
        </div>
        <div className="flex gap-sm">
          <span className="badge badge-green">Pendapatan denda lunas: {rupiah(ov.totalDenda)}</span>
          <span className="badge badge-amber">Denda belum dibayar: {rupiah(ov.dendaBelum)}</span>
        </div>
      </div>

      <div className="grid grid-4">
        {stats.map((s) => (
          <div className="card stat-card" key={s.label}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={s.warn ? { color: 'var(--danger)' } : undefined}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-2 mt-2">
        <div className="card">
          <div className="flex-between">
            <h3 style={{ margin: 0 }}>Peminjaman 12 Bulan Terakhir</h3>
            <Link to="/admin/laporan" className="small">Detail →</Link>
          </div>
          {months.length === 0 && <p className="muted small mt-1">Belum ada data.</p>}
          <div className="chart-bar-wrap mt-2">
            {months.slice(-6).map((m) => (
              <div className="chart-row" key={m.bulan}>
                <span className="chart-label">{m.bulan}</span>
                <div className="chart-bar">
                  <div className="chart-fill" style={{ width: `${((m.pinjam + m.kembali) / maxPinjam) * 100}%` }} />
                </div>
                <span className="chart-val">{m.pinjam + m.kembali}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex-between">
            <h3 style={{ margin: 0 }}>Buku Paling Sering Dipinjam</h3>
            <Link to="/admin/laporan" className="small">Detail →</Link>
          </div>
          <div className="chart-bar-wrap mt-2">
            {popular.slice(0, 6).map((p) => (
              <div className="chart-row" key={p.id}>
                <span className="chart-label">{p.judul}</span>
                <div className="chart-bar">
                  <div className="chart-fill" style={{ width: `${(p.total_pinjam / maxPop) * 100}%` }} />
                </div>
                <span className="chart-val">{p.total_pinjam}x</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card mt-2">
        <h3 style={{ margin: 0 }}>Top 5 Buku Terpopuler (detail)</h3>
        <div className="grid grid-books mt-2">
          {popular.slice(0, 5).map((p) => (
            <Link to={`/buku/${p.id}`} key={p.id} className="book-card">
              <Cover url={p.cover_url} title={p.judul} />
              <div className="book-body">
                <div className="book-title">{p.judul}</div>
                <div className="book-author">{p.penulis}</div>
                <div className="book-meta">
                  <span className="badge badge-blue">{p.total_pinjam}× dipinjam</span>
                  <span className={`badge ${p.stok_tersedia > 0 ? 'badge-green' : 'badge-red'}`}>{p.stok_tersedia} sisa</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
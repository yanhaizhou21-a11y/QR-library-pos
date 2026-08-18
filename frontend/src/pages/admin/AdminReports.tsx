import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { Cover } from '../../components/ui';

interface Popular { id: number; judul: string; penulis: string; cover_url: string | null; total_pinjam: number; stok_tersedia: number; }
interface Member { id: number; nama: string; no_anggota: string | null; total_pinjam: number; terlambat: number; }
interface Month { bulan: string; pinjam: number; kembali: number; }

export default function AdminReports() {
  const [popular, setPopular] = useState<Popular[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [months, setMonths] = useState<Month[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get<{ rows: Popular[] }>('/admin/reports/popular-books'),
      api.get<{ rows: Member[] }>('/admin/reports/active-members'),
      api.get<{ months: Month[] }>('/admin/reports/monthly-loans'),
    ])
      .then(([p, m, mo]) => {
        setPopular(p.rows);
        setMembers(m.rows);
        setMonths(mo.months);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const maxPop = Math.max(1, ...popular.map((p) => p.total_pinjam));
  const maxMon = Math.max(1, ...months.map((m) => m.pinjam + m.kembali));

  if (loading) return <div className="page-loading">Menyusun laporan...</div>;

  return (
    <div>
      <div className="page-head flex-between">
        <div>
          <h2>Laporan & Statistik</h2>
          <p className="muted small" style={{ margin: 0 }}>Analisis aktivitas perpustakaan</p>
        </div>
        <button className="btn" onClick={() => api.download('/admin/reports/export', 'laporan-pustaka.csv')}>⬇️ Export Laporan CSV</button>
      </div>

      <div className="grid grid-3 mt-1">
        <div className="card">
          <h3>Buku Paling Sering Dipinjam</h3>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Buku</th><th className="text-right">Pinjam</th></tr></thead>
              <tbody>
                {popular.map((p) => (
                  <tr key={p.id}>
                    <td className="cell-title">{p.judul}</td>
                    <td className="text-right">{p.total_pinjam}x</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3>Anggota Paling Aktif</h3>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Anggota</th><th className="text-right">Pinjam</th><th className="text-right">Terlambat</th></tr></thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id}>
                    <td className="cell-title">
                      {m.nama}
                      <div className="small muted">{m.no_anggota}</div>
                    </td>
                    <td className="text-right">{m.total_pinjam}x</td>
                    <td className="text-right">{m.terlambat}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3>Grafik Peminjaman Per Bulan</h3>
          <div className="chart-bar-wrap mt-1">
            {months.map((m) => (
              <div className="chart-row" key={m.bulan}>
                <span className="chart-label">{m.bulan}</span>
                <div className="chart-bar">
                  <div className="chart-fill" style={{ width: `${((m.pinjam + m.kembali) / maxMon) * 100}%` }} />
                </div>
                <span className="chart-val">{m.pinjam + m.kembali}</span>
              </div>
            ))}
          </div>
          <div className="small muted mt-1">Legenda: tinggi bar = pinjam + kembali pada bulan tersebut.</div>
        </div>
      </div>

      <div className="card mt-2">
        <h3 style={{ margin: 0 }}>Pergerakan Populer</h3>
        <div className="grid grid-2 mt-2">
          {popular.slice(0, 4).map((p) => (
            <div className="flex gap-sm" key={p.id} style={{ alignItems: 'center' }}>
              <Cover url={p.cover_url} title={p.judul} size="sm" />
              <div style={{ flex: 1 }}>
                <div className="chart-row">
                  <span className="chart-label">{p.judul}</span>
                  <div className="chart-bar">
                    <div className="chart-fill" style={{ width: `${(p.total_pinjam / maxPop) * 100}%` }} />
                  </div>
                  <span className="chart-val">{p.total_pinjam}x</span>
                </div>
                <div className="small muted">{p.penulis} · {p.stok_tersedia} tersisa</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
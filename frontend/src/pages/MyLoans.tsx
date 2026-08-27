import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, Cover, rupiah, fmtDate } from '../components/ui';

interface Loan {
  id: number;
  book: { id: number; judul: string; penulis: string; cover_url: string | null };
  tanggal_pinjam: string;
  tanggal_jatuh_tempo: string;
  tanggal_kembali: string | null;
  status: string;
  hari_terlambat: number;
  denda: number;
}

export default function MyLoans() {
  const { user } = useAuth();
  const [active, setActive] = useState<Loan[]>([]);
  const [history, setHistory] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api
      .get<{ active: Loan[]; history: Loan[] }>('/loans/me')
      .then((d: any) => {
        setActive(d.active);
        setHistory(d.history);
      })
      .catch((e: any) => setMsg(e.message))
      .finally(() => setLoading(false));
  }, []);

  const exportCsv = () => {
    api
      .download('/loans/me/export', `riwayat-${user?.no_anggota || user?.id}.csv`)
      .catch((e: any) => setMsg(e.message));
  };

  const loanRow = (l: Loan) => (
    <tr key={l.id}>
      <td className="cell-title">
        <div className="flex gap-sm">
          <Cover url={l.book.cover_url} title={l.book.judul} size="sm" />
          <div>
            <Link to={`/buku/${l.book.id}`}>{l.book.judul}</Link>
            <div className="small muted">{l.book.penulis}</div>
          </div>
        </div>
      </td>
      <td>#{l.id}</td>
      <td>{fmtDate(l.tanggal_pinjam)}</td>
      <td
        className={l.status === 'terlambat' ? 'text-danger' : ''}
        style={l.status === 'terlambat' ? { color: 'var(--danger)', fontWeight: 600 } : undefined}
      >
        {fmtDate(l.tanggal_jatuh_tempo)}
      </td>
      <td>{fmtDate(l.tanggal_kembali)}</td>
      <td>
        <StatusBadge status={l.status} />
      </td>
      <td className="text-right">{l.denda > 0 ? rupiah(l.denda) : '-'}</td>
    </tr>
  );

  if (loading) return <div className="container page-loading">Memuat riwayat...</div>;

  return (
    <div className="container page">
      <div className="page-head flex-between">
        <div>
          <h2>Pinjaman Saya</h2>
          <p className="muted small" style={{ margin: 0 }}>
            Transaksi dan riwayat peminjaman Anda
          </p>
        </div>
        <button className="btn" onClick={exportCsv}>
          ⬇️ Unduh Riwayat (CSV)
        </button>
      </div>
      {msg && <div className="alert alert-error">{msg}</div>}

      <h3 className="mt-2">Sedang Dipinjam ({active.length})</h3>
      {active.length === 0 ? (
        <div className="empty">
          Tidak ada pinjaman aktif. <Link to="/katalog">Pilih buku</Link> lalu scan untuk meminjam.
        </div>
      ) : (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr>
                <th>Buku</th>
                <th>No.</th>
                <th>Tanggal Pinjam</th>
                <th>Jatuh Tempo</th>
                <th>Kembali</th>
                <th>Status</th>
                <th className="text-right">Denda</th>
              </tr>
            </thead>
            <tbody>{active.map(loanRow)}</tbody>
          </table>
        </div>
      )}

      <h3 className="mt-3">Riwayat Selesai ({history.length})</h3>
      {history.length === 0 ? (
        <div className="empty">Belum ada riwayat pengembalian.</div>
      ) : (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr>
                <th>Buku</th>
                <th>No.</th>
                <th>Tanggal Pinjam</th>
                <th>Jatuh Tempo</th>
                <th>Kembali</th>
                <th>Status</th>
                <th className="text-right">Denda</th>
              </tr>
            </thead>
            <tbody>{history.map(loanRow)}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

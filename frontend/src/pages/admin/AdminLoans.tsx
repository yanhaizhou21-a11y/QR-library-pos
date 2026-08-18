import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { Link } from 'react-router-dom';
import { StatusBadge, Cover, rupiah, fmtDate } from '../../components/ui';

interface Loan {
  id: number;
  book: { id: number; judul: string; penulis: string; cover_url: string | null };
  user: { id: number; nama: string; no_anggota: string | null };
  tanggal_pinjam: string;
  tanggal_jatuh_tempo: string;
  tanggal_kembali: string | null;
  status: string;
  hari_terlambat: number;
  denda: number;
}

export default function AdminLoans() {
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const load = () => {
    setLoading(true);
    const sp = new URLSearchParams();
    if (status) sp.set('status', status);
    if (q) sp.set('q', q);
    api
      .get<{ loans: Loan[] }>(`/loans?${sp.toString()}`)
      .then((d) => setLoans(d.loans))
      .catch((e) => setMsg(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [status]);

  return (
    <div>
      <div className="page-head flex-between">
        <div>
          <h2>Pantau Transaksi</h2>
          <p className="muted small" style={{ margin: 0 }}>Semua aktivitas pinjam & kembali</p>
        </div>
        <button className="btn" onClick={() => api.download('/loans/export', 'transaksi-perpustakaan.csv')}>⬇️ Export CSV</button>
      </div>
      {msg && <div className="alert alert-error">{msg}</div>}

      <div className="card mb-2 flex-between" style={{ flexWrap: 'wrap', gap: 10 }}>
        <div className="tabs" style={{ margin: 0, border: 'none' }}>
          <button className={`tab ${!status ? 'active' : ''}`} onClick={() => setStatus('')}>Semua</button>
          <button className={`tab ${status === 'dipinjam' ? 'active' : ''}`} onClick={() => setStatus('dipinjam')}>Dipinjam</button>
          <button className={`tab ${status === 'terlambat' ? 'active' : ''}`} onClick={() => setStatus('terlambat')}>Terlambat</button>
          <button className={`tab ${status === 'selesai' ? 'active' : ''}`} onClick={() => setStatus('selesai')}>Selesai</button>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
            placeholder="Cari buku/anggota..."
            style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid var(--line)' }}
          />
          <button className="btn" onClick={load}>Cari</button>
        </div>
      </div>

      {loading ? (
        <div className="page-loading">Memuat transaksi...</div>
      ) : (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr><th>No.</th><th>Buku</th><th>Anggota</th><th>Pinjam</th><th>Jatuh Tempo</th><th>Kembali</th><th>Status</th><th className="text-right">Denda</th></tr>
            </thead>
            <tbody>
              {loans.map((l) => (
                <tr key={l.id}>
                  <td>#{l.id}</td>
                  <td className="cell-title">
                    <div className="flex gap-sm">
                      <Cover url={l.book.cover_url} title={l.book.judul} size="sm" />
                      <div>
                        <Link to={`/buku/${l.book.id}`}>{l.book.judul}</Link>
                        <div className="small muted">{l.book.penulis}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {l.user.nama}
                    <div className="small muted">{l.user.no_anggota}</div>
                  </td>
                  <td>{fmtDate(l.tanggal_pinjam)}</td>
                  <td style={{ color: l.status === 'terlambat' ? 'var(--danger)' : undefined, fontWeight: l.status === 'terlambat' ? 600 : undefined }}>
                    {fmtDate(l.tanggal_jatuh_tempo)}
                  </td>
                  <td>{fmtDate(l.tanggal_kembali)}</td>
                  <td><StatusBadge status={l.status} /></td>
                  <td className="text-right">{l.denda ? rupiah(l.denda) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
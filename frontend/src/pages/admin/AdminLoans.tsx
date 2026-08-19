import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CirculationIcon,
  Download01Icon,
} from '@/components/library/icons';
import {
  Search,
  BookOpen,
  Calendar,
  AlertCircle,
  QrCode,
  ArrowUpDown,
} from 'lucide-react';
import { api } from '../../api/client';
import { StatusBadge, Cover, rupiah, fmtDate } from '../../components/ui';
import { Button } from '@/components/ui/button';

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

  const handleExport = () => {
    api.download('/loans/export', 'transaksi-perpustakaan.csv');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CirculationIcon className="size-6 text-primary" />
            Pantau Transaksi Sirkulasi
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Rekap seluruh aktivitas peminjaman dan pengembalian berbasis pemindaian QR
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="gap-2 shadow-xs"
        >
          <Download01Icon className="size-4" />
          Export CSV
        </Button>
      </div>

      {msg && (
        <div className="alert alert-error flex items-center gap-2 rounded-xl p-3 bg-red-50 text-red-700 border border-red-200">
          <AlertCircle className="size-4" />
          <span>{msg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-secondary/80 rounded-xl border border-border/50">
          <button
            onClick={() => setStatus('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !status
                ? 'bg-background text-primary shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setStatus('dipinjam')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              status === 'dipinjam'
                ? 'bg-background text-blue-600 shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Sedang Dipinjam
          </button>
          <button
            onClick={() => setStatus('terlambat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              status === 'terlambat'
                ? 'bg-background text-red-600 shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Terlambat
          </button>
          <button
            onClick={() => setStatus('selesai')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              status === 'selesai'
                ? 'bg-background text-emerald-600 shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Selesai
          </button>
        </div>

        {/* Search Field */}
        <div className="relative flex-1 max-w-sm">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
            placeholder="Cari buku atau nama anggota..."
            className="w-full bg-input border border-border rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-muted-foreground text-sm">
          Memuat data sirkulasi...
        </div>
      ) : loans.length === 0 ? (
        <div className="p-16 text-center border border-dashed rounded-2xl bg-card">
          <CirculationIcon className="size-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-sm font-semibold text-foreground">Tidak ada transaksi ditemukan</p>
          <p className="text-xs text-muted-foreground mt-1">Coba sesuaikan filter status atau kata kunci pencarian.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                <tr>
                  <th className="p-4 pl-6">ID</th>
                  <th className="p-4">Buku</th>
                  <th className="p-4">Peminjam</th>
                  <th className="p-4">Tgl Pinjam</th>
                  <th className="p-4">Jatuh Tempo</th>
                  <th className="p-4">Tgl Kembali</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Denda</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loans.map((l) => (
                  <tr key={l.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 pl-6 font-mono text-xs font-bold text-muted-foreground">
                      #{l.id}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Cover url={l.book.cover_url} title={l.book.judul} size="sm" />
                        <div className="min-w-0">
                          <Link
                            to={`/buku/${l.book.id}`}
                            className="font-semibold text-foreground text-sm leading-snug hover:text-primary transition-colors truncate max-w-xs block"
                          >
                            {l.book.judul}
                          </Link>
                          <div className="text-xs text-muted-foreground truncate max-w-xs">
                            {l.book.penulis}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-foreground text-sm">
                        {l.user.nama}
                      </div>
                      <div className="text-xs font-mono text-muted-foreground">
                        {l.user.no_anggota || '-'}
                      </div>
                    </td>
                    <td className="p-4 font-mono text-xs text-muted-foreground">
                      {fmtDate(l.tanggal_pinjam)}
                    </td>
                    <td className="p-4 font-mono text-xs">
                      <span
                        className={
                          l.status === 'terlambat'
                            ? 'text-red-500 font-bold'
                            : 'text-foreground'
                        }
                      >
                        {fmtDate(l.tanggal_jatuh_tempo)}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-xs text-muted-foreground">
                      {l.tanggal_kembali ? fmtDate(l.tanggal_kembali) : '-'}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={l.status} />
                    </td>
                    <td className="p-4 pr-6 text-right font-mono text-xs font-semibold">
                      {l.denda > 0 ? (
                        <span className="text-red-500">{rupiah(l.denda)}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
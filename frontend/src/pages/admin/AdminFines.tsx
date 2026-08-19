import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { StatusBadge, rupiah, fmtDate } from '../../components/ui';
import { Button } from '@/components/ui/button';
import { DollarSign, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface Fine {
  id: number;
  user_id: number;
  nama: string;
  no_anggota: string | null;
  judul: string;
  jumlah: number;
  hari_terlambat: number;
  status_bayar: string;
  tanggal_bayar: string | null;
  tanggal_jatuh_tempo: string;
}

export default function AdminFines() {
  const [fines, setFines] = useState<Fine[]>([]);
  const [filter, setFilter] = useState('');
  const [total, setTotal] = useState(0);
  const [totalNominal, setTotalNominal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const load = () => {
    const sp = new URLSearchParams();
    if (filter) sp.set('status_bayar', filter);
    setLoading(true);
    api
      .get<{ fines: Fine[]; total: number; totalNominal: number }>(`/admin/fines?${sp.toString()}`)
      .then((d) => {
        setFines(d.fines);
        setTotal(d.total);
        setTotalNominal(d.totalNominal);
      })
      .catch((e) => setMsg(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  const pay = async (f: Fine) => {
    if (!window.confirm(`Catat denda ${rupiah(f.jumlah)} untuk ${f.nama} sebagai lunas?`)) return;
    try {
      await api.post(`/admin/fines/${f.id}/pay`);
      load();
    } catch (err: any) {
      setMsg(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <DollarSign className="size-6 text-primary" />
            Kelola Denda &amp; Pelunasan
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {total} catatan denda · Total tercatat: <span className="font-mono font-semibold text-foreground">{rupiah(totalNominal)}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 p-1 bg-secondary/80 rounded-xl border border-border/50">
          <button
            onClick={() => setFilter('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !filter
                ? 'bg-background text-primary shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilter('belum')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'belum'
                ? 'bg-background text-amber-600 shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Belum Bayar
          </button>
          <button
            onClick={() => setFilter('lunas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'lunas'
                ? 'bg-background text-emerald-600 shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Lunas
          </button>
        </div>
      </div>

      {msg && (
        <div className="alert alert-error flex items-center gap-2 rounded-xl p-3 bg-red-50 text-red-700 border border-red-200">
          <AlertCircle className="size-4" />
          <span>{msg}</span>
        </div>
      )}

      {loading ? (
        <div className="p-16 text-center text-muted-foreground text-sm">
          Memuat catatan denda...
        </div>
      ) : fines.length === 0 ? (
        <div className="p-16 text-center border border-dashed rounded-2xl bg-card">
          <CheckCircle className="size-8 text-emerald-500 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-semibold text-foreground">Tidak ada catatan denda</p>
          <p className="text-xs text-muted-foreground mt-1">Semua sirkulasi lancar dan tertib tepat waktu.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                <tr>
                  <th className="p-4 pl-6">ID</th>
                  <th className="p-4">Anggota</th>
                  <th className="p-4">Buku Terkait</th>
                  <th className="p-4">Jatuh Tempo</th>
                  <th className="p-4 text-center">Keterlambatan</th>
                  <th className="p-4 text-right">Nominal Denda</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Tgl Bayar</th>
                  <th className="p-4 pr-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {fines.map((f) => (
                  <tr key={f.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 pl-6 font-mono text-xs font-bold text-muted-foreground">
                      #{f.id}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-foreground text-sm">
                        {f.nama}
                      </div>
                      <div className="text-xs font-mono text-muted-foreground">
                        {f.no_anggota || '-'}
                      </div>
                    </td>
                    <td className="p-4 font-medium text-foreground text-sm max-w-xs truncate">
                      {f.judul}
                    </td>
                    <td className="p-4 font-mono text-xs text-muted-foreground">
                      {fmtDate(f.tanggal_jatuh_tempo)}
                    </td>
                    <td className="p-4 text-center font-mono text-xs text-red-500 font-semibold">
                      {f.hari_terlambat} hari
                    </td>
                    <td className="p-4 text-right font-mono text-xs font-bold text-red-500">
                      {rupiah(f.jumlah)}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={f.status_bayar} />
                    </td>
                    <td className="p-4 font-mono text-xs text-muted-foreground">
                      {f.tanggal_bayar ? fmtDate(f.tanggal_bayar) : '-'}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      {f.status_bayar === 'belum' && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => pay(f)}
                          className="text-xs h-8 rounded-lg shadow-xs font-semibold"
                        >
                          Tandai Lunas
                        </Button>
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
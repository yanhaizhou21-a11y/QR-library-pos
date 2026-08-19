import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { StatusBadge, fmtDate } from '../../components/ui';
import { Button } from '@/components/ui/button';
import { BookmarkCheck, AlertCircle, XCircle } from 'lucide-react';

interface Reservation {
  id: number;
  judul: string;
  penulis: string;
  nama: string;
  no_anggota: string | null;
  status: string;
  tanggal_reservasi: string;
}

export default function AdminReservations() {
  const [res, setRes] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const load = () => {
    setLoading(true);
    api
      .get<{ reservations: Reservation[] }>('/admin/reservations')
      .then((d) => setRes(d.reservations))
      .catch((e) => setMsg(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const cancel = async (r: Reservation) => {
    if (!window.confirm(`Batalkan reservasi ${r.nama} untuk buku "${r.judul}"?`)) return;
    try {
      await api.post(`/admin/reservations/${r.id}/cancel`);
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
            <BookmarkCheck className="size-6 text-primary" />
            Antrean Reservasi Buku
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sistem otomatis memproses antrean (FIFO) saat buku yang dipinjam dikembalikan
          </p>
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
          Memuat antrean reservasi...
        </div>
      ) : res.length === 0 ? (
        <div className="p-16 text-center border border-dashed rounded-2xl bg-card">
          <BookmarkCheck className="size-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-sm font-semibold text-foreground">Tidak ada antrean reservasi aktif</p>
          <p className="text-xs text-muted-foreground mt-1">Anggota dapat mereservasi buku jika stok sedang kosong.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                <tr>
                  <th className="p-4 pl-6">ID</th>
                  <th className="p-4">Anggota</th>
                  <th className="p-4">Judul Buku</th>
                  <th className="p-4">Tanggal Reservasi</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {res.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 pl-6 font-mono text-xs font-bold text-muted-foreground">
                      #{r.id}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-foreground text-sm">
                        {r.nama}
                      </div>
                      <div className="text-xs font-mono text-muted-foreground">
                        {r.no_anggota || '-'}
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-foreground text-sm max-w-xs truncate">
                      {r.judul}
                    </td>
                    <td className="p-4 font-mono text-xs text-muted-foreground">
                      {fmtDate(r.tanggal_reservasi)}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => cancel(r)}
                        className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg gap-1"
                      >
                        <XCircle className="size-3.5" />
                        Batalkan
                      </Button>
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
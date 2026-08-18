import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { StatusBadge, fmtDate } from '../../components/ui';

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
    if (!window.confirm(`Batalkan reservasi ${r.nama} untuk "Buku ${r.judul}"?`)) return;
    try {
      await api.post(`/admin/reservations/${r.id}/cancel`);
      load();
    } catch (err: any) {
      setMsg(err.message);
    }
  };

  return (
    <div>
      <div className="page-head">
        <h2>Reservasi Buku</h2>
        <p className="muted small" style={{ margin: 0 }}>
          Antrian menunggu akan dipenuhi otomatis (FIFO) saat buku dikembalikan
        </p>
      </div>
      {msg && <div className="alert alert-error">{msg}</div>}

      {loading ? (
        <div className="page-loading">Memuat reservasi...</div>
      ) : res.length === 0 ? (
        <div className="empty">Tidak ada reservasi aktif. Anggota bisa reservasi buku yang stoknya habis.</div>
      ) : (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr><th>No.</th><th>Anggota</th><th>Buku</th><th>Tanggal Reservasi</th><th>Status</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {res.map((r) => (
                <tr key={r.id}>
                  <td>#{r.id}</td>
                  <td className="cell-title">
                    {r.nama}
                    <div className="small muted">{r.no_anggota}</div>
                  </td>
                  <td>{r.judul}</td>
                  <td>{fmtDate(r.tanggal_reservasi)}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => cancel(r)}>Batalkan</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { StatusBadge, rupiah, fmtDate } from '../../components/ui';

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
    <div>
      <div className="page-head flex-between">
        <div>
          <h2>Kelola Denda</h2>
          <p className="muted small" style={{ margin: 0 }}>
            {total} catatan denda · total {rupiah(totalNominal)}
          </p>
        </div>
        <div className="flex gap-sm">
          <button className={`btn btn-sm ${!filter ? 'btn-primary' : ''}`} onClick={() => setFilter('')}>Semua</button>
          <button className={`btn btn-sm ${filter === 'belum' ? 'btn-primary' : ''}`} onClick={() => setFilter('belum')}>Belum Bayar</button>
          <button className={`btn btn-sm ${filter === 'lunas' ? 'btn-primary' : ''}`} onClick={() => setFilter('lunas')}>Lunas</button>
        </div>
      </div>
      {msg && <div className="alert alert-error">{msg}</div>}

      {loading ? (
        <div className="page-loading">Memuat denda...</div>
      ) : (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr><th>No.</th><th>Anggota</th><th>Buku</th><th>Jatuh Tempo</th><th>Hari Terlambat</th><th className="text-right">Jumlah</th><th>Status</th><th>Tanggal Bayar</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {fines.map((f) => (
                <tr key={f.id}>
                  <td>#{f.id}</td>
                  <td className="cell-title">
                    {f.nama}
                    <div className="small muted">{f.no_anggota}</div>
                  </td>
                  <td>{f.judul}</td>
                  <td>{fmtDate(f.tanggal_jatuh_tempo)}</td>
                  <td>{f.hari_terlambat} hari</td>
                  <td className="text-right">{rupiah(f.jumlah)}</td>
                  <td><StatusBadge status={f.status_bayar} /></td>
                  <td>{fmtDate(f.tanggal_bayar)}</td>
                  <td>
                    {f.status_bayar === 'belum' && (
                      <button className="btn btn-sm btn-primary" onClick={() => pay(f)}>Tandai Lunas</button>
                    )}
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
import { FormEvent, useEffect, useState } from 'react';
import { api } from '../../api/client';
import { rupiah } from '../../components/ui';

export default function AdminSettings() {
  const [loanDays, setLoanDays] = useState(7);
  const [finePerDay, setFinePerDay] = useState(1000);
  const [maxActiveLoans, setMaxActiveLoans] = useState(3);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get<{ settings: { loanDays: number; finePerDay: number; maxActiveLoans: number } }>('/admin/settings')
      .then((d) => {
        setLoanDays(d.settings.loanDays);
        setFinePerDay(d.settings.finePerDay);
        setMaxActiveLoans(d.settings.maxActiveLoans);
      })
      .catch(() => undefined);
  }, []);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    try {
      await api.put('/admin/settings', { loanDays, finePerDay, maxActiveLoans });
      setMsg('Pengaturan disimpan.');
    } catch (err: any) {
      setMsg(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="page-head">
        <h2>Pengaturan Perpustakaan</h2>
        <p className="muted small" style={{ margin: 0 }}>Atur kebijakan peminjaman & denda</p>
      </div>
      <div className="card" style={{ maxWidth: 520 }}>
        {msg && <div className="alert alert-ok">{msg}</div>}
        <form className="form" onSubmit={save}>
          <div className="field">
            <label>Masa pinjam (hari)</label>
            <input type="number" min={1} value={loanDays} onChange={(e) => setLoanDays(Number(e.target.value))} />
            <div className="hint">Jarak antara tanggal pinjam dan jatuh tempo.</div>
          </div>
          <div className="field">
            <label>Denda per hari terlambat ({rupiah(finePerDay)}/hari)</label>
            <input type="number" min={0} step={500} value={finePerDay} onChange={(e) => setFinePerDay(Number(e.target.value))} />
          </div>
          <div className="field">
            <label>Batas maksimal pinjaman aktif</label>
            <input type="number" min={1} value={maxActiveLoans} onChange={(e) => setMaxActiveLoans(Number(e.target.value))} />
          </div>
          <div>
            <button className="btn btn-primary" disabled={busy}>{busy ? 'Menyimpan...' : 'Simpan Pengaturan'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
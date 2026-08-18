import { FormEvent, useEffect, useState } from 'react';
import { api } from '../../api/client';
import { Modal, StatusBadge } from '../../components/ui';

interface Member {
  id: number;
  nama: string;
  email: string;
  no_anggota: string | null;
  role: string;
  status: string;
  phone: string | null;
  aktif: number;
  total_pinjam: number;
  denda_belum: number;
}

export default function AdminMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ nama: '', email: '', password: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [resetTarget, setResetTarget] = useState<Member | null>(null);
  const [newPass, setNewPass] = useState('');

  const load = () => {
    const sp = new URLSearchParams();
    if (q) sp.set('q', q);
    setLoading(true);
    api
      .get<{ members: Member[] }>(`/admin/members?${sp.toString()}`)
      .then((d) => setMembers(d.members))
      .catch((e) => setMsg(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const add = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      await api.post('/admin/members', form);
      setOpen(false);
      setForm({ nama: '', email: '', password: '', phone: '' });
      load();
    } catch (err: any) {
      setMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleBlock = async (m: Member) => {
    try {
      await api.put(`/admin/members/${m.id}`, { status: m.status === 'aktif' ? 'blokir' : 'aktif' });
      load();
    } catch (err: any) {
      setMsg(err.message);
    }
  };

  const doReset = async () => {
    if (!resetTarget) return;
    setSaving(true);
    try {
      await api.post(`/admin/members/${resetTarget.id}/reset-password`, { password: newPass });
      setResetTarget(null);
      setNewPass('');
      load();
    } catch (err: any) {
      setMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (m: Member) => {
    if (!window.confirm(`Hapus anggota ${m.nama}?`)) return;
    try {
      await api.del(`/admin/members/${m.id}`);
      load();
    } catch (err: any) {
      setMsg(err.message);
    }
  };

  return (
    <div>
      <div className="page-head flex-between">
        <div>
          <h2>Kelola Anggota</h2>
          <p className="muted small" style={{ margin: 0 }}>{members.length} anggota</p>
        </div>
        <button className="btn btn-primary" onClick={() => setOpen(true)}>+ Tambah Anggota</button>
      </div>
      {msg && <div className="alert alert-error">{msg}</div>}

      <div className="card mb-2">
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
            placeholder="Cari nama / email / no anggota..."
            style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: '1px solid var(--line)' }}
          />
          <button className="btn btn-primary" onClick={load}>Cari</button>
        </div>
      </div>

      {loading ? (
        <div className="page-loading">Memuat anggota...</div>
      ) : (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr><th>Anggota</th><th>No. Anggota</th><th>Status</th><th>Pinjaman Aktif</th><th>Total Pinjam</th><th className="text-right">Denda Belum</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id}>
                  <td className="cell-title">
                    {m.nama}
                    <div className="small muted">{m.email}</div>
                  </td>
                  <td>{m.no_anggota}</td>
                  <td><StatusBadge status={m.status} /></td>
                  <td>{m.aktif}</td>
                  <td>{m.total_pinjam}</td>
                  <td className="text-right">{m.denda_belum > 0 ? `Rp ${m.denda_belum.toLocaleString('id-ID')}` : '-'}</td>
                  <td>
                    <button className="btn btn-sm" onClick={() => { setResetTarget(m); setNewPass(''); }}>Reset PW</button>{' '}
                    <button className={`btn btn-sm ${m.status === 'aktif' ? 'btn-outline-danger' : 'btn-primary'}`} onClick={() => toggleBlock(m)}>
                      {m.status === 'aktif' ? 'Blokir' : 'Aktifkan'}
                    </button>{' '}
                    <button className="btn btn-sm btn-ghost" onClick={() => remove(m)}>Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Tambah Anggota">
        <form className="form" onSubmit={add}>
          <div className="field">
            <label>Nama *</label>
            <input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required />
          </div>
          <div className="field">
            <label>Email *</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="field">
            <label>Password awal *</label>
            <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <div className="field">
            <label>No. HP</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="flex gap-sm">
            <button className="btn btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
            <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Batal</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!resetTarget} onClose={() => setResetTarget(null)} title={`Reset Password: ${resetTarget?.nama || ''}`}>
        <form className="form" onSubmit={doReset}>
          <div className="field">
            <label>Password baru (min. 6 karakter)</label>
            <input value={newPass} onChange={(e) => setNewPass(e.target.value)} required />
          </div>
          <div className="flex gap-sm">
            <button className="btn btn-primary" disabled={saving}>Simpan</button>
            <button type="button" className="btn btn-ghost" onClick={() => setResetTarget(null)}>Batal</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
import { FormEvent, useEffect, useState } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import {
  Users,
  Plus,
  Search,
  Download,
  Copy,
  Check,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  QrCode,
  AlertCircle,
  IdCard,
} from 'lucide-react';
import { api } from '../../api/client';
import { Modal, StatusBadge } from '../../components/ui';
import { Button } from '@/components/ui/button';

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
  created_at?: string;
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
  const [cardTarget, setCardTarget] = useState<Member | null>(null);
  const [newPass, setNewPass] = useState('');
  const [copied, setCopied] = useState(false);

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

  const doReset = async (e: FormEvent) => {
    e.preventDefault();
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

  const handleDownloadCard = (m: Member) => {
    const canvas = document.getElementById(`member-canvas-${m.id}`) as HTMLCanvasElement;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.download = `kartu-anggota-${m.no_anggota || m.id}.png`;
    a.href = url;
    a.click();
  };

  const handleCopyCard = async (m: Member) => {
    const canvas = document.getElementById(`member-canvas-${m.id}`) as HTMLCanvasElement;
    if (!canvas) return;
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="size-6 text-primary" />
            Kelola Data Anggota
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {members.length} anggota terdaftar · QR kartu anggota dapat dipindai saat peminjaman/pengembalian buku
          </p>
        </div>
        <Button variant="default" size="sm" onClick={() => setOpen(true)} className="gap-1.5 shadow-xs font-semibold">
          <Plus className="size-4" />
          Tambah Anggota Baru
        </Button>
      </div>

      {msg && (
        <div className="alert alert-error flex items-center gap-2 rounded-xl p-3 bg-red-50 text-red-700 border border-red-200">
          <AlertCircle className="size-4" />
          <span>{msg}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load()}
          placeholder="Cari nama, email, atau nomor anggota..."
          className="w-full bg-input border border-border rounded-xl pl-10 pr-24 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
        <Button
          size="sm"
          variant="secondary"
          onClick={load}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 px-3 rounded-lg text-xs"
        >
          Cari
        </Button>
      </div>

      {loading ? (
        <div className="p-16 text-center text-muted-foreground text-sm">
          Memuat data anggota...
        </div>
      ) : members.length === 0 ? (
        <div className="p-16 text-center border border-dashed rounded-2xl bg-card">
          <Users className="size-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-sm font-semibold text-foreground">Tidak ada anggota ditemukan</p>
          <p className="text-xs text-muted-foreground mt-1">Gunakan kata kunci lain atau daftarkan anggota baru.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                <tr>
                  <th className="p-4 pl-6">Anggota</th>
                  <th className="p-4">No. Anggota</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Pinjaman Aktif</th>
                  <th className="p-4 text-center">Total Pinjam</th>
                  <th className="p-4 text-right">Denda Tertunggak</th>
                  <th className="p-4 text-center">Kartu Pass</th>
                  <th className="p-4 pr-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                          {m.nama.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground text-sm leading-snug">
                            {m.nama}
                          </div>
                          <div className="text-xs text-muted-foreground">{m.email}</div>
                          {m.phone && (
                            <div className="text-[11px] text-muted-foreground font-mono">{m.phone}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-xs font-semibold text-primary">
                      {m.no_anggota || '-'}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={m.status} />
                    </td>
                    <td className="p-4 text-center font-mono text-xs font-semibold">
                      {m.aktif}
                    </td>
                    <td className="p-4 text-center font-mono text-xs text-muted-foreground">
                      {m.total_pinjam}x
                    </td>
                    <td className="p-4 text-right font-mono text-xs">
                      {m.denda_belum > 0 ? (
                        <span className="text-red-500 font-semibold">
                          Rp {Number(m.denda_belum).toLocaleString('id-ID')}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setCardTarget(m)}
                        className="gap-1.5 text-xs rounded-lg shadow-xs"
                      >
                        <IdCard className="size-3.5 text-primary" />
                        ID Card Pass
                      </Button>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => {
                            setResetTarget(m);
                            setNewPass('');
                          }}
                          className="size-8 text-muted-foreground hover:text-foreground"
                          title="Reset Password"
                        >
                          <KeyRound className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => toggleBlock(m)}
                          className={`size-8 ${
                            m.status === 'aktif'
                              ? 'text-amber-500 hover:text-amber-600'
                              : 'text-emerald-500 hover:text-emerald-600'
                          }`}
                          title={m.status === 'aktif' ? 'Blokir Anggota' : 'Buka Blokir'}
                        >
                          {m.status === 'aktif' ? <ShieldAlert className="size-3.5" /> : <ShieldCheck className="size-3.5" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => remove(m)}
                          className="size-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                          title="Hapus Anggota"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="Daftarkan Anggota Perpustakaan">
        <form className="space-y-4 pt-2" onSubmit={add}>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Nama Lengkap *</label>
            <input
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              required
              className="w-full bg-input border border-border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="w-full bg-input border border-border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Password Awal *</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              placeholder="Minimal 6 karakter"
              className="w-full bg-input border border-border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Nomor Telepon / WhatsApp</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="0812..."
              className="w-full bg-input border border-border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="default" disabled={saving} className="font-semibold">
              {saving ? 'Mendaftarkan...' : 'Simpan & Terbitkan Kartu'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal open={!!resetTarget} onClose={() => setResetTarget(null)} title={`Reset Password: ${resetTarget?.nama || ''}`}>
        <form className="space-y-4 pt-2" onSubmit={doReset}>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Password Baru (min. 6 karakter) *</label>
            <input
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              required
              className="w-full bg-input border border-border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => setResetTarget(null)}>
              Batal
            </Button>
            <Button type="submit" variant="default" disabled={saving} className="font-semibold">
              Simpan Password Baru
            </Button>
          </div>
        </form>
      </Modal>

      {/* Digital Member Card Pass Modal */}
      <Modal open={!!cardTarget} onClose={() => setCardTarget(null)} title="Kartu Anggota Digital (Digital Pass)">
        {cardTarget && (
          <div className="flex flex-col items-center justify-center p-2 text-center space-y-4">
            {/* Holographic Styled Member Pass */}
            <div className="w-full max-w-sm rounded-3xl p-6 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white shadow-2xl border border-white/20 relative overflow-hidden text-left">
              {/* Refraction edge line */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-lg bg-blue-500 text-white font-bold flex items-center justify-center text-xs shadow-md">
                    P
                  </div>
                  <span className="font-bold text-sm tracking-tight text-white">
                    Pustaka QR Pass
                  </span>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-400/30">
                  {cardTarget.status}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 my-2">
                <div>
                  <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
                    Nama Anggota
                  </div>
                  <div className="font-bold text-lg text-white leading-tight">
                    {cardTarget.nama}
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">{cardTarget.email}</div>

                  <div className="mt-3">
                    <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                      Nomor Anggota
                    </div>
                    <div className="font-mono font-bold text-sm text-blue-400">
                      {cardTarget.no_anggota || `A${String(cardTarget.id).padStart(4, '0')}`}
                    </div>
                  </div>
                </div>

                <div className="p-2 bg-white rounded-xl shadow-md shrink-0">
                  <QRCodeSVG
                    value={`pustaka:member:${cardTarget.id}`}
                    size={96}
                    level="H"
                    marginSize={1}
                    fgColor="#0f172a"
                    bgColor="#ffffff"
                  />
                </div>
              </div>

              <div className="hidden">
                <QRCodeCanvas
                  id={`member-canvas-${cardTarget.id}`}
                  value={`pustaka:member:${cardTarget.id}`}
                  size={400}
                  level="H"
                  marginSize={2}
                  fgColor="#0f172a"
                  bgColor="#ffffff"
                />
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>VERIFIED DIGITAL PASS</span>
                <span>pustaka:member:{cardTarget.id}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyCard(cardTarget)}
                className="gap-1.5 text-xs rounded-xl"
              >
                {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                {copied ? 'Tersalin' : 'Salin QR'}
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => handleDownloadCard(cardTarget)}
                className="gap-1.5 text-xs rounded-xl font-semibold"
              >
                <Download className="size-3.5" />
                Unduh Kartu
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
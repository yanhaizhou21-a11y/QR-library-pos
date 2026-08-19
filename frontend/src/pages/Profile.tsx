import { FormEvent, useState } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import {
  Download,
  Copy,
  Check,
  LogOut,
  Save,
  ShieldCheck,
  IdCard,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function Profile() {
  const { user, logout, refreshUser } = useAuth();
  const [nama, setNama] = useState(user?.nama || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    setError('');
    try {
      await api.put('/api/auth/me', { nama, phone });
      await refreshUser();
      setMsg('Profil berhasil diperbarui.');
      setTimeout(() => setMsg(''), 4000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDownloadCard = () => {
    if (!user) return;
    const canvas = document.getElementById(`profile-canvas-${user.id}`) as HTMLCanvasElement;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.download = `kartu-anggota-${user.no_anggota || user.id}.png`;
    a.href = url;
    a.click();
  };

  const handleCopyCard = async () => {
    if (!user) return;
    const canvas = document.getElementById(`profile-canvas-${user.id}`) as HTMLCanvasElement;
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

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <IdCard className="size-6 text-primary" />
          Profil &amp; Kartu Anggota Digital
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Identitas digital Anda untuk proses peminjaman dan pengembalian instan di loket scanner.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left: Digital Member Pass */}
        <div className="md:col-span-6 space-y-4">
          <div className="w-full rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white shadow-2xl border border-white/20 relative overflow-hidden text-left space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-xl bg-blue-500 text-white font-black flex items-center justify-center text-sm shadow-md">
                  P
                </div>
                <div>
                  <div className="font-bold text-sm text-white leading-tight">
                    Pustaka QR Digital Pass
                  </div>
                  <div className="text-[10px] text-blue-300 font-mono">
                    MEMBERSHIP ID
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-400/30 font-bold">
                {user.status}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Nama Anggota
                </div>
                <div className="font-bold text-lg text-white leading-tight">
                  {user.nama}
                </div>
                <div className="text-xs text-blue-300 font-mono">{user.email}</div>

                <div className="pt-2">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Nomor Anggota
                  </div>
                  <div className="font-mono font-bold text-sm text-sky-400">
                    {user.no_anggota || `A${String(user.id).padStart(4, '0')}`}
                  </div>
                </div>
              </div>

              <div className="p-2.5 bg-white rounded-2xl shadow-lg shrink-0">
                <QRCodeSVG
                  value={`pustaka:member:${user.id}`}
                  size={100}
                  level="H"
                  marginSize={1}
                  fgColor="#0f172a"
                  bgColor="#ffffff"
                  imageSettings={{
                    src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="%232563EB"/><text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="40" fill="white">P</text></svg>',
                    height: 24,
                    width: 24,
                    excavate: true,
                  }}
                />
              </div>
            </div>

            <div className="hidden">
              <QRCodeCanvas
                id={`profile-canvas-${user.id}`}
                value={`pustaka:member:${user.id}`}
                size={500}
                level="H"
                marginSize={2}
                fgColor="#0f172a"
                bgColor="#ffffff"
              />
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300 font-mono">
              <span className="flex items-center gap-1">
                <ShieldCheck className="size-3 text-emerald-400" />
                VERIFIED PASS
              </span>
              <span>pustaka:member:{user.id}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyCard}
              className="gap-1.5 text-xs rounded-xl shadow-xs"
            >
              {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
              {copied ? 'Tersalin' : 'Salin QR Code'}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleDownloadCard}
              className="gap-1.5 text-xs rounded-xl shadow-xs font-semibold"
            >
              <Download className="size-3.5" />
              Unduh Kartu Pass
            </Button>
          </div>
        </div>

        {/* Right: Edit Profile Form */}
        <div className="md:col-span-6 space-y-4">
          <Card className="rounded-3xl border-border shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold">Informasi Akun</CardTitle>
              <CardDescription className="text-xs">
                Perbarui nama lengkap dan nomor kontak untuk penerimaan notifikasi jatuh tempo.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {msg && (
                <div className="flex items-center gap-2 rounded-xl p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium mb-4">
                  <Check className="size-4 text-emerald-600 shrink-0" />
                  <span>{msg}</span>
                </div>
              )}
              {error && (
                <div className="flex items-center gap-2 rounded-xl p-3 bg-red-50 text-red-700 border border-red-200 text-xs font-medium mb-4">
                  <span>{error}</span>
                </div>
              )}

              <form className="space-y-4" onSubmit={save}>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-muted-foreground">Nama Lengkap</label>
                  <input
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    required
                    className="w-full bg-input border border-border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-muted-foreground">Email</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full bg-muted/60 border border-border rounded-xl p-2.5 text-sm text-muted-foreground cursor-not-allowed font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-muted-foreground">Nomor HP / WhatsApp</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0812..."
                    className="w-full bg-input border border-border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary font-mono"
                  />
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 gap-1.5"
                  >
                    <LogOut className="size-4" />
                    Keluar
                  </Button>
                  <Button
                    type="submit"
                    variant="default"
                    size="sm"
                    disabled={busy}
                    className="font-semibold gap-1.5 shadow-xs"
                  >
                    <Save className="size-4" />
                    {busy ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
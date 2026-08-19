import { FormEvent, useEffect, useState } from 'react';
import { api } from '../../api/client';
import { rupiah } from '../../components/ui';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings, Check, AlertCircle, Shield, Clock, DollarSign, BookOpen } from 'lucide-react';

export default function AdminSettings() {
  const [loanDays, setLoanDays] = useState(7);
  const [finePerDay, setFinePerDay] = useState(1000);
  const [maxActiveLoans, setMaxActiveLoans] = useState(3);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get<{ settings: { loanDays: number; finePerDay: number; maxActiveLoans: number } }>('/api/admin/settings')
      .then((d) => {
        if (!d?.settings) return;
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
      await api.put('/api/admin/settings', { loanDays, finePerDay, maxActiveLoans });
      setMsg('Pengaturan kebijakan perpustakaan berhasil diperbarui.');
      setTimeout(() => setMsg(''), 4000);
    } catch (err: any) {
      setMsg(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Settings className="size-6 text-primary" />
          Pengaturan Kebijakan Perpustakaan
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Sesuaikan aturan masa peminjaman buku, besaran denda keterlambatan, dan kuota pinjaman aktif.
        </p>
      </div>

      {msg && (
        <div className="flex items-center gap-2 rounded-xl p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm font-medium animate-in fade-in">
          <Check className="size-4 text-emerald-600 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="rounded-2xl border-border shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold">Aturan Sirkulasi &amp; Peminjaman</CardTitle>
              <CardDescription className="text-xs">
                Parameter di bawah berlaku otomatis untuk setiap transaksi pemindaian QR baru.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <form className="space-y-5" onSubmit={save}>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <Clock className="size-3.5 text-primary" />
                    Masa Pinjam Standar (Hari)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={loanDays}
                    onChange={(e) => setLoanDays(Number(e.target.value))}
                    className="w-full bg-input border border-border rounded-xl p-2.5 text-sm font-mono outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground">
                    Jarak hari antara tanggal peminjaman dan tanggal jatuh tempo pengembalian.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <DollarSign className="size-3.5 text-primary" />
                    Tarif Denda Keterlambatan Per Hari ({rupiah(finePerDay)}/hari)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={500}
                    value={finePerDay}
                    onChange={(e) => setFinePerDay(Number(e.target.value))}
                    className="w-full bg-input border border-border rounded-xl p-2.5 text-sm font-mono outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground">
                    Denda otomatis dihitung per hari keterlambatan saat QR buku dipindai di loket pengembalian.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <BookOpen className="size-3.5 text-primary" />
                    Batas Maksimal Buku Aktif Per Anggota
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={maxActiveLoans}
                    onChange={(e) => setMaxActiveLoans(Number(e.target.value))}
                    className="w-full bg-input border border-border rounded-xl p-2.5 text-sm font-mono outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground">
                    Anggota tidak dapat meminjam buku melebihi kuota sebelum mengembalikan buku aktif.
                  </p>
                </div>

                <div className="pt-3 border-t border-border flex justify-end">
                  <Button type="submit" variant="default" disabled={busy} className="font-semibold shadow-xs">
                    {busy ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Security & System Info Card */}
        <div className="space-y-4">
          <Card className="rounded-2xl border-border shadow-xs bg-muted/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Shield className="size-3.5" />
                Protokol Keamanan &amp; QR
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <div className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span>Format namespace QR: <code className="text-foreground font-mono">pustaka:book:&lt;id&gt;</code> dan <code className="text-foreground font-mono">pustaka:member:&lt;id&gt;</code></span>
              </div>
              <div className="flex items-start gap-2">
                <div className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span>Enkripsi session berbasis JWT dengan rotasi refresh token otomatis.</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span>Perlindungan brute-force rate limiter pada API autentikasi dan pemindaian.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
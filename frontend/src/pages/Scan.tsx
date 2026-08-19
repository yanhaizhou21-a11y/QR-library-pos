import { useState } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import QRScanner from '../components/QRScanner';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Cover, StatusBadge, rupiah, fmtDate } from '../components/ui';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  QrCode,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  Sparkles,
  Info,
} from 'lucide-react';

type Mode = 'pinjam' | 'kembali' | 'info';
type Stage = 'idle' | 'book' | 'confirm' | 'done';

interface ScanBook {
  id: number;
  judul: string;
  penulis: string;
  kategori: string | null;
  stok_tersedia: number;
  lokasi_rak: string | null;
  cover_url?: string | null;
  qr_code: string;
}
interface ScanMember {
  id: number;
  nama: string;
  no_anggota: string | null;
  status: string;
  qr_code: string;
}

export default function Scan() {
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>('pinjam');
  const [stage, setStage] = useState<Stage>('idle');
  const [book, setBook] = useState<ScanBook | null>(null);
  const [member, setMember] = useState<ScanMember | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);
  const [scanningForMember, setScanningForMember] = useState(false);
  const [manualCode, setManualCode] = useState('');

  const fireConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#2563eb', '#38bdf8', '#10b981', '#f59e0b'],
      });
    } catch {
      // Ignore if unavailable
    }
  };

  const reset = () => {
    setStage('idle');
    setBook(null);
    setMember(null);
    setError('');
    setResult(null);
    setScanningForMember(false);
    setManualCode('');
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    reset();
  };

  const handleScan = async (code: string) => {
    setError('');
    if (scanningForMember) {
      try {
        const d = await api.post<{ valid: boolean; type?: string; member?: ScanMember; error?: string }>('/api/scan/parse', { code });
        if (!d.valid || d.type !== 'member') {
          setError(d.error || 'QR bukan kartu anggota.');
          return;
        }
        setMember(d.member!);
        setScanningForMember(false);
        setStage('book');
      } catch (e: any) {
        setError(e.message);
      }
      return;
    }
    try {
      const d = await api.post<{ valid: boolean; type?: string; book?: ScanBook; member?: ScanMember; error?: string }>('/api/scan/parse', { code });
      if (!d.valid) {
        setError(d.error || 'QR tidak valid.');
        return;
      }
      if (d.type === 'book') {
        setBook(d.book!);
        if (mode === 'info') {
          setStage('done');
        } else {
          setStage('confirm');
        }
      } else if (d.type === 'member') {
        if (mode === 'info') {
          setMember(d.member!);
          setStage('done');
        } else {
          setMember(d.member!);
          setStage('book');
        }
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

  const doBorrow = async () => {
    if (!book) return;
    setBusy(true);
    setError('');
    try {
      const path = user?.role === 'admin' && member ? '/api/scan/borrow-as' : '/api/scan/borrow';
      const body = user?.role === 'admin' && member ? { bookId: book.id, memberId: member.id } : { bookId: book.id };
      const d = await api.post<{ ok: boolean; loan: any }>(path, body);
      setResult(d.loan);
      setStage('done');
      fireConfetti();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const doReturn = async () => {
    if (!book) return;
    setBusy(true);
    setError('');
    try {
      const d = await api.post<{ ok: boolean; loan: any }>('/api/scan/return', { bookId: book.id });
      setResult(d.loan);
      setStage('done');
      if (!d.loan.denda) fireConfetti();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const needsLogin = mode === 'pinjam' && !user;

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-300">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center justify-center gap-2">
          <QrCode className="size-6 text-primary" />
          Pindai QR Loket Mandiri
        </h1>
        <p className="text-sm text-muted-foreground">
          Pindai QR buku atau kartu anggota untuk peminjaman dan pengembalian instan
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-secondary/80 rounded-2xl border border-border/50">
        <button
          onClick={() => switchMode('pinjam')}
          className={`py-2 rounded-xl text-xs font-bold transition-all ${
            mode === 'pinjam'
              ? 'bg-background text-primary shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Pinjam Buku
        </button>
        <button
          onClick={() => switchMode('kembali')}
          className={`py-2 rounded-xl text-xs font-bold transition-all ${
            mode === 'kembali'
              ? 'bg-background text-primary shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Kembalikan
        </button>
        <button
          onClick={() => switchMode('info')}
          className={`py-2 rounded-xl text-xs font-bold transition-all ${
            mode === 'info'
              ? 'bg-background text-primary shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Cek Info QR
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl p-3 bg-red-50 text-red-700 border border-red-200 text-xs font-medium">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {needsLogin && (
        <Card className="rounded-3xl border-border shadow-sm p-6 text-center space-y-4">
          <div className="size-12 rounded-full bg-blue-50 text-primary flex items-center justify-center mx-auto">
            <UserCheck className="size-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">Diperlukan Akun Anggota</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Silakan masuk dengan akun perpustakaan Anda atau buat kartu anggota baru gratis.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-2">
            <Link to="/masuk">
              <Button size="sm" variant="default" className="font-semibold shadow-xs">
                Masuk
              </Button>
            </Link>
            <Link to="/daftar">
              <Button size="sm" variant="outline">
                Daftar Anggota
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {!needsLogin && stage === 'idle' && (
        <Card className="rounded-3xl border-border shadow-sm overflow-hidden p-6 space-y-4">
          <p className="text-xs text-muted-foreground">
            {mode === 'pinjam' &&
              (user?.role === 'admin'
                ? '1) Pindai kartu anggota peminjam · 2) Pindai QR buku yang akan dipinjam.'
                : 'Pindai kartu anggota digital Anda atau konfirmasi menggunakan akun aktif ini.')}
            {mode === 'kembali' && 'Pindai QR pada buku yang ingin dikembalikan ke rak perpustakaan.'}
            {mode === 'info' && 'Pindai QR buku atau anggota untuk melihat detail informasinya.'}
          </p>

          {mode === 'pinjam' && user?.role === 'member' && (
            <Button
              variant="secondary"
              onClick={() => {
                setMember({
                  id: user.id,
                  nama: user.nama,
                  no_anggota: user.no_anggota,
                  status: user.status,
                  qr_code: `pustaka:member:${user.id}`,
                });
                setStage('book');
              }}
              className="w-full justify-center gap-2 text-xs font-semibold py-2.5 rounded-xl border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10"
            >
              <CheckCircle2 className="size-4" />
              Gunakan Akun Saya: {user.nama} ({user.no_anggota || `ID ${user.id}`})
            </Button>
          )}

          <div className="rounded-2xl overflow-hidden border border-border">
            <QRScanner onResult={handleScan} />
          </div>

          {/* Manual Input Fallback */}
          <div className="pt-2 border-t border-border/60">
            <div className="text-[11px] font-semibold text-muted-foreground mb-1.5 flex items-center gap-1">
              <Info className="size-3" />
              Kamera tidak aktif? Masukkan kode QR manual:
            </div>
            <div className="flex gap-2">
              <input
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="contoh: pustaka:book:1 atau pustaka:member:1"
                className="flex-1 bg-input border border-border rounded-xl px-3 py-1.5 text-xs font-mono outline-none focus:ring-2 focus:ring-primary"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => manualCode.trim() && handleScan(manualCode.trim())}
                className="text-xs"
              >
                Kirim
              </Button>
            </div>
          </div>
        </Card>
      )}

      {!needsLogin && stage === 'book' && (
        <Card className="rounded-3xl border-border shadow-sm p-6 space-y-4">
          {member && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-secondary/80 border border-border">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-foreground">
                  Anggota: {member.nama}
                </div>
                <div className="text-[11px] font-mono text-muted-foreground">
                  {member.no_anggota || `ID ${member.id}`} • <StatusBadge status={member.status} />
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setMember(null);
                  setStage('idle');
                }}
                className="text-xs h-7"
              >
                Ganti
              </Button>
            </div>
          )}
          <p className="text-xs text-muted-foreground font-medium">
            Sekarang arahkan kamera ke stiker QR di buku:
          </p>
          <div className="rounded-2xl overflow-hidden border border-border">
            <QRScanner onResult={handleScan} hint="Arahkan ke QR Buku" />
          </div>
        </Card>
      )}

      {stage === 'confirm' && book && (
        <Card className="rounded-3xl border-border shadow-sm p-6 space-y-5">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-foreground">
              Konfirmasi {mode === 'pinjam' ? 'Peminjaman Buku' : 'Pengembalian Buku'}
            </h3>
            <p className="text-xs text-muted-foreground">
              Periksa detail informasi buku sebelum melanjutkan transaksi.
            </p>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-secondary/60 border border-border">
            <Cover url={book.cover_url} title={book.judul} size="md" />
            <div className="space-y-1 min-w-0">
              <h4 className="font-bold text-foreground text-sm leading-tight">
                {book.judul}
              </h4>
              <div className="text-xs text-muted-foreground">{book.penulis}</div>
              <div className="text-[11px] font-mono text-muted-foreground pt-1">
                Kategori: {book.kategori || '-'} • Rak: {book.lokasi_rak || '-'}
              </div>
              <div className="pt-2">
                {mode === 'pinjam' ? (
                  <span
                    className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                      book.stok_tersedia > 0
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-red-500/10 text-red-600'
                    }`}
                  >
                    {book.stok_tersedia > 0
                      ? `${book.stok_tersedia} stok tersedia`
                      : 'Stok Habis'}
                  </span>
                ) : (
                  <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-blue-500/10 text-blue-600">
                    Buku Dikembalikan ke Stok
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={reset}>
              Batal
            </Button>
            <Button
              variant="default"
              disabled={busy}
              onClick={mode === 'pinjam' ? doBorrow : doReturn}
              className="font-bold shadow-xs"
            >
              {busy
                ? 'Memproses...'
                : mode === 'pinjam'
                ? 'Konfirmasi Pinjam'
                : 'Konfirmasi Kembali'}
            </Button>
          </div>
        </Card>
      )}

      {stage === 'done' && mode === 'info' && (
        <Card className="rounded-3xl border-border shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-bold text-foreground">Hasil Pindai QR</h3>
          {book && (
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-secondary/60 border border-border">
              <Cover url={book.cover_url} title={book.judul} size="md" />
              <div className="space-y-1">
                <h4 className="font-bold text-foreground text-sm">{book.judul}</h4>
                <div className="text-xs text-muted-foreground">{book.penulis}</div>
                <div className="text-xs font-mono text-muted-foreground pt-1">
                  Rak: {book.lokasi_rak || '-'} • Sisa Stok: {book.stok_tersedia}
                </div>
              </div>
            </div>
          )}
          {member && (
            <div className="p-4 rounded-2xl bg-secondary/60 border border-border space-y-1">
              <div className="font-bold text-sm text-foreground">{member.nama}</div>
              <div className="text-xs font-mono text-muted-foreground">
                No. Anggota: {member.no_anggota || '-'} • Status: <StatusBadge status={member.status} />
              </div>
            </div>
          )}
          <div className="flex items-center justify-end gap-2 pt-2">
            {book && (
              <Link to={`/buku/${book.id}`}>
                <Button variant="outline" size="sm">
                  Buka Halaman Buku
                </Button>
              </Link>
            )}
            <Button variant="default" size="sm" onClick={reset}>
              Pindai Lagi
            </Button>
          </div>
        </Card>
      )}

      {stage === 'done' && mode !== 'info' && result && (
        <Card className="rounded-3xl border-border shadow-lg p-6 sm:p-8 text-center space-y-5 animate-in zoom-in-95">
          <div className="size-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
            {mode === 'pinjam' ? <Sparkles className="size-8" /> : <CheckCircle2 className="size-8" />}
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-bold text-foreground">
              {mode === 'pinjam'
                ? 'Peminjaman Berhasil!'
                : result.denda > 0
                ? 'Pengembalian Terlambat'
                : 'Pengembalian Selesai!'}
            </h3>
            <p className="text-sm font-semibold text-primary">{result.judul}</p>
            <p className="text-xs text-muted-foreground">
              {mode === 'pinjam'
                ? `Dipinjam oleh ${result.nama}`
                : `Dikembalikan oleh ${result.nama}`}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-secondary/80 border border-border text-xs space-y-2 text-left font-mono">
            {mode === 'pinjam' && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID Transaksi:</span>
                  <span className="font-bold text-foreground">#{result.loanId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Jatuh Tempo:</span>
                  <span className="font-bold text-primary">{fmtDate(result.tanggalJatuhTempo)}</span>
                </div>
              </>
            )}
            {mode === 'kembali' && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hari Terlambat:</span>
                  <span className={`font-bold ${result.hariTerlambat > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                    {result.hariTerlambat} hari
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nominal Denda:</span>
                  <span className={`font-bold ${result.denda > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                    {result.denda > 0 ? rupiah(result.denda) : 'Rp 0 (Tepat Waktu)'}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 pt-2">
            <Button variant="default" onClick={reset} className="font-semibold shadow-xs">
              Selesai / Scan Lagi
            </Button>
            {mode === 'pinjam' && (
              <Link to="/pinjaman">
                <Button variant="outline">
                  Lihat Pinjaman Saya
                </Button>
              </Link>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
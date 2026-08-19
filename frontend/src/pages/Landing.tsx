import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import {
  QrCode,
  Zap,
  ShieldCheck,
  Clock,
  Sparkles,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Users,
  Search,
  ScanLine,
  TrendingUp,
  Award,
  Layers,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api, Book } from '../api/client';
import { Cover, Stars, StatusBadge, rupiah } from '../components/ui';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const STEPS = [
  {
    step: '01',
    title: 'Pilih Mode Transaksi',
    desc: 'Buka scanner di loket mandiri atau smartphone, lalu pilih mode Pinjam atau Kembalikan Buku.',
    icon: ScanLine,
  },
  {
    step: '02',
    title: 'Pindai Kartu Anggota',
    desc: 'Arahkan QR Digital Pass dari HP atau kartu fisik Anda ke kamera. Identitas terverifikasi instan.',
    icon: Users,
  },
  {
    step: '03',
    title: 'Pindai QR Kode Buku',
    desc: 'Scan stiker QR yang tertera di punggung buku. Sistem memvalidasi stok dan kepemilikan real-time.',
    icon: BookOpen,
  },
  {
    step: '04',
    title: 'Konfirmasi Otomatis',
    desc: 'Jatuh tempo terhitung adil. Struk digital tercatat di riwayat akun tanpa antrean kertas.',
    icon: CheckCircle2,
  },
];

export default function Landing() {
  const { user } = useAuth();
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [activeStep, setActiveStep] = useState(0);

  // Live QR Demo Simulator state
  const [demoInput, setDemoInput] = useState('Pustaka VIP Member #882');
  const [demoType, setDemoType] = useState<'member' | 'book'>('member');

  useEffect(() => {
    api
      .get<{ books: Book[] }>('/api/books?limit=6')
      .then((d) => {
        if (d?.books) setFeaturedBooks(d.books);
      })
      .catch(() => {});
  }, []);

  const springTransition = { type: 'spring', stiffness: 120, damping: 20 };

  return (
    <div className="space-y-24 sm:space-y-32 overflow-hidden pb-16">
      {/* ================= HERO SECTION (Asymmetric Split Screen) ================= */}
      <section className="relative pt-12 md:pt-20 lg:pt-28 pb-16 overflow-hidden">
        {/* Subtle decorative mesh glow */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-blue-500/15 via-sky-400/10 to-transparent blur-3xl rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Copy Column */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 space-y-6 text-left"
            >
              {/* Pill Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-wide uppercase">
                <Sparkles className="size-3.5" />
                <span>Pustaka QR v2.0 • 100% Bebas Antrean</span>
              </div>

              {/* High-Impact Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.08]">
                Sirkulasi perpustakaan modern, cukup{' '}
                <span className="bg-gradient-to-r from-blue-600 via-sky-500 to-blue-700 bg-clip-text text-transparent">
                  satu pindai QR.
                </span>
              </h1>

              {/* Sub-paragraph */}
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
                Pinjam dan kembalikan buku dalam 15 detik. Stok terintegrasi real-time, jatuh tempo terhitung otomatis, dan kartu anggota digital selalu di tangan Anda.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link to="/scan">
                  <Button
                    size="lg"
                    className="h-12 px-6 rounded-xl font-bold gap-2 text-base shadow-lg shadow-blue-500/20 bg-primary hover:bg-primary/90 text-primary-foreground transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <QrCode className="size-5" />
                    Pindai QR Sekarang
                  </Button>
                </Link>
                <Link to="/katalog">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-12 px-6 rounded-xl font-semibold gap-2 text-base border-border hover:bg-muted"
                  >
                    <BookOpen className="size-5 text-primary" />
                    Jelajahi Katalog
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-border/70 max-w-lg">
                <div>
                  <div className="font-mono text-xl sm:text-2xl font-bold text-foreground">&lt; 15s</div>
                  <div className="text-xs text-muted-foreground font-medium mt-0.5">Waktu Transaksi</div>
                </div>
                <div>
                  <div className="font-mono text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">100%</div>
                  <div className="text-xs text-muted-foreground font-medium mt-0.5">Sinkronisasi Stok</div>
                </div>
                <div>
                  <div className="font-mono text-xl sm:text-2xl font-bold text-foreground">0 Antre</div>
                  <div className="text-xs text-muted-foreground font-medium mt-0.5">Self-Service Loket</div>
                </div>
              </div>
            </motion.div>

            {/* Right: Interactive Holographic Member Pass & QR Live Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 flex justify-center"
            >
              <div className="relative w-full max-w-md">
                {/* Glow Backdrop */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-sky-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />

                {/* Floating Holographic Card */}
                <div className="relative rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white shadow-2xl border border-white/20 backdrop-blur-xl space-y-6">
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
                          INSTANT ACCESS PASS
                        </div>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-400/30 font-mono">
                      <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      ACTIVE
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Peminjam Terdaftar
                      </div>
                      <div className="text-base font-bold text-white">
                        {user ? user.nama : 'Ahmad Fauzi Nur'}
                      </div>
                      <div className="text-xs text-blue-300 font-mono">
                        {user?.no_anggota || 'A0419 • Reg: 2026'}
                      </div>
                    </div>
                    <div className="p-2 bg-white rounded-xl shadow-lg shrink-0">
                      <QRCodeSVG
                        value={user ? `pustaka:member:${user.id}` : 'pustaka:member:1'}
                        size={84}
                        level="H"
                        marginSize={1}
                        fgColor="#0f172a"
                        bgColor="#ffffff"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Zap className="size-3.5 text-amber-400" />
                      <span>Scan &amp; Go di Loket Mandiri</span>
                    </div>
                    <Link to="/scan" className="text-sky-400 font-bold hover:underline flex items-center gap-1">
                      Mulai Scan <ArrowRight className="size-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= BENTO 2.0 PERPETUAL MOTION GRID ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Teknologi Pintar untuk Perpustakaan Modern
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Dirancang dengan arsitektur responsif, pemrosesan transaksi berkecepatan tinggi, dan automasi denda yang transparan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: 15-Second Radar Scanner */}
          <Card className="rounded-3xl border-border bg-card shadow-xs overflow-hidden p-6 relative">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-3">
              <ScanLine className="size-4" />
              <span>Loket QR Mandiri</span>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              Validasi Instan &lt;15 Detik
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-6">
              Arahkan kamera ke QR buku atau kartu pass. Algoritma pendeteksi membaca kode secara instan bahkan dalam sudut miring.
            </p>
            <div className="h-36 rounded-2xl bg-secondary flex items-center justify-center relative overflow-hidden border border-border/50">
              <div className="absolute size-24 rounded-full border border-blue-500/40 animate-ping" />
              <div className="absolute size-16 rounded-full border border-sky-500/60" />
              <div className="size-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg z-10">
                <QrCode className="size-5" />
              </div>
              <div className="absolute bottom-2 text-[10px] font-mono text-primary font-bold">
                RADAR ACTIVE • 60 FPS
              </div>
            </div>
          </Card>

          {/* Card 2: Real-time Live Circulation Velocity */}
          <Card className="rounded-3xl border-border bg-card shadow-xs overflow-hidden p-6 relative">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider mb-3">
              <TrendingUp className="size-4" />
              <span>Inventaris Otomatis</span>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              Stok Real-Time Akurat
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-6">
              Stok buku bertambah dan berkurang secara otomatis di seluruh cabang saat transaksi checkout/return selesai.
            </p>
            <div className="h-36 rounded-2xl bg-secondary p-4 flex flex-col justify-between border border-border/50 font-mono text-xs">
              <div className="flex justify-between items-center text-foreground font-bold">
                <span>Stok Tersedia</span>
                <span className="text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">98.8% Sinkron</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Clean Code (Robert C. Martin)</span>
                  <span className="font-bold text-foreground">4/5</span>
                </div>
                <div className="w-full bg-border h-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: '80%' }} />
                </div>
              </div>
              <div className="text-[10px] text-muted-foreground text-right">
                Auto-synced with SQLite engine
              </div>
            </div>
          </Card>

          {/* Card 3: Automated Overdue & Fine Guard */}
          <Card className="rounded-3xl border-border bg-card shadow-xs overflow-hidden p-6 relative">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider mb-3">
              <Clock className="size-4" />
              <span>Notifikasi Pintar</span>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              Pengingat Jatuh Tempo
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-6">
              Notifikasi H-1 otomatis dikirim ke akun anggota. Perhitungan denda keterlambatan adil dan transparan.
            </p>
            <div className="h-36 rounded-2xl bg-secondary p-3.5 flex flex-col justify-center gap-2 border border-border/50">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-card border border-border shadow-xs">
                <div className="size-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                  <Clock className="size-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-foreground truncate">Jatuh Tempo Besok</div>
                  <div className="text-[10px] text-muted-foreground truncate">Refactoring: Improving the Design</div>
                </div>
              </div>
              <div className="text-[10px] text-muted-foreground text-center font-mono">
                Tarif standar: Rp 1.000 / hari
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ================= INTERACTIVE QR SIMULATOR STUDIO WIDGET ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-secondary/80 to-muted/80 border border-border p-6 sm:p-10 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold font-mono">
                <QrCode className="size-3.5" />
                INTERACTIVE QR ENGINE
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                Coba Generate QR Code Langsung di Browser Anda
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Ketikkan judul buku atau nama anggota di bawah ini. Mesin JavaScript menghasilkan kode QR beresolusi tinggi dalam hitungan milidetik secara client-side.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setDemoType('member');
                      setDemoInput('Ahmad Fauzi Nur #A0419');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      demoType === 'member'
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-card text-muted-foreground border'
                    }`}
                  >
                    Format Anggota
                  </button>
                  <button
                    onClick={() => {
                      setDemoType('book');
                      setDemoInput('Clean Code: Agile Software Craftsmanship');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      demoType === 'book'
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-card text-muted-foreground border'
                    }`}
                  >
                    Format Buku
                  </button>
                </div>

                <div className="relative">
                  <input
                    value={demoInput}
                    onChange={(e) => setDemoInput(e.target.value)}
                    placeholder="Ketik teks untuk generate QR..."
                    className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary shadow-xs"
                  />
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  Payload: <span className="text-primary font-bold">{demoType === 'member' ? `pustaka:member:${demoInput}` : `pustaka:book:${demoInput}`}</span>
                </div>
              </div>
            </div>

            {/* Right Simulator Display */}
            <div className="lg:col-span-5 flex justify-center">
              <motion.div
                key={demoInput + demoType}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="p-6 bg-white rounded-3xl shadow-xl border-2 border-border/80 flex flex-col items-center justify-center text-center max-w-xs w-full"
              >
                <QRCodeSVG
                  value={demoType === 'member' ? `pustaka:member:${demoInput}` : `pustaka:book:${demoInput}`}
                  size={180}
                  level="H"
                  marginSize={1}
                  fgColor="#0f172a"
                  bgColor="#ffffff"
                  imageSettings={{
                    src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="%232563EB"/><text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="40" fill="white">P</text></svg>',
                    height: 36,
                    width: 36,
                    excavate: true,
                  }}
                />
                <div className="mt-4 font-bold text-sm text-slate-900 truncate max-w-[200px]">
                  {demoInput || 'Pustaka QR'}
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  Verified Client-Side Render
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 4-STEP HOW IT WORKS TIMELINE ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-primary font-mono">
            ALUR KERJA
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Cara Peminjaman Mandiri
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Tanpa formulir panjang atau petugas loket manual, cukup ikuti 4 langkah sederhana.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {STEPS.map((s, idx) => (
            <Card
              key={s.step}
              className={`rounded-3xl border transition-all p-6 text-left relative overflow-hidden ${
                activeStep === idx
                  ? 'border-primary bg-primary/5 shadow-md -translate-y-1'
                  : 'border-border bg-card shadow-xs'
              }`}
              onMouseEnter={() => setActiveStep(idx)}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-2xl font-black text-primary/80">
                  {s.step}
                </span>
                <div className="size-10 rounded-xl bg-secondary flex items-center justify-center text-primary">
                  <s.icon className="size-5" />
                </div>
              </div>
              <h3 className="text-base font-bold text-foreground mb-1.5">
                {s.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {s.desc}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* ================= FEATURED CATALOG SHOWCASE ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-primary font-mono mb-1">
              KOLEKSI UNGGULAN
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Buku Populer Siap Pinjam
            </h2>
          </div>
          <Link to="/katalog">
            <Button variant="ghost" className="gap-2 text-primary font-semibold hover:bg-primary/10">
              Lihat Seluruh Katalog <ChevronRight className="size-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {featuredBooks.map((b) => (
            <Link
              to={`/buku/${b.id}`}
              key={b.id}
              className="group rounded-2xl border border-border bg-card p-3 shadow-xs hover:shadow-md hover:border-primary/50 transition-all flex flex-col justify-between"
            >
              <div className="aspect-[3/4.2] rounded-xl overflow-hidden bg-secondary mb-3 relative">
                {b.cover_url ? (
                  <img
                    src={b.cover_url}
                    alt={b.judul}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs font-bold">
                    📖 Pustaka
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                      b.stok_tersedia > 0
                        ? 'bg-emerald-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    {b.stok_tersedia > 0 ? `${b.stok_tersedia} ada` : 'Habis'}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="font-bold text-xs text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                  {b.judul}
                </div>
                <div className="text-[11px] text-muted-foreground truncate">{b.penulis}</div>
                <div className="pt-1 flex items-center justify-between text-[11px]">
                  <Stars value={b.rating_avg || 5} size={11} />
                  <span className="font-mono text-muted-foreground text-[10px]">
                    Rak {b.lokasi_rak || '-'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ================= CALL TO ACTION (Anti-Slop Conversion Banner) ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-blue-900 via-slate-900 to-blue-950 text-white shadow-2xl border border-white/20 text-center relative overflow-hidden space-y-6">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Siap Menikmati Perpustakaan Tanpa Antrean?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Daftar akun anggota sekarang dalam 30 detik dan dapatkan kartu anggota digital dengan QR code pribadi untuk transaksi peminjaman seketika.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {user ? (
              <Link to="/pinjaman">
                <Button size="lg" className="h-12 px-8 rounded-xl font-bold bg-white text-slate-950 hover:bg-slate-100 shadow-xl">
                  Buka Pinjaman Saya
                </Button>
              </Link>
            ) : (
              <Link to="/daftar">
                <Button size="lg" className="h-12 px-8 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 shadow-xl">
                  Daftar Anggota Gratis
                </Button>
              </Link>
            )}
            <Link to="/scan">
              <Button size="lg" variant="outline" className="h-12 px-8 rounded-xl font-semibold text-white border-white/30 hover:bg-white/10">
                Pindai QR Loket
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

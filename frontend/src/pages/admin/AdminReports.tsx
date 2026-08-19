import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { api } from '../../api/client';
import { Cover } from '../../components/ui';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ReportsIcon, Download01Icon } from '@/components/library/icons';
import { TrendingUp, Award, Activity } from 'lucide-react';

interface Popular {
  id: number;
  judul: string;
  penulis: string;
  cover_url: string | null;
  total_pinjam: number;
  stok_tersedia: number;
}
interface Member {
  id: number;
  nama: string;
  no_anggota: string | null;
  total_pinjam: number;
  terlambat: number;
}
interface Month {
  bulan: string;
  pinjam: number;
  kembali: number;
}

export default function AdminReports() {
  const [popular, setPopular] = useState<Popular[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [months, setMonths] = useState<Month[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get<{ rows: Popular[] }>('/admin/reports/popular-books'),
      api.get<{ rows: Member[] }>('/admin/reports/active-members'),
      api.get<{ months: Month[] }>('/admin/reports/monthly-loans'),
    ])
      .then(([p, m, mo]) => {
        setPopular(p.rows);
        setMembers(m.rows);
        setMonths(mo.months);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const handleExport = () => {
    window.open('/api/admin/reports/export', '_blank');
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-muted-foreground text-sm">
        Menyusun data laporan &amp; visualisasi statistik...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ReportsIcon className="size-6 text-primary" />
            Laporan Analitik &amp; Statistik
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Evaluasi pergerakan sirkulasi, buku terpopuler, dan keaktifan anggota perpustakaan
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="gap-2 shadow-xs font-semibold"
        >
          <Download01Icon className="size-4" />
          Export Laporan CSV
        </Button>
      </div>

      {/* Monthly Circulation Chart */}
      <Card className="rounded-2xl border-border shadow-xs">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Activity className="size-4 text-primary" />
            Tren Peminjaman vs Pengembalian 12 Bulan Terakhir
          </CardTitle>
          <CardDescription className="text-xs">
            Perbandingan volume transaksi bulanan di seluruh branch perpustakaan.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={months} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
                <XAxis dataKey="bulan" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="pinjam" name="Buku Dipinjam" fill="#2563eb" radius={[6, 6, 0, 0]} />
                <Bar dataKey="kembali" name="Buku Dikembalikan" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Popular Books & Active Members 2-Col Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Popular Books */}
        <Card className="rounded-2xl border-border shadow-xs">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <TrendingUp className="size-4 text-blue-500" />
              10 Buku Paling Sering Dipinjam
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/60">
              {popular.map((p, idx) => (
                <div key={p.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="size-6 rounded-md bg-secondary text-foreground text-xs font-bold flex items-center justify-center font-mono">
                      #{idx + 1}
                    </span>
                    <Cover url={p.cover_url} title={p.judul} size="sm" />
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-foreground truncate max-w-xs">
                        {p.judul}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {p.penulis} • Sisa stok: {p.stok_tersedia}
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md shrink-0">
                    {p.total_pinjam}x pinjam
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Members */}
        <Card className="rounded-2xl border-border shadow-xs">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Award className="size-4 text-amber-500" />
              10 Anggota Paling Aktif Membaca
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/60">
              {members.map((m, idx) => (
                <div key={m.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="size-6 rounded-md bg-secondary text-foreground text-xs font-bold flex items-center justify-center font-mono">
                      #{idx + 1}
                    </span>
                    <div className="size-9 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-sm flex items-center justify-center shrink-0">
                      {m.nama.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-foreground truncate">
                        {m.nama}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {m.no_anggota || '-'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono text-xs font-bold text-emerald-600">
                      {m.total_pinjam}x Pinjam
                    </div>
                    {m.terlambat > 0 && (
                      <div className="text-[10px] text-red-500 font-mono">
                        {m.terlambat}x Terlambat
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
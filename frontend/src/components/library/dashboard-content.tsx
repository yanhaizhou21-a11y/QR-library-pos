import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CirculationChart } from './circulation-chart';
import { CollectionDonutChart } from './collection-donut-chart';
import { HeroCard } from './hero-card';
import {
  ArrowDown01Icon,
  BookPlusIcon,
  CancelIcon,
  CheckoutIcon,
  Download01Icon,
  QrCodeIcon,
  ReturnIcon,
  SparklesIcon,
  UserAdd02Icon,
} from './icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  collectionOverview,
  intelligenceCards,
  metrics as defaultMetrics,
  recentActivity,
} from '../../data';
import { cn } from '@/lib/utils';
import { api } from '../../api/client';
import { ArrowUpRight, CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react';

const quickActions = [
  {
    label: 'Pinjam Buku (QR)',
    desc: 'Scan barcode & kartu anggota',
    icon: CheckoutIcon,
    href: '/scan?mode=pinjam',
    badge: 'Fast POS',
  },
  {
    label: 'Pengembalian Buku',
    desc: 'Proses retur koleksi otomatis',
    icon: ReturnIcon,
    href: '/scan?mode=kembali',
    badge: 'Check-In',
  },
  {
    label: 'Tambah Judul Buku',
    desc: 'Input katalog & cetak barcode',
    icon: BookPlusIcon,
    href: '/admin/buku?action=new',
    badge: 'Katalog',
  },
  {
    label: 'Registrasi Anggota',
    desc: 'Buat kartu digital anggota baru',
    icon: UserAdd02Icon,
    href: '/admin/anggota?action=new',
    badge: 'Member',
  },
  {
    label: 'QR Studio Generator',
    desc: 'Generate QR massal & label rak',
    icon: QrCodeIcon,
    href: '/admin/qr-generator',
    badge: 'Studio',
  },
];

export function DashboardContent() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(defaultMetrics);
  const [dismissedCards, setDismissedCards] = useState<string[]>([]);
  const [rawOverview, setRawOverview] = useState<any>(null);

  useEffect(() => {
    // Fetch live library overview from backend if available
    api.get<any>('/api/admin/reports/overview')
      .then((data) => {
        if (!data) return;
        setRawOverview(data);
        setMetrics([
          {
            label: 'Total Active Loans',
            value: Number(data.aktif || 0).toLocaleString(),
            note: `${data.peminjamanHariIni || 0} borrowed today`,
            icon: CheckoutIcon,
            iconClassName: 'text-blue-500',
            trend: 'up',
          },
          {
            label: 'Items Returned Today',
            value: Number(data.pengembalianHariIni || 0).toLocaleString(),
            note: `${data.terlambat || 0} overdue items`,
            icon: ReturnIcon,
            iconClassName: 'text-emerald-500',
            trend: 'up',
          },
          {
            label: 'Total Members',
            value: Number(data.totalAnggota || 0).toLocaleString(),
            note: 'Active digital library cards',
            icon: UserAdd02Icon,
            iconClassName: 'text-sky-500',
            trend: 'up',
          },
          {
            label: 'Pending Fines',
            value: 'Rp ' + Number(data.dendaBelum || 0).toLocaleString('id-ID'),
            note: 'Rp ' + Number(data.totalDenda || 0).toLocaleString('id-ID') + ' settled',
            icon: BookPlusIcon,
            iconClassName: 'text-amber-500',
            trend: 'down',
          },
        ]);
      })
      .catch(() => {
        // Fallback to default metrics
      });
  }, []);

  const handleExport = () => {
    window.open('/api/admin/reports/export', '_blank');
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Adapted Shadcn Hero Command Card */}
      <HeroCard
        activeLoansCount={rawOverview ? rawOverview.aktif : metrics[0]?.value}
        returnedTodayCount={rawOverview ? rawOverview.pengembalianHariIni : metrics[1]?.value}
        totalMembersCount={rawOverview ? rawOverview.totalAnggota : metrics[2]?.value}
        onExportReport={handleExport}
      />

      {/* Top Metrics Section */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <SectionTitle>Key Performance Indicators</SectionTitle>
          <span className="text-xs font-medium text-muted-foreground font-mono">Real-time Metrics</span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>
      </section>

      {/* Quick Action Station */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <SectionTitle>Operational Quick Actions</SectionTitle>
          <span className="text-xs font-medium text-primary hover:underline cursor-pointer" onClick={() => navigate('/admin/qr-generator')}>
            Open QR Center →
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {quickActions.map((action) => (
            <div
              key={action.label}
              onClick={() => navigate(action.href)}
              className="group relative flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 text-card-foreground shadow-xs cursor-pointer smooth-card hover:border-primary/50 hover:bg-muted/40 cyber-chamfer"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <action.icon className="size-5" />
                </div>
                <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-mono font-medium text-muted-foreground group-hover:text-foreground">
                  {action.badge}
                </span>
              </div>
              <div className="mt-4 space-y-1">
                <h3 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-1">
                  <span>{action.label}</span>
                  <ArrowUpRight className="size-3.5 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {action.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Analytics & Distribution Grid */}
      <section className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs smooth-card cyber-chamfer">
          <CirculationChart />
        </div>
        <div className="min-h-84 rounded-xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs smooth-card cyber-chamfer">
          <CollectionOverview />
        </div>
      </section>

      {/* Activity Timeline & Intelligence Feed */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs smooth-card cyber-chamfer">
          <RecentActivity />
        </div>
        <div className="rounded-xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs smooth-card cyber-chamfer">
          <LibraryIntelligence
            dismissedCards={dismissedCards}
            onDismiss={(title) => setDismissedCards((prev) => [...prev, title])}
          />
        </div>
      </section>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground font-heading">
      {children}
    </h2>
  );
}

function MetricCard({
  icon: Icon,
  iconClassName,
  label,
  note,
  value,
  trend,
}: {
  label: string;
  value: string;
  note: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClassName: string;
  trend?: 'up' | 'down';
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border/80 bg-card p-5 text-card-foreground shadow-xs smooth-card cyber-chamfer flex flex-col justify-between">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <div className="flex size-8 items-center justify-center rounded-lg bg-muted/80">
          <Icon className={cn('size-4 shrink-0', iconClassName)} />
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        <div className="text-2xl sm:text-3xl font-bold tracking-tight font-mono text-foreground">
          {value}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {trend === 'up' && (
            <span className="inline-flex items-center gap-0.5 rounded-sm bg-emerald-500/10 px-1.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="size-3" />
              <span>Live</span>
            </span>
          )}
          {trend === 'down' && (
            <span className="inline-flex items-center gap-0.5 rounded-sm bg-blue-500/10 px-1.5 py-0.5 text-[11px] font-medium text-blue-600 dark:text-blue-400">
              <CheckCircle2 className="size-3" />
              <span>Checked</span>
            </span>
          )}
          <span className="truncate">{note}</span>
        </div>
      </div>
    </div>
  );
}

function CollectionOverview() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const total = collectionOverview.segments.reduce(
    (sum, segment) => sum + segment.count,
    0,
  );
  const segments = collectionOverview.segments.map((segment) => ({
    ...segment,
    percentage: total > 0 ? (segment.count / total) * 100 : 0,
  }));
  const chartData = segments.map((segment) => ({
    name: segment.label,
    value: segment.count,
    fill: segment.color,
  }));

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between pb-3 border-b border-border/50">
        <SectionTitle>Collection Distribution</SectionTitle>
        <span className="text-xs font-mono text-muted-foreground">{total.toLocaleString()} Books</span>
      </div>

      <div className="mt-4 flex flex-1 flex-col items-center justify-center gap-6 sm:flex-row sm:justify-between">
        <div className="shrink-0">
          <CollectionDonutChart
            data={chartData}
            total={total}
            label={collectionOverview.label}
            size={180}
            activeIndex={activeIndex}
            onActiveIndexChange={setActiveIndex}
          />
        </div>

        <div className="flex w-full flex-col gap-2.5 sm:max-w-xs">
          {segments.map((segment, index) => (
            <div
              key={segment.label}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              className={cn(
                'flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors cursor-pointer',
                activeIndex === index ? 'bg-muted text-foreground font-semibold' : 'text-muted-foreground hover:bg-muted/50',
              )}
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="truncate">{segment.label}</span>
              </div>
              <div className="flex items-center gap-2 font-mono tabular-nums">
                <span className="text-foreground font-medium">
                  {segment.count.toLocaleString()}
                </span>
                <span className="text-[11px] text-muted-foreground w-10 text-right">
                  {segment.percentage.toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RecentActivity() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between pb-3 border-b border-border/50">
        <SectionTitle>Recent Live Transactions</SectionTitle>
        <span className="text-xs font-mono text-muted-foreground">Desk Activity</span>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {recentActivity.map((activity) => {
          const ActivityIcon = activity.icon;
          return (
            <div
              key={activity.id}
              className="flex items-center gap-3.5 rounded-lg border border-border/50 bg-muted/20 p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background text-primary border border-border/60 shadow-2xs">
                <ActivityIcon className="size-4.5" />
              </div>
              <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                <p className="text-xs sm:text-sm leading-snug truncate">
                  {activity.parts.map((part, index) => (
                    <span
                      key={`${activity.id}-${index}`}
                      className={cn(
                        'text-foreground font-medium',
                        'muted' in part &&
                          part.muted &&
                          'text-muted-foreground font-normal',
                      )}
                    >
                      {part.text}
                    </span>
                  ))}
                </p>
                <time
                  dateTime={activity.dateTime}
                  className="shrink-0 text-[11px] font-mono text-muted-foreground"
                >
                  {activity.time}
                </time>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LibraryIntelligence({
  dismissedCards,
  onDismiss,
}: {
  dismissedCards: string[];
  onDismiss: (title: string) => void;
}) {
  const visibleCards = intelligenceCards.filter(
    (c) => !dismissedCards.includes(c.title),
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between pb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <SectionTitle>Library Intelligence</SectionTitle>
          <span className="flex size-2 rounded-full bg-blue-500 animate-pulse" />
        </div>
        <span className="text-xs font-medium text-primary">Live Insights</span>
      </div>

      <div className="mt-4 flex flex-1 flex-col gap-3">
        {visibleCards.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
            All intelligence notices reviewed and resolved.
          </div>
        ) : (
          visibleCards.map((card) => (
            <div
              key={card.title}
              className={cn(
                'relative flex flex-col gap-2 rounded-lg border p-3.5 transition-all',
                card.tone === 'insight' && 'border-blue-500/30 bg-blue-500/5',
                card.tone === 'warning' && 'border-amber-500/30 bg-amber-500/5',
                card.tone === 'success' && 'border-emerald-500/30 bg-emerald-500/5',
              )}
            >
              <div className="flex items-center justify-between">
                <div
                  className={cn(
                    'flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider',
                    card.tone === 'insight' && 'text-blue-600 dark:text-blue-400',
                    card.tone === 'warning' && 'text-amber-600 dark:text-amber-400',
                    card.tone === 'success' && 'text-emerald-600 dark:text-emerald-400',
                  )}
                >
                  <SparklesIcon className="size-4" />
                  <span>{card.title}</span>
                </div>
                <Button
                  aria-label={`Dismiss ${card.title}`}
                  variant="ghost"
                  size="icon-xs"
                  className="size-5 text-muted-foreground hover:text-foreground"
                  onClick={() => onDismiss(card.title)}
                >
                  <CancelIcon className="size-3.5" />
                </Button>
              </div>

              <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                {card.bodyParts.map((part, index) => (
                  <span
                    key={`${card.title}-${index}`}
                    className={cn(
                      'emphasis' in part &&
                        part.emphasis &&
                        'text-foreground font-semibold',
                    )}
                  >
                    {part.text}
                  </span>
                ))}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


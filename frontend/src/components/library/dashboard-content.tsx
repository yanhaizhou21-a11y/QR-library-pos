import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CirculationChart } from './circulation-chart';
import { CollectionDonutChart } from './collection-donut-chart';
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

const quickActions = [
  { label: 'Checkout Items', icon: CheckoutIcon, href: '/scan?mode=pinjam' },
  { label: 'Process Return', icon: ReturnIcon, href: '/scan?mode=kembali' },
  { label: 'Add New Book', icon: BookPlusIcon, href: '/admin/buku?action=new' },
  { label: 'Add New Member', icon: UserAdd02Icon, href: '/admin/anggota?action=new' },
  { label: 'QR Studio', icon: QrCodeIcon, href: '/admin/qr-generator' },
];

export function DashboardContent() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(defaultMetrics);
  const [dismissedCards, setDismissedCards] = useState<string[]>([]);

  useEffect(() => {
    // Fetch live library overview from backend if available
    api.get<any>('/api/admin/reports/overview')
      .then((data) => {
        if (!data) return;
        setMetrics([
          {
            label: 'Total Active Loans',
            value: Number(data.aktif || 0).toLocaleString(),
            note: `${data.peminjamanHariIni || 0} borrowed today`,
            icon: CheckoutIcon,
            iconClassName: 'text-blue-500',
          },
          {
            label: 'Items Returned Today',
            value: Number(data.pengembalianHariIni || 0).toLocaleString(),
            note: `${data.terlambat || 0} overdue items`,
            icon: ReturnIcon,
            iconClassName: 'text-emerald-500',
          },
          {
            label: 'Total Members',
            value: Number(data.totalAnggota || 0).toLocaleString(),
            note: 'Active digital library cards',
            icon: UserAdd02Icon,
            iconClassName: 'text-sky-500',
          },
          {
            label: 'Pending Fines',
            value: 'Rp ' + Number(data.dendaBelum || 0).toLocaleString('id-ID'),
            note: 'Rp ' + Number(data.totalDenda || 0).toLocaleString('id-ID') + ' settled',
            icon: BookPlusIcon,
            iconClassName: 'text-amber-500',
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
    <>
      <DashboardHeader onExport={handleExport} />
      <div className="@container/dashboard space-y-10">
        <section>
          <SectionTitle>Top Metrics</SectionTitle>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </div>
        </section>

        <section>
          <SectionTitle>Quick Actions</SectionTitle>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {quickActions.map((action) => (
              <Card
                key={action.label}
                onClick={() => navigate(action.href)}
                className="bg-secondary text-secondary-foreground cursor-pointer rounded-xl py-0 shadow-xs border-border/50 transition-all hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <CardContent className="flex h-full items-center justify-between p-3.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="bg-background flex size-10 shrink-0 items-center justify-center rounded-lg shadow-xs text-primary">
                      <action.icon className="size-5" />
                    </div>
                    <span className="text-secondary-foreground/90 text-sm font-medium truncate">
                      {action.label}
                    </span>
                  </div>
                  <ArrowDown01Icon className="text-muted-foreground size-5 -rotate-90 shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-0.5 motion-reduce:transform-none" />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 items-stretch gap-8 @4xl/dashboard:grid-cols-3">
          <div className="@4xl/dashboard:col-span-2">
            <CirculationChart />
          </div>
          <div className="min-h-84">
            <CollectionOverview />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-8 @4xl/dashboard:grid-cols-2">
          <RecentActivity />
          <LibraryIntelligence
            dismissedCards={dismissedCards}
            onDismiss={(title) => setDismissedCards((prev) => [...prev, title])}
          />
        </section>
      </div>
    </>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-medium text-foreground tracking-tight">{children}</h2>;
}

function DashboardHeader({ onExport }: { onExport: () => void }) {
  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:mb-10 sm:flex-row sm:items-end">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Good Day, Librarian
        </h1>
        <div className="flex flex-col gap-2 text-sm leading-[1.4] sm:flex-row sm:items-center">
          <p className="text-primary font-medium">
            Pustaka QR POS &amp; Management System
          </p>
          <div className="bg-muted-foreground hidden size-1.5 rounded-full sm:inline-block" />
          <p className="text-muted-foreground">{todayStr}</p>
        </div>
      </div>
      <Button
        variant="secondary"
        onClick={onExport}
        className="h-10 gap-2.5 px-4 text-sm font-medium tracking-tight border border-border shadow-xs hover:bg-muted"
      >
        <span>Export CSV</span>
        <Download01Icon className="size-4" />
      </Button>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  iconClassName,
  label,
  note,
  noteIcon: NoteIcon,
  value,
}: {
  label: string;
  value: string;
  note: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClassName: string;
  noteIcon?: React.ComponentType<{ className?: string }>;
}) {
  const noteParts = note.match(/^([+-]?\d+(?:\.\d+)?%?|↓\s*\d+)\s+(.*)$/);

  return (
    <Card className="bg-secondary text-secondary-foreground gap-4 rounded-xl p-4.5 shadow-none border border-border/50">
      <div className="flex items-center gap-2">
        <Icon className={cn('size-5 shrink-0', iconClassName)} />
        <span className="text-secondary-foreground/80 text-xs leading-[1.4] font-medium uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="flex flex-col gap-2 mt-2">
        <h3 className="text-foreground text-[30px] leading-none font-bold tracking-tight font-mono">
          {value}
        </h3>
        <p className="flex items-center gap-1 text-xs">
          {NoteIcon && <NoteIcon className="size-3.5 shrink-0" />}
          {noteParts ? (
            <>
              <span className="text-secondary-foreground font-semibold">
                {noteParts[1]}
              </span>{' '}
              <span className="text-muted-foreground">{noteParts[2]}</span>
            </>
          ) : (
            <span className="text-muted-foreground">{note}</span>
          )}
        </p>
      </div>
    </Card>
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
      <SectionTitle>Collection Overview</SectionTitle>
      <Card className="border-border mt-5 flex flex-1 flex-col rounded-xl border py-0 shadow-none">
        <CardContent className="flex h-full flex-col items-center justify-between gap-5 p-4 sm:flex-row sm:items-center sm:gap-8 sm:px-8 @4xl/dashboard:flex-col @4xl/dashboard:gap-5 @4xl/dashboard:px-4">
          <CollectionDonutChart
            data={chartData}
            total={total}
            label={collectionOverview.label}
            size={180}
            activeIndex={activeIndex}
            onActiveIndexChange={setActiveIndex}
          />
          <div className="flex w-full flex-col gap-2 sm:max-w-64 @4xl/dashboard:max-w-none">
            {segments.map((segment, index) => (
              <div
                key={segment.label}
                className={cn(
                  'text-secondary-foreground grid grid-cols-3 items-center text-sm leading-[1.4] transition-opacity duration-200',
                  activeIndex !== null && activeIndex !== index && 'opacity-40',
                )}
              >
                <div className="text-secondary-foreground/80 flex min-w-0 items-center gap-2">
                  <span
                    className="size-3 shrink-0 rounded-sm"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="truncate text-xs font-medium">{segment.label}</span>
                </div>
                <span className="text-center font-mono text-xs font-medium tabular-nums">
                  {segment.count.toLocaleString()}
                </span>
                <span className="text-right font-mono text-xs text-muted-foreground tabular-nums">
                  {segment.percentage % 1 === 0
                    ? `${segment.percentage.toFixed(0)}%`
                    : `${segment.percentage.toFixed(1)}%`}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RecentActivity() {
  return (
    <div>
      <SectionTitle>Recent Activity</SectionTitle>
      <div className="mt-5 flex flex-col gap-4">
        {recentActivity.map((activity) => {
          const ActivityIcon = activity.icon;
          return (
            <div key={activity.id} className="flex items-center gap-3 p-2.5 rounded-xl border border-border/40 bg-card hover:bg-muted/40 transition-colors">
              <div className="bg-secondary text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
                <ActivityIcon className="size-5" />
              </div>
              <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                <p className="text-sm leading-[1.4] truncate">
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
                  className="text-muted-foreground shrink-0 text-xs font-mono"
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
      <div className="flex items-center justify-between gap-2">
        <SectionTitle>Library Intelligence</SectionTitle>
        <span className="text-xs text-primary font-medium">Live Insights</span>
      </div>
      <div className="mt-5 flex flex-1 flex-col justify-between gap-3">
        {visibleCards.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground border border-dashed rounded-xl">
            All intelligence notifications dismissed.
          </div>
        ) : (
          visibleCards.map((card) => (
            <Card
              key={card.title}
              className="bg-secondary text-secondary-foreground rounded-xl py-0 shadow-none border border-border/40"
            >
              <CardContent className="flex flex-col gap-2.5 p-3.5">
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
                    <CancelIcon className="size-4" />
                  </Button>
                </div>
                <div className="flex items-end justify-between gap-3">
                  <p className="flex-1 text-sm leading-[1.4] text-muted-foreground">
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
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

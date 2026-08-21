import { useNavigate } from 'react-router-dom';
import { ArrowRight, QrCode, ScanLine, BookCheck, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeroCardProps {
  activeLoansCount?: string | number;
  returnedTodayCount?: string | number;
  totalMembersCount?: string | number;
  onExportReport?: () => void;
  className?: string;
}

export function HeroCard({
  activeLoansCount = '348',
  returnedTodayCount = '104',
  totalMembersCount = '1,280',
  onExportReport,
  className,
}: HeroCardProps) {
  const navigate = useNavigate();

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 md:p-8 text-card-foreground shadow-sm smooth-card cyber-chamfer',
        className,
      )}
    >
      {/* Subtle background ambient highlight */}
      <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 size-72 rounded-full bg-primary/5 blur-2xl" />

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left Column: Heading & System Status */}
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/60 px-3 py-1 text-xs font-medium backdrop-blur-sm">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-foreground/90 font-mono tracking-tight text-[11px] uppercase">
              POS Terminal #01 • Live Sync Active
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground text-[11px]">{todayStr}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground font-heading">
            Library Operations Command Center
          </h1>

          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Instant QR borrowing, real-time inventory synchronization, and automated loan management. Everything is running with optimal latency.
          </p>

          {/* Operational Micro-Highlights */}
          <div className="pt-2 grid grid-cols-3 gap-3 sm:gap-6 border-t border-border/50">
            <div className="space-y-0.5">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
                Active Loans
              </span>
              <span className="text-lg sm:text-xl font-bold font-mono text-foreground">
                {activeLoansCount}
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
                Returns Today
              </span>
              <span className="text-lg sm:text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {returnedTodayCount}
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
                Registered
              </span>
              <span className="text-lg sm:text-xl font-bold font-mono text-primary">
                {totalMembersCount}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: High-Impact Action Hub */}
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col shrink-0 lg:min-w-64">
          <Button
            size="lg"
            onClick={() => navigate('/scan?mode=pinjam')}
            className="group relative h-12 w-full justify-between gap-3 px-5 text-sm font-semibold tracking-tight shadow-md hover:shadow-lg transition-all"
          >
            <span className="flex items-center gap-2.5">
              <ScanLine className="size-5 transition-transform group-hover:scale-110" />
              <span>Scan &amp; Checkout</span>
            </span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Button>

          <div className="grid grid-cols-2 gap-2.5">
            <Button
              variant="outline"
              size="default"
              onClick={() => navigate('/scan?mode=kembali')}
              className="h-10 gap-2 text-xs font-medium border-border/80 hover:bg-muted/70"
            >
              <BookCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
              <span>Return Desk</span>
            </Button>

            <Button
              variant="outline"
              size="default"
              onClick={() => {
                if (onExportReport) onExportReport();
                else navigate('/admin/laporan');
              }}
              className="h-10 gap-2 text-xs font-medium border-border/80 hover:bg-muted/70"
            >
              <Download className="size-4 text-primary" />
              <span>Export CSV</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

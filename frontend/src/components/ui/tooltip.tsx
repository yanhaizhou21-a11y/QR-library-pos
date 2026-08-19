import * as React from 'react';
import { cn } from '@/lib/utils';

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function Tooltip({ children }: { children: React.ReactNode }) {
  return <div className="relative inline-block group">{children}</div>;
}

export function TooltipTrigger({
  children,
  className,
  asChild,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }) {
  return (
    <div className={cn('inline-flex', className)} {...props}>
      {children}
    </div>
  );
}

export function TooltipContent({
  children,
  className,
  side = 'top',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { side?: 'top' | 'bottom' | 'left' | 'right' }) {
  let pos = 'bottom-full left-1/2 -translate-x-1/2 mb-2';
  if (side === 'bottom') pos = 'top-full left-1/2 -translate-x-1/2 mt-2';
  if (side === 'right') pos = 'left-full top-1/2 -translate-y-1/2 ml-2';
  if (side === 'left') pos = 'right-full top-1/2 -translate-y-1/2 mr-2';

  return (
    <div
      className={cn(
        'pointer-events-none absolute z-50 rounded-md bg-foreground px-2 py-1 text-xs text-background opacity-0 shadow-md transition-opacity group-hover:opacity-100 whitespace-nowrap',
        pos,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

import * as React from 'react';
import { ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    icon?: React.ComponentType;
    color?: string;
    theme?: Record<string, string>;
  }
>;

interface ChartContainerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  config: ChartConfig;
  children: React.ReactElement;
}

export const ChartContainer = React.forwardRef<
  HTMLDivElement,
  ChartContainerProps
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`;

  return (
    <div
      data-chart={chartId}
      ref={ref}
      className={cn(
        'flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke="#fff"]]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke="#ccc"]]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke="#ccc"]]:stroke-border [&_.recharts-sector[stroke="#fff"]]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none',
        className,
      )}
      {...props}
    >
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
});
ChartContainer.displayName = 'ChartContainer';

export const ChartTooltip = ({
  content,
  ...props
}: {
  content: React.ReactElement | ((props: any) => React.ReactNode);
  [key: string]: any;
}) => {
  if (typeof content === 'function') {
    return React.createElement(content, props);
  }
  return content;
};

import * as React from 'react';
import { cn } from '@/lib/utils';

const InputGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'relative flex items-center rounded-lg border border-border bg-input transition-colors focus-within:ring-2 focus-within:ring-primary focus-within:border-primary',
      className,
    )}
    {...props}
  />
));
InputGroup.displayName = 'InputGroup';

const InputGroupAddon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center justify-center text-muted-foreground pointer-events-none shrink-0',
      className,
    )}
    {...props}
  />
));
InputGroupAddon.displayName = 'InputGroupAddon';

const InputGroupInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'flex-1 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  />
));
InputGroupInput.displayName = 'InputGroupInput';

export { InputGroup, InputGroupAddon, InputGroupInput };

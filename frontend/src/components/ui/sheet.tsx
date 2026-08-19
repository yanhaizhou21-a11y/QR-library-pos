import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SheetContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SheetContext = React.createContext<SheetContextType | null>(null);

function useSheet() {
  const ctx = React.useContext(SheetContext);
  if (!ctx) throw new Error('useSheet must be used within Sheet');
  return ctx;
}

export function Sheet({
  children,
  open: controlledOpen,
  onOpenChange,
}: {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange],
  );

  return (
    <SheetContext.Provider value={{ open, setOpen }}>
      {children}
    </SheetContext.Provider>
  );
}

export const SheetTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ className, children, onClick, ...props }, ref) => {
  const { open, setOpen } = useSheet();

  return (
    <button
      ref={ref}
      type="button"
      onClick={(e) => {
        onClick?.(e);
        setOpen(!open);
      }}
      className={cn('inline-flex items-center justify-center cursor-pointer', className)}
      {...props}
    >
      {children}
    </button>
  );
});
SheetTrigger.displayName = 'SheetTrigger';

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: 'top' | 'bottom' | 'left' | 'right';
  showCloseButton?: boolean;
}

export const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  (
    {
      className,
      children,
      side = 'right',
      showCloseButton = true,
      ...props
    },
    ref,
  ) => {
    const { open, setOpen } = useSheet();

    React.useEffect(() => {
      if (!open) return;
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setOpen(false);
      };
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [open, setOpen]);

    if (!open) return null;

    let sideClasses = 'inset-y-0 right-0 h-full w-3/4 max-w-sm border-l';
    if (side === 'left') sideClasses = 'inset-y-0 left-0 h-full w-3/4 max-w-sm border-r';
    else if (side === 'top') sideClasses = 'inset-x-0 top-0 border-b';
    else if (side === 'bottom') sideClasses = 'inset-x-0 bottom-0 border-t';

    return (
      <div className="fixed inset-0 z-50 flex">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
          onClick={() => setOpen(false)}
        />

        {/* Content */}
        <div
          ref={ref}
          className={cn(
            'fixed z-50 flex flex-col bg-background p-6 shadow-2xl transition ease-in-out animate-in border-border',
            sideClasses,
            className,
          )}
          {...props}
        >
          {showCloseButton && (
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
            >
              <X className="size-5" />
              <span className="sr-only">Close</span>
            </button>
          )}
          {children}
        </div>
      </div>
    );
  },
);
SheetContent.displayName = 'SheetContent';

export const SheetHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-2 text-left', className)}
    {...props}
  />
));
SheetHeader.displayName = 'SheetHeader';

export const SheetTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-lg font-semibold text-foreground', className)}
    {...props}
  />
));
SheetTitle.displayName = 'SheetTitle';

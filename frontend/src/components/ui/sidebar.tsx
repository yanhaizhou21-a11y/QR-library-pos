import * as React from 'react';
import { PanelLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface SidebarContextType {
  state: 'expanded' | 'collapsed';
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = React.createContext<SidebarContextType | null>(null);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.');
  }
  return context;
}

export const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }
>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      className,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const [isMobile, setIsMobile] = React.useState(false);
    const [openMobile, setOpenMobile] = React.useState(false);

    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
    const open = openProp !== undefined ? openProp : uncontrolledOpen;
    const setOpen = React.useCallback(
      (value: boolean | ((value: boolean) => boolean)) => {
        const nextOpen = typeof value === 'function' ? value(open) : value;
        if (setOpenProp) {
          setOpenProp(nextOpen);
        } else {
          setUncontrolledOpen(nextOpen);
        }
      },
      [open, setOpenProp],
    );

    React.useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const toggleSidebar = React.useCallback(() => {
      return isMobile
        ? setOpenMobile((open) => !open)
        : setOpen((open) => !open);
    }, [isMobile, setOpen]);

    const state = open ? 'expanded' : 'collapsed';

    const contextValue = React.useMemo<SidebarContextType>(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
      }),
      [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar],
    );

    return (
      <SidebarContext.Provider value={contextValue}>
        <div
          ref={ref}
          data-state={state}
          data-collapsible={state === 'collapsed' ? 'icon' : ''}
          className={cn('group/sidebar-wrapper flex min-h-svh w-full text-foreground', className)}
          style={style}
          {...props}
        >
          {children}
        </div>
      </SidebarContext.Provider>
    );
  },
);
SidebarProvider.displayName = 'SidebarProvider';

export const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    collapsible?: 'offcanvas' | 'icon' | 'none';
  }
>(({ className, children, collapsible = 'icon', ...props }, ref) => {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  return (
    <aside
      ref={ref}
      data-state={state}
      data-collapsible={collapsed ? collapsible : undefined}
      className={cn(
        'group hidden md:flex flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ease-in-out shrink-0 select-none z-30',
        collapsed ? 'w-[var(--sidebar-width-icon,5rem)]' : 'w-[var(--sidebar-width,18.125rem)]',
        className,
      )}
      {...props}
    >
      {children}
    </aside>
  );
});
Sidebar.displayName = 'Sidebar';

export const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col gap-2 p-3 border-b border-border', className)}
    {...props}
  />
));
SidebarHeader.displayName = 'SidebarHeader';

export const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden p-2',
      className,
    )}
    {...props}
  />
));
SidebarContent.displayName = 'SidebarContent';

export const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col gap-2 p-3 border-t border-border', className)}
    {...props}
  />
));
SidebarFooter.displayName = 'SidebarFooter';

export const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn('flex w-full min-w-0 flex-col gap-1 list-none p-0 m-0', className)}
    {...props}
  />
));
SidebarMenu.displayName = 'SidebarMenu';

export const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn('relative list-none', className)} {...props} />
));
SidebarMenuItem.displayName = 'SidebarMenuItem';

export const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    isActive?: boolean;
    tooltip?: string;
  }
>(({ className, isActive, tooltip: _tooltip, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      data-active={isActive || undefined}
      className={cn(
        'peer/menu-button flex w-full items-center gap-3 overflow-hidden rounded-lg p-2 text-left text-sm outline-none transition-colors hover:bg-muted focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer text-muted-foreground data-active:text-primary data-active:font-medium',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
});
SidebarMenuButton.displayName = 'SidebarMenuButton';

export const SidebarMenuSub = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn(
      'mx-3.5 flex min-w-0 flex-col gap-1 border-l border-border px-2.5 py-1 list-none',
      className,
    )}
    {...props}
  />
));
SidebarMenuSub.displayName = 'SidebarMenuSub';

export const SidebarMenuSubItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn('list-none', className)} {...props} />
));
SidebarMenuSubItem.displayName = 'SidebarMenuSubItem';

export const SidebarMenuSubButton = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    isActive?: boolean;
  }
>(({ className, isActive, children, ...props }, ref) => (
  <a
    ref={ref}
    data-active={isActive || undefined}
    className={cn(
      'flex h-8 min-w-0 items-center gap-2 overflow-hidden rounded-md px-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-active:text-primary data-active:font-semibold',
      className,
    )}
    {...props}
  >
    {children}
  </a>
));
SidebarMenuSubButton.displayName = 'SidebarMenuSubButton';

export const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn('size-9', className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <PanelLeft className="size-4" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
});
SidebarTrigger.displayName = 'SidebarTrigger';

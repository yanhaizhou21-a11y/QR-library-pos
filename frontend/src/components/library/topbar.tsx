'use client';

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Palette, Search, Sparkles, X } from 'lucide-react';

import {
  ArrowDown01Icon,
  BellIcon,
  BuildingIcon,
  DashboardIcon,
} from './icons';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { organizations, topNavNotifications } from '../../data';
import { cn } from '@/lib/utils';
import { useTheme, THEME_OPTIONS } from './theme-provider';

const searchPlaceholder = 'Search catalog, members, ISBN, QR (Press ⌘K)';

export function DashboardTopbar() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [selectedOrg, setSelectedOrg] = useState<string>(organizations[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mobileSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [mobileSearchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/buku?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const currentThemeObj = THEME_OPTIONS.find((t) => t.id === theme) || THEME_OPTIONS[0];

  return (
    <header className="bg-background/95 backdrop-blur-md sticky top-0 z-30 flex h-16 items-center gap-2.5 border-b border-border/80 px-4 md:h-18 md:pl-6 md:pr-8">
      <div
        className={cn(
          'mr-auto flex items-center gap-2 md:gap-3 text-base sm:text-lg font-bold text-foreground font-heading',
          mobileSearchOpen && 'hidden md:flex',
        )}
      >
        <SidebarTrigger size="icon-lg" className="size-9 md:hidden" />
        <DashboardIcon className="hidden size-5 text-primary md:block" />
        <span className="truncate tracking-tight">Admin Console</span>
      </div>

      <form onSubmit={handleSearchSubmit} className={cn(mobileSearchOpen ? 'flex-1' : 'hidden md:block')}>
        <InputGroup
          className={cn(
            'bg-input h-9 gap-2 border border-border/80 pl-3 md:flex md:w-84 md:flex-none rounded-lg shadow-2xs focus-within:border-primary/60 transition-colors',
          )}
        >
          <InputGroupAddon className="pl-0">
            <Search className="size-4 text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            ref={searchInputRef}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            aria-label="Search catalog, members, ISBN"
            className="h-full p-0 text-xs sm:text-sm font-medium"
            placeholder={searchPlaceholder}
          />
        </InputGroup>
      </form>

      <Button
        aria-label={mobileSearchOpen ? 'Close search' : 'Search library'}
        aria-pressed={mobileSearchOpen}
        variant="secondary"
        size="icon-lg"
        className="size-9 md:hidden"
        onClick={() => setMobileSearchOpen((open) => !open)}
      >
        {mobileSearchOpen ? (
          <X className="size-4.5" />
        ) : (
          <Search className="size-4.5" />
        )}
      </Button>

      {/* Theme Switcher Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Change Theme"
          className={cn(
            buttonVariants({ variant: 'outline', size: 'default' }),
            'h-9 gap-2 px-2.5 rounded-lg border-border/80 hover:bg-muted/80 text-foreground text-xs font-medium cursor-pointer',
          )}
        >
          <Palette className="size-4 text-primary shrink-0" />
          <span className="hidden sm:inline-block max-w-28 truncate">{currentThemeObj.label}</span>
          <ArrowDown01Icon className="size-3.5 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 p-1.5 shadow-xl rounded-xl">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Theme System</span>
              <Sparkles className="size-3.5 text-primary" />
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {THEME_OPTIONS.map((opt) => (
              <DropdownMenuItem
                key={opt.id}
                onClick={() => setTheme(opt.id)}
                className={cn(
                  'flex items-center justify-between rounded-lg px-2.5 py-2 text-xs cursor-pointer',
                  theme === opt.id ? 'bg-primary/10 text-primary font-bold' : 'text-foreground hover:bg-muted',
                )}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{opt.label}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">{opt.badge}</span>
                </div>
                {theme === opt.id && <Check className="size-4 text-primary shrink-0" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Notifications Dropdown */}
      <div className={cn(mobileSearchOpen && 'hidden md:block')}>
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Notifications"
            className={cn(
              buttonVariants({ variant: 'secondary', size: 'icon-lg' }),
              'relative size-9 rounded-lg border border-border/60 cursor-pointer',
            )}
          >
            <BellIcon className="size-4.5" />
            {topNavNotifications.some(
              (notification) => notification.unread,
            ) && (
              <span className="absolute top-2 right-2 size-2 rounded-full bg-blue-500 ring-2 ring-background" />
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-[calc(100vw-2rem)] max-w-80 p-2 shadow-xl rounded-xl"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex items-center justify-between px-2 py-1.5 font-bold tracking-wider uppercase text-xs">
                <span>Notifications</span>
                <span className="font-medium normal-case text-primary">
                  {
                    topNavNotifications.filter(
                      (notification) => notification.unread,
                    ).length
                  }{' '}
                  unread
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-70 space-y-1 overflow-y-auto py-1">
                {topNavNotifications.slice(0, 3).map((notif) => (
                  <DropdownMenuItem
                    key={notif.id}
                    className="flex flex-col items-start gap-1 rounded-lg p-2.5 outline-hidden transition-colors"
                  >
                    <div className="flex w-full items-start justify-between gap-2">
                      <span className="line-clamp-2 text-xs leading-normal font-medium text-foreground">
                        {notif.text}
                      </span>
                      {notif.unread && (
                        <span className="mt-1 size-1.5 shrink-0 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <span className="text-muted-foreground text-[11px] font-mono">
                      {notif.time}
                    </span>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-primary font-medium justify-center text-xs"
                onClick={() => navigate('/admin/reservasi')}
              >
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Library Branch Selector */}
      <div className="hidden md:block">
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={`Select library branch. Current branch: ${selectedOrg}`}
            className="flex h-9 cursor-pointer items-center justify-center gap-2 px-2.5 py-1.5 rounded-lg border border-border/80 hover:bg-muted transition-colors text-xs"
          >
            <div className="bg-primary text-primary-foreground flex size-5.5 items-center justify-center rounded shadow-2xs">
              <BuildingIcon className="size-3.5" />
            </div>
            <span className="text-xs font-semibold text-foreground truncate max-w-32">{selectedOrg}</span>
            <ArrowDown01Icon className="size-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-60 rounded-xl p-2 shadow-xl"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-2 py-1.5 font-bold tracking-wider uppercase text-xs">
                Select Library Branch
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {organizations.map((org) => (
                <DropdownMenuItem
                  key={org}
                  onClick={() => setSelectedOrg(org)}
                  className={cn(
                    'justify-between rounded-lg px-2 py-2 text-xs cursor-pointer',
                    org === selectedOrg
                      ? 'text-primary font-bold bg-primary/10'
                      : 'text-muted-foreground',
                  )}
                >
                  <span>{org}</span>
                  {org === selectedOrg && (
                    <Check className="text-primary size-4" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

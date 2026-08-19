'use client';

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Search, X } from 'lucide-react';

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

const searchPlaceholder = '“Search catalog, members, ISBN, QR”';

export function DashboardTopbar() {
  const navigate = useNavigate();
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

  return (
    <header className="bg-background/95 backdrop-blur-md sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border px-4 md:h-20 md:pl-6 md:pr-8">
      <div
        className={cn(
          'mr-auto flex items-center gap-2 md:gap-3 text-lg font-semibold text-foreground',
          mobileSearchOpen && 'hidden md:flex',
        )}
      >
        <SidebarTrigger size="icon-lg" className="size-10 md:hidden" />
        <DashboardIcon className="hidden size-5 text-primary md:block" />
        <span className="truncate tracking-tight">Admin Console</span>
      </div>

      <form onSubmit={handleSearchSubmit} className={cn(mobileSearchOpen ? 'flex-1' : 'hidden md:block')}>
        <InputGroup
          className={cn(
            'bg-input h-10 gap-2 border border-border/70 pl-3 md:flex md:w-80 md:flex-none rounded-xl',
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
            className="h-full p-0 text-sm"
            placeholder={searchPlaceholder}
          />
        </InputGroup>
      </form>

      <Button
        aria-label={mobileSearchOpen ? 'Close search' : 'Search library'}
        aria-pressed={mobileSearchOpen}
        variant="secondary"
        size="icon-lg"
        className="size-10 md:hidden"
        onClick={() => setMobileSearchOpen((open) => !open)}
      >
        {mobileSearchOpen ? (
          <X className="size-5" />
        ) : (
          <Search className="size-5" />
        )}
      </Button>

      <div className={cn(mobileSearchOpen && 'hidden md:block')}>
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Notifications"
            className={cn(
              buttonVariants({ variant: 'secondary', size: 'icon-lg' }),
              'relative size-10 rounded-xl border border-border/50',
            )}
          >
            <BellIcon className="size-5" />
            {topNavNotifications.some(
              (notification) => notification.unread,
            ) && (
              <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-blue-500 ring-2 ring-background" />
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-[calc(100vw-2rem)] max-w-80 p-2"
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

      <div className="hidden md:block">
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={`Select library branch. Current branch: ${selectedOrg}`}
            className="flex h-10 cursor-pointer items-center justify-center gap-2 px-2.5 py-1.5 rounded-xl border border-border/70 hover:bg-muted transition-colors"
          >
            <div className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-lg shadow-xs">
              <BuildingIcon className="size-4" />
            </div>
            <span className="text-xs font-semibold text-foreground truncate max-w-32">{selectedOrg}</span>
            <ArrowDown01Icon className="size-4 text-muted-foreground" />
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
                    'justify-between rounded-lg px-2 py-2 text-xs',
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

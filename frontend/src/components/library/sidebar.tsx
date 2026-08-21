'use client';

import { Check, Ellipsis } from 'lucide-react';
import { useRef, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

import { Logo } from './logo';
import { useTheme } from './theme-provider';

import {
  ArrowDown01Icon,
  BackwardIcon,
  BuildingIcon,
  HelpIcon,
  SettingsIcon,
  ThemeIcon,
} from './icons';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import {
  type NavigationItem,
  organizations,
  primaryNavigation,
} from '../../data';

const menuButtonBaseClassName =
  'h-10 gap-3 rounded-lg border border-transparent px-3 text-sm font-medium text-muted-foreground transition-all duration-150 hover:bg-muted hover:text-foreground data-active:border-border/80 data-active:bg-muted/80 data-active:text-foreground data-active:font-semibold [&_svg]:size-4.5 [&_svg]:text-muted-foreground data-active:[&_svg]:text-primary';

const sidebarMenuButtonClassName = cn(
  menuButtonBaseClassName,
  'group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0!',
);

const sidebarMenuSubButtonClassName = cn(
  menuButtonBaseClassName,
  'h-9 text-xs [&_svg]:size-4 data-active:font-semibold',
);

const subItemsMenuContentClassName = 'z-100 w-48 p-1.5 shadow-lg';

const bottomNavItemClassName = cn(
  buttonVariants({ variant: 'ghost' }),
  'text-foreground hover:text-primary h-full flex-1 px-0 hover:bg-transparent rounded-none',
);

const moreNavItemClassName = cn(
  menuButtonBaseClassName,
  'flex items-center text-sm',
);

const mobilePrimaryNavigation = primaryNavigation.slice(0, 4);
const mobileMoreNavigation = primaryNavigation.slice(4);

export function DashboardSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, toggleSidebar } = useSidebar();
  const { toggleTheme } = useTheme();
  const collapsed = state === 'collapsed';

  // Determine active section based on current URL
  const currentPath = location.pathname;
  let activeSection = 'dashboard';
  if (currentPath === '/admin/qr-generator') activeSection = 'qr-generator';
  else if (currentPath.startsWith('/admin/buku')) activeSection = 'books';
  else if (currentPath.startsWith('/admin/transaksi')) activeSection = 'loans';
  else if (currentPath.startsWith('/admin/anggota')) activeSection = 'members';
  else if (currentPath.startsWith('/admin/denda')) activeSection = 'fines';
  else if (currentPath.startsWith('/admin/reservasi')) activeSection = 'reservations';
  else if (currentPath.startsWith('/admin/laporan')) activeSection = 'reports';
  else if (currentPath.startsWith('/admin/pengaturan')) activeSection = 'settings';

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader
          className={cn(
            'h-20 flex-row items-center border-b p-0 transition-[padding] duration-200 library-dashboard bg-background',
            collapsed ? 'justify-start px-5' : 'justify-between px-4.5',
          )}
        >
          {!collapsed ? (
            <>
              <Link
                aria-label="Library dashboard"
                className="flex h-8 items-center gap-2.5"
                to="/"
              >
                <Logo className="size-8" />
                <span className="text-xl font-bold tracking-tight text-foreground">
                  Pustaka QR
                </span>
              </Link>
              <Button
                aria-label="Collapse sidebar"
                variant="secondary"
                size="icon-lg"
                onClick={toggleSidebar}
              >
                <BackwardIcon className="size-5" />
              </Button>
            </>
          ) : (
            <div className="relative size-10">
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center transition-all duration-200 group-hover:scale-75 group-hover:opacity-0">
                <Logo className="size-6" />
              </div>
              <div className="pointer-events-none absolute inset-0 flex scale-75 items-center justify-center opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:scale-100 group-hover:opacity-100">
                <Button
                  aria-label="Expand sidebar"
                  variant="secondary"
                  size="icon-lg"
                  onClick={toggleSidebar}
                >
                  <BackwardIcon className="size-5 rotate-180" />
                </Button>
              </div>
            </div>
          )}
        </SidebarHeader>

        <SidebarContent className="px-3 pt-4 pb-2 library-dashboard bg-background">
          <SidebarMenu className="gap-1">
            {primaryNavigation.map((item) => (
              <SidebarNavigationItem
                key={item.section}
                active={item.section === activeSection}
                item={item}
                onNavigate={(href) => navigate(href)}
              />
            ))}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="border-t px-3 pt-2 pb-4 library-dashboard bg-background">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={activeSection === 'help-support'}
                tooltip="Help & Support"
                className={sidebarMenuButtonClassName}
                onClick={() => navigate('/admin/pengaturan')}
              >
                <HelpIcon />
                {!collapsed && <span>Help & Support</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem className="flex items-center gap-1">
              <SidebarMenuButton
                isActive={activeSection === 'settings'}
                tooltip="Settings"
                className={cn(sidebarMenuButtonClassName, !collapsed && 'flex-1')}
                onClick={() => navigate('/admin/pengaturan')}
              >
                <SettingsIcon />
                {!collapsed && <span>Settings</span>}
              </SidebarMenuButton>
              {!collapsed && (
                <Button
                  aria-label="Toggle theme"
                  variant="ghost"
                  size="icon"
                  className="size-10 text-muted-foreground hover:text-foreground"
                  onClick={toggleTheme}
                >
                  <ThemeIcon className="size-5" />
                </Button>
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <MobileBottomNavigation
        activeSection={activeSection}
      />
    </>
  );
}

function MobileBottomNavigation({
  activeSection,
}: {
  activeSection: string;
}) {
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();
  const [moreOpen, setMoreOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<string>(organizations[0]);
  const moreActive = mobileMoreNavigation.some(
    (item) => item.section === activeSection,
  );

  return (
    <div className="bg-background/90 backdrop-blur-md fixed inset-x-0 bottom-0 z-50 flex h-16 items-center justify-around border-t px-2 md:hidden">
      {mobilePrimaryNavigation.map((item) => {
        const active = item.section === activeSection;
        const Icon = item.icon;

        return (
          <button
            key={item.section}
            onClick={() => navigate(item.href)}
            aria-label={item.label}
            className={cn(
              bottomNavItemClassName,
              active && 'text-primary font-semibold',
            )}
          >
            <Icon className="size-5" />
          </button>
        );
      })}

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetTrigger
          aria-label="More navigation"
          className={cn(
            bottomNavItemClassName,
            moreActive && 'text-primary font-semibold',
          )}
        >
          <Ellipsis className="size-5" />
        </SheetTrigger>
        <SheetContent
          side="bottom"
          showCloseButton={true}
          className="max-h-[85dvh] gap-2 rounded-t-3xl px-4 pt-4 pb-6 md:hidden"
        >
          <div className="bg-border mx-auto h-1 w-10 rounded-full" />
          <SheetHeader className="px-0 pt-2 pb-1">
            <SheetTitle className="text-lg font-semibold">More Modules</SheetTitle>
          </SheetHeader>

          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                buttonVariants({ variant: 'ghost' }),
                'h-auto w-full justify-between py-2 border rounded-xl my-2',
              )}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="bg-foreground text-background dark:bg-muted flex size-9 shrink-0 items-center justify-center rounded-lg">
                  <BuildingIcon className="size-5" />
                </span>
                <span className="min-w-0 text-left">
                  <span className="text-muted-foreground block text-xs font-normal">
                    Library Branch
                  </span>
                  <span className="block truncate text-sm font-semibold">
                    {selectedOrg}
                  </span>
                </span>
              </span>
              <ArrowDown01Icon className="text-muted-foreground size-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="center"
              side="top"
              sideOffset={8}
              className="z-70 w-[calc(100vw-2rem)] max-w-sm rounded-xl p-2 shadow-lg"
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel className="px-2 py-1.5 font-semibold tracking-wider uppercase">
                  Select Branch
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {organizations.map((organization) => (
                  <DropdownMenuItem
                    key={organization}
                    onClick={() => setSelectedOrg(organization)}
                    className={cn(
                      'justify-between rounded-lg px-2 py-2.5',
                      organization === selectedOrg
                        ? 'text-primary font-semibold'
                        : 'text-muted-foreground',
                    )}
                  >
                    <span>{organization}</span>
                    {organization === selectedOrg && (
                      <Check className="text-primary size-4" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <nav aria-label="More navigation" className="flex flex-col gap-1.5 overflow-y-auto">
            {mobileMoreNavigation.map((item) => {
              const Icon = item.icon;
              const active = item.section === activeSection;

              return (
                <button
                  key={item.section}
                  data-active={active || undefined}
                  onClick={() => {
                    navigate(item.href);
                    setMoreOpen(false);
                  }}
                  className={cn(moreNavItemClassName, 'w-full text-left')}
                >
                  <Icon />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <button
              data-active={activeSection === 'help-support' || undefined}
              onClick={() => {
                navigate('/admin/pengaturan');
                setMoreOpen(false);
              }}
              className={cn(moreNavItemClassName, 'w-full text-left')}
            >
              <HelpIcon />
              <span>Help & Support</span>
            </button>
            <div className="flex items-center gap-1">
              <button
                data-active={activeSection === 'settings' || undefined}
                onClick={() => {
                  navigate('/admin/pengaturan');
                  setMoreOpen(false);
                }}
                className={cn(moreNavItemClassName, 'flex-1 text-left')}
              >
                <SettingsIcon />
                <span>Settings</span>
              </button>
              <Button
                aria-label="Toggle theme"
                variant="ghost"
                size="icon"
                className="size-11"
                onClick={toggleTheme}
              >
                <ThemeIcon className="size-5" />
              </Button>
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}

type SidebarNavigationItemProps = {
  active: boolean;
  item: NavigationItem;
  onNavigate: (href: string) => void;
};

function SidebarNavigationItem({
  active,
  item,
  onNavigate,
}: SidebarNavigationItemProps) {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const [open, setOpen] = useState(false);
  const [flyoutOpen, setFlyoutOpen] = useState(false);
  const flyoutCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const subItems = item.subItems;
  const hasSubItems = Boolean(subItems?.length);
  const showSubItems = !collapsed && open && hasSubItems;

  const DisplayedIcon = item.icon;
  const displayedLabel = item.label;

  function toggleOpen(e: React.MouseEvent) {
    if (hasSubItems) {
      e.stopPropagation();
      setOpen((currentOpen) => !currentOpen);
    } else {
      onNavigate(item.href);
    }
  }

  function openFlyout() {
    if (flyoutCloseTimer.current) {
      clearTimeout(flyoutCloseTimer.current);
    }
    setFlyoutOpen(true);
  }

  function scheduleFlyoutClose() {
    flyoutCloseTimer.current = setTimeout(() => {
      setFlyoutOpen(false);
    }, 120);
  }

  return (
    <SidebarMenuItem>
      {collapsed && hasSubItems ? (
        <DropdownMenu
          modal={false}
          open={flyoutOpen}
          onOpenChange={setFlyoutOpen}
        >
          <DropdownMenuTrigger
            aria-label={displayedLabel}
            data-active={active || undefined}
            onPointerEnter={openFlyout}
            onPointerLeave={scheduleFlyoutClose}
            onClick={() => onNavigate(item.href)}
            className={cn(sidebarMenuButtonClassName, 'flex w-full items-center')}
          >
            <DisplayedIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="right"
            align="start"
            sideOffset={8}
            onPointerEnter={openFlyout}
            onPointerLeave={scheduleFlyoutClose}
            className={subItemsMenuContentClassName}
          >
            <NavigationSubItemsMenu
              item={item}
              onSelect={(href) => onNavigate(href)}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      ) : hasSubItems ? (
        <SidebarMenuButton
          isActive={active}
          onClick={toggleOpen}
          className={sidebarMenuButtonClassName}
        >
          <DisplayedIcon />
          {!collapsed && (
            <>
              <span onClick={() => onNavigate(item.href)} className="flex-1">{displayedLabel}</span>
              <ArrowDown01Icon
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(!open);
                }}
                className={cn(
                  'pointer-events-auto ml-auto size-4 transition-transform p-0.5 rounded hover:bg-muted',
                  open && 'rotate-180',
                )}
              />
            </>
          )}
        </SidebarMenuButton>
      ) : (
        <SidebarMenuButton
          isActive={active}
          tooltip={displayedLabel}
          className={sidebarMenuButtonClassName}
          onClick={() => onNavigate(item.href)}
        >
          <DisplayedIcon />
          {!collapsed && <span>{displayedLabel}</span>}
        </SidebarMenuButton>
      )}

      {showSubItems ? (
        <SidebarMenuSub>
          {subItems?.map((subItem) => {
            const SubIcon = subItem.icon;
            return (
              <SidebarMenuSubItem key={subItem.href}>
                <SidebarMenuSubButton
                  isActive={location.pathname === subItem.href}
                  className={sidebarMenuSubButtonClassName}
                  href={subItem.href}
                  onClick={(event) => {
                    event.preventDefault();
                    onNavigate(subItem.href);
                  }}
                >
                  <SubIcon />
                  <span>{subItem.label}</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            );
          })}
        </SidebarMenuSub>
      ) : null}
    </SidebarMenuItem>
  );
}

function NavigationSubItemsMenu({
  item,
  onSelect,
}: {
  item: NavigationItem;
  onSelect: (href: string) => void;
}) {
  return (
    <DropdownMenuGroup>
      <DropdownMenuLabel className="px-2 py-1 font-semibold tracking-wider uppercase text-xs">
        {item.label}
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      {item.subItems?.map((subItem) => {
        const SubIcon = subItem.icon;

        return (
          <DropdownMenuItem
            key={subItem.href}
            onClick={() => onSelect(subItem.href)}
            className={cn(
              sidebarMenuSubButtonClassName,
              'h-10 gap-2.5 px-3 focus:bg-muted focus:text-foreground',
            )}
          >
            <SubIcon />
            <span>{subItem.label}</span>
          </DropdownMenuItem>
        );
      })}
    </DropdownMenuGroup>
  );
}

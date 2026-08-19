import React from 'react';
import {
  ArrowDown02Icon,
  BookOpen02Icon,
  BookPlusIcon,
  CatalogIcon,
  CheckoutIcon,
  CirculationIcon,
  DashboardIcon,
  MembersIcon,
  OpacIcon,
  QrCodeIcon,
  ReportsIcon,
  ReturnIcon,
  UserAdd02Icon,
} from './components/library/icons';

export type NavigationItem = {
  section: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  subItems?: Array<{
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
};

// Generate realistic circulation timestamps for weekly, monthly, and yearly view
const now = Date.now();
const DAY_MS = 24 * 60 * 60 * 1000;

export const circulationData = {
  weekly: [
    { timestamp: now - 6 * DAY_MS, checkouts: 42, returns: 35 },
    { timestamp: now - 5 * DAY_MS, checkouts: 58, returns: 48 },
    { timestamp: now - 4 * DAY_MS, checkouts: 64, returns: 52 },
    { timestamp: now - 3 * DAY_MS, checkouts: 82, returns: 70 },
    { timestamp: now - 2 * DAY_MS, checkouts: 95, returns: 88 },
    { timestamp: now - 1 * DAY_MS, checkouts: 110, returns: 96 },
    { timestamp: now, checkouts: 128, returns: 104 },
  ],
  monthly: Array.from({ length: 28 }).map((_, i) => ({
    timestamp: now - (27 - i) * DAY_MS,
    checkouts: Math.floor(40 + Math.sin(i / 3) * 25 + i * 2.2),
    returns: Math.floor(35 + Math.cos(i / 3) * 20 + i * 1.8),
  })),
  yearly: Array.from({ length: 12 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (11 - i));
    return {
      timestamp: d.getTime(),
      checkouts: Math.floor(1200 + Math.sin(i / 2) * 400 + i * 50),
      returns: Math.floor(1100 + Math.cos(i / 2) * 350 + i * 45),
    };
  }),
};

export const collectionOverview = {
  label: 'Total Collection',
  segments: [
    { label: 'Technology & AI', count: 1420, color: '#2563eb' },
    { label: 'Science & Math', count: 980, color: '#38bdf8' },
    { label: 'Literature & Fiction', count: 1850, color: '#10b981' },
    { label: 'History & Culture', count: 740, color: '#f59e0b' },
    { label: 'Philosophy & Arts', count: 530, color: '#8b5cf6' },
  ],
};

export const metrics = [
  {
    label: 'Total Active Loans',
    value: '348',
    note: '+12.4% vs last week',
    icon: BookOpen02Icon,
    iconClassName: 'text-blue-500',
    noteIcon: ArrowDown02Icon,
  },
  {
    label: 'Items Returned Today',
    value: '104',
    note: '98.2% on-time return rate',
    icon: ReturnIcon,
    iconClassName: 'text-emerald-500',
  },
  {
    label: 'Active Members',
    value: '1,280',
    note: '+46 new this month',
    icon: MembersIcon,
    iconClassName: 'text-sky-500',
    noteIcon: ArrowDown02Icon,
  },
  {
    label: 'Pending Fines',
    value: 'Rp 42.000',
    note: '↓ 18% lower default rate',
    icon: CirculationIcon,
    iconClassName: 'text-amber-500',
  },
];

export const quickActions = [
  { label: 'Scan & Checkout', icon: CheckoutIcon, action: 'checkout' },
  { label: 'Process Return', icon: ReturnIcon, action: 'return' },
  { label: 'Add New Book', icon: BookPlusIcon, action: 'add-book' },
  { label: 'Add New Member', icon: UserAdd02Icon, action: 'add-member' },
  { label: 'QR Generator Studio', icon: QrCodeIcon, action: 'qr-studio' },
];

export const recentActivity = [
  {
    id: 'act-1',
    icon: CheckoutIcon,
    parts: [
      { text: 'Ahmad Fauzi', muted: false },
      { text: ' borrowed ', muted: true },
      { text: 'Clean Code: Handbook of Agile', muted: false },
    ],
    dateTime: new Date(now - 12 * 60 * 1000).toISOString(),
    time: '12m ago',
  },
  {
    id: 'act-2',
    icon: ReturnIcon,
    parts: [
      { text: 'Siti Rahma', muted: false },
      { text: ' returned ', muted: true },
      { text: 'Designing Data-Intensive Applications', muted: false },
    ],
    dateTime: new Date(now - 45 * 60 * 1000).toISOString(),
    time: '45m ago',
  },
  {
    id: 'act-3',
    icon: QrCodeIcon,
    parts: [
      { text: 'Petugas Admin', muted: false },
      { text: ' generated batch QR for ', muted: true },
      { text: '15 new Science books', muted: false },
    ],
    dateTime: new Date(now - 2 * 3600 * 1000).toISOString(),
    time: '2h ago',
  },
  {
    id: 'act-4',
    icon: UserAdd02Icon,
    parts: [
      { text: 'Budi Santoso', muted: false },
      { text: ' registered and received ', muted: true },
      { text: 'Digital Member Card #A0142', muted: false },
    ],
    dateTime: new Date(now - 4 * 3600 * 1000).toISOString(),
    time: '4h ago',
  },
];

export const intelligenceCards = [
  {
    title: 'High Circulation Demand',
    tone: 'insight' as const,
    bodyParts: [
      { text: 'The ' },
      { text: 'Computer Science', emphasis: true },
      { text: ' shelf has reached ' },
      { text: '92% checkout capacity', emphasis: true },
      { text: '. Consider acquiring 5 additional copies.' },
    ],
  },
  {
    title: 'Overdue Warning Notice',
    tone: 'warning' as const,
    bodyParts: [
      { text: '3 loans are ' },
      { text: '> 3 days overdue', emphasis: true },
      { text: '. Automated WhatsApp reminder was dispatched.' },
    ],
  },
  {
    title: 'Inventory Sync Optimal',
    tone: 'success' as const,
    bodyParts: [
      { text: 'All ' },
      { text: '100% of QR scans', emphasis: true },
      { text: ' matched database records with zero sync discrepancy.' },
    ],
  },
];

export const organizations = [
  'Central Digital Library',
  'North Tech Hub Branch',
  'South Downtown Library',
  'East Science Campus',
];

export const primaryNavigation: NavigationItem[] = [
  {
    section: 'dashboard',
    label: 'Dashboard',
    icon: DashboardIcon,
    href: '/admin',
  },
  {
    section: 'qr-generator',
    label: 'QR Studio',
    icon: QrCodeIcon,
    href: '/admin/qr-generator',
  },
  {
    section: 'books',
    label: 'Books Catalog',
    icon: CatalogIcon,
    href: '/admin/buku',
    subItems: [
      { label: 'All Books', href: '/admin/buku', icon: CatalogIcon },
      { label: 'Add Book', href: '/admin/buku?action=new', icon: BookPlusIcon },
    ],
  },
  {
    section: 'loans',
    label: 'Transactions',
    icon: CirculationIcon,
    href: '/admin/transaksi',
  },
  {
    section: 'members',
    label: 'Members Directory',
    icon: MembersIcon,
    href: '/admin/anggota',
    subItems: [
      { label: 'All Members', href: '/admin/anggota', icon: MembersIcon },
      { label: 'Register Member', href: '/admin/anggota?action=new', icon: UserAdd02Icon },
    ],
  },
  {
    section: 'fines',
    label: 'Fines & Settlement',
    icon: ReturnIcon,
    href: '/admin/denda',
  },
  {
    section: 'reservations',
    label: 'Reservations',
    icon: OpacIcon,
    href: '/admin/reservasi',
  },
  {
    section: 'reports',
    label: 'Analytics & Reports',
    icon: ReportsIcon,
    href: '/admin/laporan',
  },
];

export const topNavNotifications = [
  {
    id: 'notif-1',
    text: 'Reservasi buku "Clean Code" sudah siap diambil oleh peminjam.',
    time: '5m ago',
    unread: true,
  },
  {
    id: 'notif-2',
    text: '3 pengembalian buku tercatat otomatis via scanner loket.',
    time: '25m ago',
    unread: true,
  },
  {
    id: 'notif-3',
    text: 'Rekap mingguan sirkulasi koleksi siap diunduh.',
    time: '1h ago',
    unread: false,
  },
  {
    id: 'notif-4',
    text: 'Denda keterlambatan Rp 5.000 telah diselesaikan via loket.',
    time: '3h ago',
    unread: false,
  },
];

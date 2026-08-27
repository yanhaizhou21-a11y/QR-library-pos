# Pustaka — Library POS System Frontend

**Primary Target:** `frontend/`  
**Related Targets:** `frontend/src/pages`, `frontend/src/components`, `frontend/src/context`

---

## Overview

**Pustaka** is a comprehensive library management system with dual interfaces:
1. **Public/Member Interface** — Book catalog, borrowing via QR scan, loan tracking, reservations
2. **Admin Dashboard** — Operations management, inventory, members, reports, analytics

**Current State:** Production-ready. Full-stack TypeScript app with React, modern design system, QR-based workflow, 5 theme modes (light/dark/monochrome/cyberpunk), responsive mobile-first layout.

**Mode:** Operate (task completion) + Persuade (landing page)

---

## Tech Stack & Architecture

### Core Framework
- **React 18.3.1** + **TypeScript 5.5.4**
- **Vite 5.4.0** — Build tool
- **React Router DOM 6.26.0** — Client-side routing
- **Tailwind CSS 4.3.3** + Custom CSS design system

### UI/UX Libraries
- **@base-ui/react 1.7.0** — Headless UI primitives
- **lucide-react 1.32.0** — Icon system
- **motion 13.1.0** — Animation/motion effects
- **recharts 3.10.1** — Data visualization
- **canvas-confetti 1.9.4** — Delight micro-interactions

### Barcode/QR
- **html5-qrcode 2.3.8** — Camera scanner (borrowing/return)
- **qrcode 1.5.4** + **qrcode.react 4.2.0** — QR generation (member cards, book labels)

### Design System
- **class-variance-authority 0.7.1** — Component variants
- **clsx 2.1.1** + **tailwind-merge 3.6.0** — className utilities

---

## Design System

### Color Tokens
Defined in `frontend/src/styles.css`:

```
--primary: #2563eb (blue)
--primary-strong: #1d4ed8
--primary-soft: #dbeafe
--accent: #38bdf8 (cyan)
--accent-strong: #0ea5e9
--ink: #0f172a (text)
--ink-soft: #475569 (muted text)
--ink-faint: #94a3b8
--line: #e2e8f0 (borders)
--card: #ffffff
--danger: #dc2626
--warn: #b45309
--ok: #15803d
```

### Themes (5 modes)
Managed via `ThemeContext`:
1. **Light** — Default, soft blues
2. **Dark** — High contrast dark mode
3. **Monochrome** — Black/white/gray
4. **Monochrome Dark** — Inverted monochrome
5. **Cyberpunk** — Neon accent variant

Toggle via topbar UI, persisted to `localStorage.pustaka_theme`.

### Typography
- **Primary Font:** Outfit (sans-serif, variable weight)
- **Mono Font:** JetBrains Mono (code/numbers)
- **Scale:** 12px–32px with semantic classes
- **Letter-spacing:** -0.02em on headings

### Spacing & Radius
- **Base unit:** 4px grid
- **Radius:** `--radius` = 12px, `--radius-sm` = 8px
- **Gaps:** 8px, 12px, 16px, 24px

### Component Patterns
**Shadcn-style composable primitives:**
- `Button` — 6 variants (default/destructive/outline/secondary/ghost/link), 7 sizes
- `Card` — Header/Title/Description/Content/Footer composition
- `Sidebar` — Collapsible nav with icon-only mode
- `Badge` — Status indicators (8 semantic variants)
- `Modal` — Esc-dismissible overlay
- `Stars` — 5-star rating display
- `Cover` — Book cover with fallback emoji
- `StatusBadge` — Transaction/member status labels

---

## Information Architecture

### Public/Member Routes
All wrapped in `<UserLayout>` (simple topbar + footer):

```
/                    Landing — Hero, features, demo preview
/katalog             Catalog — Search, filter by category, 60 books per page
/buku/:id            Book Detail — Cover, ratings, reviews, reserve/scan CTA
/scan                QR Scanner — Borrow/return workflow with camera
/masuk               Login
/daftar              Register
/lupa-password       Forgot Password
/reset-password      Reset Password
/pinjaman            My Loans — Active + history table, CSV export
/notifikasi          Notifications — Due dates, reservations ready
/profil              Profile — QR member card, edit info, change password
```

### Admin Routes
Wrapped in `<RequireAdmin>` + `<DashboardLayout>` (sidebar + topbar):

```
/admin                  Overview — Stats, charts (circulation, collection)
/admin/buku             Books — CRUD, bulk import CSV, QR label printing
/admin/transaksi        Loans — Search, filter, manual borrow/return
/admin/anggota          Members — CRUD, block/unblock, CSV export
/admin/denda            Fines — View, waive, payment tracking
/admin/reservasi        Reservations — FIFO queue, fulfill/cancel
/admin/laporan          Reports — Analytics, export CSV
/admin/pengaturan       Settings — System config
/admin/qr-generator     QR Generator — Batch generate labels
```

### Auth Guards
- `<RequireAuth>` — Redirects to `/masuk` if not logged in
- `<RequireAdmin>` — Checks `user.role === 'admin'`, redirects if not

---

## Key User Flows

### 1. Member Borrows Book
1. Browse `/katalog`, filter by category
2. Click book → `/buku/:id` detail page
3. Tap "Pinjam via Scan" → `/scan`
4. Camera opens, scan book QR
5. API creates loan, shows success + confetti
6. View active loan in `/pinjaman`

### 2. Member Returns Book
1. Go to `/scan`
2. Switch to "Pengembalian" tab
3. Scan book QR
4. API closes loan, calculates late fees if any
5. Shows receipt with total fine

### 3. Admin Adds New Book
1. `/admin/buku` → "Tambah Buku" button
2. Form: title, author, ISBN, category, stock, cover URL
3. Submit → API creates book
4. Print QR label for book spine

### 4. Admin Fulfills Reservation
1. `/admin/reservasi` → View FIFO queue
2. When book returned, click "Penuhi" on next in queue
3. System notifies member via `/notifikasi`
4. Member has 24h to borrow before expiration

---

## Visual Hierarchy & Layout

### Public Pages
- **Minimal chrome** — Clean topbar (logo, search, login), no sidebar
- **Card-based layout** — White cards on subtle gray background
- **Hero section** — Large gradient, animated elements, clear CTAs
- **Grid system** — Responsive book cards, 2–6 columns based on viewport

### Admin Dashboard
- **Sidebar nav** — Collapsible, icons + labels, active state highlighting
- **Topbar** — Search, notifications badge, theme toggle, profile dropdown
- **Content area** — Max-width 1280px, 24px padding
- **Data tables** — Zebra striping, hover states, pagination
- **Charts** — Recharts for bar/line/donut, muted color palette

### Mobile Behavior
- **Breakpoint:** 768px (md)
- **Sidebar** — Becomes bottom nav bar on mobile
- **Tables** — Horizontal scroll wrapper
- **Forms** — Stack fields vertically
- **Search** — Full-width input

---

## Motion & Micro-interactions

### Animations (Motion/Framer)
- **Landing hero** — Fade-in sequence, stagger children
- **Book cards** — Scale on hover (1.02x)
- **Buttons** — Scale on press (0.98x)
- **Sidebar** — Width transition 280ms ease
- **Page transitions** — Fade-in opacity 200ms

### Delight Moments
- **Loan success** — Confetti burst from center
- **QR scan** — Green flash overlay
- **Copy button** — Icon changes to checkmark 2s
- **Theme toggle** — Smooth color transition 300ms

### Loading States
- **Spinner** — Centered "Memuat..." with rotating icon
- **Skeleton** — Gray pulse on data tables (not implemented, uses spinner)
- **Disabled buttons** — 50% opacity, no pointer events

---

## Accessibility

### Current State
- **Semantic HTML** — `<button>`, `<nav>`, `<main>`, `<article>`
- **Alt text** — Book covers have `alt={title}`
- **Focus visible** — Ring on keyboard focus (2px primary color)
- **ARIA labels** — Modal close buttons, icon-only buttons
- **Keyboard nav** — Enter to submit forms, Esc to close modals

### Gaps to Address
- **Color contrast** — Some muted text may fail WCAG AA on light backgrounds
- **Screen reader announcements** — Loading states, form errors need aria-live regions
- **Skip links** — Missing "Skip to content" for keyboard users
- **Touch targets** — Some icon buttons < 44px (mobile accessibility concern)

---

## Performance

### Current Optimizations
- **Lazy image loading** — `loading="lazy"` on book covers
- **Code splitting** — React Router lazy loading (not yet implemented)
- **Tree shaking** — Vite production build
- **Font optimization** — System font stack fallback

### Opportunities
- **Image CDN** — Optimize/resize cover images via CDN
- **Virtual scrolling** — For large book catalogs (60+ items)
- **Service worker** — Offline catalog browsing
- **Bundle analysis** — Check for duplicate dependencies

---

## Data Flow & API Integration

### API Client (`frontend/src/api/client.ts`)
Centralized fetch wrapper:
- **Base URL:** `http://localhost:4000` (proxied via Vite dev server)
- **Auth:** JWT access token in `Authorization: Bearer` header
- **Refresh:** Auto-refresh expired tokens via `/auth/refresh`
- **Error handling:** Throws with message extraction from API response
- **Methods:** `get<T>`, `post<T>`, `put<T>`, `patch<T>`, `delete<T>`, `download`

### Context Providers
1. **AuthContext** — User state, login/logout, token management
2. **ThemeContext** — Theme mode, toggle, localStorage persistence

### State Management
- **Local component state** — `useState` for forms, modals, loading flags
- **URL state** — `useSearchParams` for filters, pagination
- **No global state library** — Simple app, Context API sufficient

---

## Forms & Validation

### Pattern
- **Controlled inputs** — `value` + `onChange`
- **Client-side validation** — Required fields, email format (minimal)
- **Server-side validation** — API returns error messages
- **Error display** — `.alert.alert-error` above form or inline per field

### Examples
- **Login** — Email + password
- **Register** — Name, email, password, phone (optional)
- **Book form** — Title, author, ISBN, category, stock, publisher, year, description, cover URL
- **Review form** — Rating (1–5 stars dropdown) + optional text

---

## Edge Cases & Error States

### Handled
- **Empty states** — "Tidak ada buku" in catalog, "Belum ada ulasan" in reviews
- **Loading states** — Spinner during API calls
- **Auth redirect** — Unauthenticated users sent to `/masuk`
- **404 page** — Custom NotFound component
- **API errors** — Alert banner with message

### Could Improve
- **Offline detection** — Show banner when network lost
- **Stale data** — Refetch on window focus
- **Optimistic updates** — UI updates before API confirms
- **Retry logic** — Auto-retry failed requests
- **Rate limit feedback** — Specific message for 429 errors

---

## Internationalization (i18n)

### Current: Indonesian Only
- All UI text hardcoded in Bahasa Indonesia
- Date formatting: `toLocaleDateString('id-ID')`
- Currency: `Rp` prefix with `toLocaleString('id-ID')`

### To Add Multi-language
1. Use `react-i18next` or `next-intl`
2. Extract strings to JSON locale files
3. Add language switcher in topbar
4. Store preference in `localStorage`
5. Update API to accept `Accept-Language` header

---

## Reusable Patterns & Components

### UI Primitives (`frontend/src/components/ui/`)
- **button.tsx** — CVA variants, forwardRef
- **card.tsx** — Composable Card/Header/Title/Description/Content/Footer
- **sidebar.tsx** — Collapsible nav with Base UI primitives
- **tooltip.tsx** — Hover/focus tooltip
- **dropdown-menu.tsx** — Menu trigger + items
- **sheet.tsx** — Slide-in panel (mobile nav)
- **input-group.tsx** — Input with prefix/suffix icons
- **chart.tsx** — Recharts wrapper with theme colors

### Library Components (`frontend/src/components/library/`)
- **logo.tsx** — Gradient icon + "Pustaka" wordmark
- **topbar.tsx** — Search, notifications, theme toggle, user menu
- **sidebar.tsx** — Admin nav with icons + labels
- **hero-card.tsx** — Landing page feature cards
- **circulation-chart.tsx** — Bar chart for loan trends
- **collection-donut-chart.tsx** — Category distribution
- **icons.tsx** — Custom Lucide icon exports
- **theme-provider.tsx** — Theme toggle component

### Utilities (`frontend/src/lib/utils.ts`)
- `cn()` — Merge className strings with tailwind-merge + clsx

### Shared UI Functions (`frontend/src/components/ui.tsx`)
- `Modal` — Backdrop + dialog with Esc handler
- `Stars` — Rating display (★★★★☆)
- `Cover` — Book cover image with fallback
- `rupiah()` — Format currency
- `fmtDate()` — Format date (DD MMM YYYY)
- `fmtDateTime()` — Format date + time
- `StatusBadge` — Status enum → colored badge

---

## Code Quality & Conventions

### Strengths
- **TypeScript strict mode** — Type safety on interfaces, API responses
- **Consistent naming** — PascalCase components, camelCase functions/vars
- **Single responsibility** — Small, focused components
- **Reusable abstractions** — Design system tokens, utility functions

### Inconsistencies
- **Import style** — Mix of `import { X } from` and shorthand imports
- **CSS methodology** — Mix of Tailwind utility classes and custom `.card`, `.btn` classes
- **Component file location** — Some primitives in `ui/`, others in root `components/`

### To Standardize
1. Consolidate all primitives under `ui/`
2. Migrate custom CSS classes to Tailwind variants
3. Use absolute imports (`@/components`) everywhere
4. Add ESLint + Prettier for formatting

---

## Design Tokens (CSS Custom Properties)

### Colors
```css
--primary, --primary-strong, --primary-soft
--accent, --accent-strong
--ink, --ink-soft, --ink-faint
--line, --line-strong
--bg, --bg-sunken, --card
--danger, --danger-bg
--warn, --warn-bg
--ok, --ok-bg
```

### Spacing
```css
--space-xs: 4px
--space-sm: 8px
--space-md: 12px
--space-lg: 16px
--space-xl: 24px
--space-2xl: 32px
```

### Radius
```css
--radius: 12px
--radius-sm: 8px
--radius-lg: 16px
```

### Shadows
```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05)
--shadow: 0 1px 3px rgba(0,0,0,0.1)
--shadow-md: 0 4px 6px rgba(0,0,0,0.1)
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1)
```

### Transitions
```css
--ease: cubic-bezier(0.4, 0, 0.2, 1)
--duration-fast: 150ms
--duration: 200ms
--duration-slow: 300ms
```

---

## Browser Support

### Target
- **Modern evergreen browsers** — Chrome, Edge, Firefox, Safari (last 2 versions)
- **Mobile** — iOS Safari 14+, Chrome Android

### Features Used
- **CSS Grid & Flexbox** — Full support
- **CSS Custom Properties** — Full support
- **ES2022** — Optional chaining, nullish coalescing
- **WebRTC (camera)** — For QR scanner, requires HTTPS in production

### Polyfills
None currently. If supporting older browsers:
- Add `@babel/preset-env` with browserslist
- Polyfill Promise, fetch if needed

---

## Deployment

### Build
```bash
cd frontend
npm run build
# Output: frontend/dist/
```

### Environment
- **Dev:** Vite dev server on `localhost:5173`, proxies `/api` to backend `localhost:4000`
- **Production:** Static files served from `dist/`, backend at separate domain (configure `API_BASE_URL`)

### Assets
- **Fonts:** Loaded from Google Fonts (Outfit) or local files
- **Images:** Book covers from external URLs (user-provided)
- **Icons:** Inlined SVGs from lucide-react

---

## Security

### Current Measures
- **JWT auth** — Access + refresh tokens, httpOnly cookies (backend)
- **XSS protection** — React escapes output by default
- **CSRF** — Not needed (JWT in header, not cookie)
- **Input sanitization** — Basic validation on forms

### To Harden
- **Content Security Policy** — Add CSP headers to block inline scripts
- **Rate limiting** — Frontend retry logic with exponential backoff
- **Secrets** — Never commit API keys (none currently in frontend)
- **Dependency audit** — Run `npm audit` regularly

---

## Testing (Not Yet Implemented)

### Recommended Setup
- **Unit tests** — Vitest + Testing Library
- **E2E tests** — Playwright for critical flows (login, borrow, return)
- **Visual regression** — Chromatic or Percy for UI changes
- **A11y tests** — axe-core via jest-axe

### Priority Flows to Test
1. Login → Catalog → Book Detail → Scan → Loan success
2. Admin login → Books → Add book → Print QR
3. Member reservation → Admin fulfill → Notification

---

## Future Enhancements

### UX Improvements
- **Search autocomplete** — Suggest books as user types
- **Advanced filters** — Date range, rating, availability
- **Wishlist** — Save books for later
- **Reading history** — Track borrowed books over time
- **Social features** — Follow friends, share reviews

### Admin Tools
- **Bulk operations** — Multi-select books/members, batch delete
- **Audit log** — Track all admin actions
- **Role permissions** — Librarian vs. super admin
- **Scheduled reports** — Email weekly stats

### Technical
- **PWA** — Service worker, offline catalog, install prompt
- **Real-time updates** — WebSocket for live notifications
- **Image upload** — Direct cover upload instead of URL
- **PDF receipts** — Generate printable loan receipts

---

## Dependencies & Licenses

All dependencies MIT or Apache 2.0 licensed. No proprietary code.

**Key licenses:**
- React: MIT
- Vite: MIT
- Tailwind: MIT
- html5-qrcode: Apache 2.0
- recharts: MIT

---

## Contact & Maintenance

**Project:** Pustaka Library POS System  
**Codebase:** Monorepo (`/frontend` + `/backend`)  
**Last Updated:** 2026-08-27  
**Status:** Production-ready, actively maintained

For design changes, use `/impeccable [mode] [target]` commands.

---

## Quick Reference: Component Inventory

### Pages (Public)
- Landing, Catalog, BookDetail, Scan, Login, Register, ForgotPassword, ResetPassword, MyLoans, Notifications, Profile, NotFound

### Pages (Admin)
- AdminLayout, AdminOverview, AdminBooks, AdminLoans, AdminMembers, AdminFines, AdminReservations, AdminReports, AdminSettings, AdminQRGenerator

### UI Components
- Button, Card, Sidebar, Tooltip, DropdownMenu, Sheet, InputGroup, Chart, Modal, Stars, Cover, StatusBadge, QRScanner

### Library Components
- Logo, Topbar, DashboardSidebar, HeroCard, CirculationChart, CollectionDonutChart, ThemeProvider, Icons

### Context
- AuthContext (user, login, logout, register)
- ThemeContext (theme, setTheme, toggle)

### Utils
- cn() — className merger
- rupiah() — Currency format
- fmtDate(), fmtDateTime() — Date formatters
- API client — Centralized fetch wrapper

---

## Design Philosophy

**Operate Mode:** Scanability, consistency, efficiency. Admin dashboard prioritizes data density, clear hierarchy, fast keyboard workflows.

**Persuade Mode:** Landing page uses motion, gradients, social proof (testimonials), clear CTAs to convert visitors to members.

**Cohesion:** Shared design tokens ensure visual consistency across both modes. Theme system allows personalization without fragmentation.

**Accessibility:** Keyboard-first navigation, semantic HTML, focus states. Continuous improvement needed for screen reader UX.

**Performance:** Lazy loading, code splitting, optimized bundles. Real-world testing needed under slow 3G conditions.

**Delight:** Confetti on success, smooth transitions, theme variety. Small moments of joy without sacrificing usability.

---

*This document is auto-generated via `/impeccable init` and reflects current frontend state as of 2026-08-27.*

# Graph Report - C:\di\pos-library  (2026-08-19)

## Corpus Check
- 138 files · ~119,193 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 120 nodes · 184 edges · 27 communities (11 shown, 16 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- useAuth / Cover / StatusBadge
- Frontend Src App / UserLayout / AdminBooks
- Backend Src Routes Books / all / asyncHandler
- Backend Src Routes Loans / run / Backend Src Services Loans
- Backend Src Routes Admin / authRequired / Backend Src Routes Reservations
- Backend Src Routes Scan / bookCode / memberCode
- Frontend Src Context Authcontext / User / clearSession
- Backend Src Index / errorHandler / notFound
- Backend Src Routes Auth / qrPngBuffer / uid
- get / Backend Src Middleware Auth / verifyToken
- Frontend Src Main / App / AuthProvider
- fmtDateTime / Frontend Src Pages Notifications
- QueryParams
- settingsSnapshot
- claimNextReservation
- LoanResult
- syncNotifications
- dateOnly
- diffDays
- randomDigits
- rupiah
- todayISO
- JwtPayload
- BookListItem
- getAccess
- getRefresh
- useHasRole

## God Nodes (most connected - your core abstractions)
1. `Frontend Src App` - 23 edges
2. `Backend Src Routes Auth` - 14 edges
3. `get` - 11 edges
4. `Backend Src Routes Books` - 11 edges
5. `useAuth` - 10 edges
6. `Backend Src Routes Admin` - 10 edges
7. `Backend Src Routes Loans` - 10 edges
8. `all` - 9 edges
9. `run` - 9 edges
10. `Backend Src Services Loans` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Frontend Src Context Authcontext Authctx` --references--> `User`  [EXTRACTED]
  frontend/src/context/AuthContext.tsx → frontend/src/api/client.ts

## Import Cycles
- None detected.

## Communities (27 total, 16 thin omitted)

### Community 0 - "useAuth / Cover / StatusBadge"
Cohesion: 0.12
Nodes (28): authImageUrl, Book, QRScanner, Cover, fmtDate, Modal, rupiah, Stars (+20 more)

### Community 1 - "Frontend Src App / UserLayout / AdminBooks"
Cohesion: 0.09
Nodes (23): Frontend Src App, UserLayout, AdminBooks, AdminFines, AdminLayout, AdminLoans, AdminMembers, AdminOverview (+15 more)

### Community 2 - "Backend Src Routes Books / all / asyncHandler"
Cohesion: 0.36
Nodes (9): all, adminRequired, AuthUser, optionalAuth, asyncHandler, Backend Src Routes Books, Backend Src Routes Notifications, Backend Src Routes Reports (+1 more)

### Community 3 - "Backend Src Routes Loans / run / Backend Src Services Loans"
Cohesion: 0.50
Nodes (8): getSetting, run, Backend Src Routes Loans, Backend Src Services Loans, Backend Src Services Scheduler, addDaysISO, daysLate, fmtDate

### Community 4 - "Backend Src Routes Admin / authRequired / Backend Src Routes Reservations"
Cohesion: 0.48
Nodes (7): pushNotification, setSetting, authRequired, Backend Src Routes Admin, Backend Src Routes Reservations, Backend Src Seed, nowISO

### Community 5 - "Backend Src Routes Scan / bookCode / memberCode"
Cohesion: 0.33
Nodes (6): Backend Src Routes Scan, borrowBook, returnBook, bookCode, memberCode, parseCode

### Community 6 - "Frontend Src Context Authcontext / User / clearSession"
Cohesion: 0.33
Nodes (6): clearSession, getStoredUser, setSession, User, Frontend Src Context Authcontext, Frontend Src Context Authcontext Authctx

### Community 7 - "Backend Src Index / errorHandler / notFound"
Cohesion: 0.40
Nodes (5): Backend Src Index, errorHandler, notFound, seed, startScheduler

### Community 8 - "Backend Src Routes Auth / qrPngBuffer / uid"
Cohesion: 0.40
Nodes (5): Backend Src Routes Auth, uid, signAccess, qrPngBuffer, rateLimit

### Community 9 - "get / Backend Src Middleware Auth / verifyToken"
Cohesion: 0.67
Nodes (3): get, Backend Src Middleware Auth, verifyToken

### Community 10 - "Frontend Src Main / App / AuthProvider"
Cohesion: 0.67
Nodes (3): App, AuthProvider, Frontend Src Main

## Knowledge Gaps
- **67 isolated node(s):** `QueryParams`, `settingsSnapshot`, `optionalAuth`, `notFound`, `errorHandler` (+62 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Frontend Src App` connect `Frontend Src App / UserLayout / AdminBooks` to `useAuth / Cover / StatusBadge`?**
  _High betweenness centrality (0.121) - this node is a cross-community bridge._
- **Why does `useAuth` connect `useAuth / Cover / StatusBadge` to `Frontend Src App / UserLayout / AdminBooks`?**
  _High betweenness centrality (0.108) - this node is a cross-community bridge._
- **What connects `QueryParams`, `settingsSnapshot`, `optionalAuth` to the rest of the system?**
  _67 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `useAuth / Cover / StatusBadge` be split into smaller, more focused modules?**
  _Cohesion score 0.12169312169312169 - nodes in this community are weakly interconnected._
- **Should `Frontend Src App / UserLayout / AdminBooks` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._
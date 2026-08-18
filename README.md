# Pustaka QR — Sistem POS Perpustakaan Berbasis QR Code

Aplikasi web lengkap untuk operasional perpustakaan: peminjaman & pengembalian buku berbasis scan QR, katalog, dashboard admin, denda, reservasi FIFO, notifikasi, dan laporan statistik.

Berdasarkan [PRD](PRD) — seluruh fase 1–5 terimplementasi.

## Fitur

| Fase | Fitur | Implementasi |
|---|---|---|
| 1 | Pindai QR (pinjam/kembali/info, validasi QR rusak) | ✅ `frontend/src/pages/Scan.tsx` + `backend/src/routes/scan.ts` |
| 2 | Informasi Buku (cari, filter kategori, detail, rating/ulasan) | ✅ |
| 3 | Landing pengunjung, riwayat pinjaman, dashboard admin (CRUD buku, cetak QR, pantau transaksi, kelola anggota) | ✅ |
| 4 | Auth (daftar/login/logout/reset), profil + kartu QR digital, notifikasi & reminder H-1, denda otomatis | ✅ |
| 5 | Reservasi FIFO, laporan & statistik, export CSV | ✅ |

## Tech Stack

- **Frontend:** Vite + React 18 + TypeScript + React Router · scan QR via `html5-qrcode`
- **Backend:** Node.js + Express + TypeScript
- **Database:** SQLite (built-in `node:sqlite`, tanpa native module)
- **Auth:** JWT access (15 menit) + refresh token (rotasi), `bcryptjs`
- **QR:** `qrcode` (generate PNG di backend), format `pustaka:book:<id>` / `pustaka:member:<id>`

## Menjalankan

```bash
npm install          # sekali di root (workspaces backend + frontend)
npm run dev          # backend :4000 + frontend :5173 (concurrently)
```

- Frontend: http://localhost:5173
- API: http://localhost:4000 · Health: http://localhost:4000/health

Perintah lain:

```bash
npm run build        # typecheck + build backend & frontend
npm run seed         # isi ulang data demo (jika DB kosong)
npm run typecheck    # cek tipe seluruh workspace
```

> DB SQLite dibuat otomatis di `backend/data/pustaka.db` dan di-seed saat server pertama kali dijalankan.

## Akun Demo

| Peran | Email | Password |
|---|---|---|
| Admin/Petugas | `admin@pustaka.id` | `admin123` |
| Anggota | `budi@pustaka.id` | `member123` |
| Anggota | `siti@pustaka.id` | `member123` |
| Anggota | `rizky@pustaka.id` | `member123` |

## Alur Pinjam (Scan QR)

1. Anggota masuk (atau admin scan kartu anggota).
2. Buka **Pindai QR → Pinjam** → scan kartu anggota (admin) / pakai akun sendiri (anggota).
3. Scan **QR buku** → sistem cek stok & batas pinjam → konfirmasi.
4. Jatuh tempo otomatis (default 7 hari), stok berkurang, notifikasi tercatat.

## Alur Kembali

1. **Pindai QR → Kembalikan** → scan QR buku.
2. Sistem cocokkan transaksi aktif, hitung denda bila terlambat (per hari, default Rp 1.000).
3. Stok bertambah, transaksi ditutup, antrian reservasi berikutnya otomatis di-notifikasi (FIFO).

## Struktur

```
backend/
  src/
    index.ts            # entry + mounting route
    db.ts               # skema SQLite + helper
    seed.ts             # data demo
    config.ts           # env / konstanta
    middleware/         # auth, error handler
    routes/             # auth, books, scan, loans, reservations, notifications, admin, reports
    services/           # logika pinjam/kembali + scheduler (reminder & denda)
    utils/              # jwt, qr, rate-limit, tanggal
frontend/
  src/
    api/client.ts       # fetch + auto-refresh token
    context/AuthContext.tsx
    components/         # layout, QRScanner, modal, UI
    pages/              # Landing, Katalog, Detail, Scan, auth, Pinjaman, Notifikasi, Profil
    pages/admin/        # Ringkasan, Buku, Transaksi, Anggota, Denda, Reservasi, Laporan, Pengaturan
```

## Catatan

- Reminder H-1 & penandaan "terlambat" berjalan otomatis via scheduler (setiap 6 jam + saat server start).
- Denda dihitung pada saat pengembalian dan dapat ditandai lunas oleh admin.
- Endpoint `/api/books/:id/qr` menghasilkan PNG label QR (bisa dibuka/dicetak); halaman admin memiliki **Cetak Semua QR**.
- Export CSV tersedia di: riwayat anggota, transaksi admin, dan laporan admin.

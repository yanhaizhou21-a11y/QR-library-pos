import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { DEFAULTS } from './config';

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

export const db = new DatabaseSync(path.join(dataDir, 'pustaka.db'));

db.exec('PRAGMA foreign_keys = ON');
db.exec('PRAGMA journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK(role IN ('admin','member')),
  no_anggota TEXT UNIQUE,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'aktif' CHECK(status IN ('aktif','blokir')),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  judul TEXT NOT NULL,
  penulis TEXT NOT NULL,
  penerbit TEXT,
  tahun INTEGER,
  kategori TEXT,
  isbn TEXT,
  cover_url TEXT,
  lokasi_rak TEXT,
  deskripsi TEXT,
  qr_code TEXT UNIQUE,
  stok_total INTEGER NOT NULL DEFAULT 0,
  stok_tersedia INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS loans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  book_id INTEGER NOT NULL REFERENCES books(id),
  tanggal_pinjam TEXT NOT NULL,
  tanggal_jatuh_tempo TEXT NOT NULL,
  tanggal_kembali TEXT,
  status TEXT NOT NULL DEFAULT 'dipinjam' CHECK(status IN ('dipinjam','terlambat','selesai')),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS reservations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  book_id INTEGER NOT NULL REFERENCES books(id),
  tanggal_reservasi TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'menunggu' CHECK(status IN ('menunggu','tersedia','selesai','dibatalkan','kadaluarsa')),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS fines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  loan_id INTEGER NOT NULL REFERENCES loans(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  jumlah INTEGER NOT NULL DEFAULT 0,
  hari_terlambat INTEGER NOT NULL DEFAULT 0,
  status_bayar TEXT NOT NULL DEFAULT 'belum' CHECK(status_bayar IN ('belum','lunas')),
  tanggal_bayar TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  tipe TEXT NOT NULL DEFAULT 'info',
  pesan TEXT NOT NULL,
  ref_id INTEGER,
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  token TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS password_resets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  token TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  book_id INTEGER NOT NULL REFERENCES books(id),
  rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
  ulasan TEXT,
  created_at TEXT NOT NULL,
  UNIQUE(user_id, book_id)
);

CREATE INDEX IF NOT EXISTS idx_loans_user ON loans(user_id);
CREATE INDEX IF NOT EXISTS idx_loans_book ON loans(book_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_reservations_book ON reservations(book_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_fines_user ON fines(user_id);
`);

export interface QueryParams {
  [key: string]: number | string | bigint | Uint8Array | null;
}

export function all<T = any>(sql: string, params: unknown[] = []): T[] {
  return db.prepare(sql).all(...(params as (string | number | bigint | Uint8Array | null)[])) as T[];
}

export function get<T = any>(sql: string, params: unknown[] = []): T | undefined {
  return db.prepare(sql).get(...(params as (string | number | bigint | Uint8Array | null)[])) as T | undefined;
}

export function run(sql: string, params: unknown[] = []) {
  const res = db.prepare(sql).run(...(params as (string | number | bigint | Uint8Array | null)[]));
  return { changes: Number(res.changes), lastId: Number(res.lastInsertRowid) };
}

export function getSetting(key: string, fallback: string | number = ''): string {
  const row = get<{ value: string }>('SELECT value FROM settings WHERE key = ?', [key]);
  return row ? row.value : String(fallback);
}

export function setSetting(key: string, value: string | number) {
  run('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', [key, String(value)]);
}

export function settingsSnapshot() {
  const rows = all<{ key: string; value: string }>('SELECT key, value FROM settings');
  const merged: Record<string, string> = { ...(DEFAULTS as unknown as Record<string, string>) };
  for (const r of rows) merged[r.key] = r.value;
  return merged;
}

export function pushNotification(userId: number, tipe: string, pesan: string, refId?: number) {
  run(
    'INSERT INTO notifications (user_id, tipe, pesan, ref_id, is_read, created_at) VALUES (?, ?, ?, ?, 0, datetime(\'now\'))',
    [userId, tipe, pesan, refId ?? null],
  );
}
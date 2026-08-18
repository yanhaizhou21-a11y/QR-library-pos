import { Router } from 'express';
import { all, get, run, pushNotification } from '../db';
import { authRequired, AuthUser } from '../middleware/auth';
import { asyncHandler } from '../middleware/error';
import { nowISO } from '../utils/date';

export const reservationsRouter = Router();

reservationsRouter.post('/', authRequired, asyncHandler(async (req, res) => {
  const u = (req as any).user as AuthUser;
  const { bookId } = req.body || {};
  if (!Number.isInteger(Number(bookId))) return res.status(400).json({ error: 'Buku tidak valid.' });
  const book = get<{ id: number; judul: string; stok_tersedia: number }>(
    'SELECT id, judul, stok_tersedia FROM books WHERE id = ?', [Number(bookId)]);
  if (!book) return res.status(404).json({ error: 'Buku tidak ditemukan.' });
  if (book.stok_tersedia > 0) {
    return res.status(409).json({ error: 'Buku masih tersedia di rak. Silakan pinjam langsung melalui scan QR.' });
  }
  const dup = get(
    `SELECT id FROM reservations WHERE user_id = ? AND book_id = ? AND status IN ('menunggu','tersedia')`,
    [u.id, book.id],
  );
  if (dup) return res.status(409).json({ error: 'Anda sudah memiliki reservasi untuk buku ini.' });
  const loan = get(
    `SELECT id FROM loans WHERE user_id = ? AND book_id = ? AND status IN ('dipinjam','terlambat')`,
    [u.id, book.id],
  );
  if (loan) return res.status(409).json({ error: 'Anda sedang meminjam buku ini.' });

  const now = nowISO();
  const { lastId } = run(
    `INSERT INTO reservations (user_id, book_id, tanggal_reservasi, status, created_at)
     VALUES (?, ?, ?, 'menunggu', ?)`,
    [u.id, book.id, now, now],
  );
  pushNotification(u.id, 'reservasi', `Reservasi buku "${book.judul}" tercatat. Anda akan diberi tahu saat tersedia.`, lastId);
  res.status(201).json({ ok: true, reservationId: lastId });
}));

reservationsRouter.get('/me', authRequired, asyncHandler(async (req, res) => {
  const u = (req as any).user as AuthUser;
  const rows = all<any>(
    `SELECT r.*, b.judul, b.penulis, b.cover_url
     FROM reservations r JOIN books b ON b.id = r.book_id
     WHERE r.user_id = ? ORDER BY r.created_at DESC`, [u.id]);
  res.json({ reservations: rows });
}));

reservationsRouter.delete('/:id', authRequired, asyncHandler(async (req, res) => {
  const u = (req as any).user as AuthUser;
  const id = Number(req.params.id);
  const row = get('SELECT * FROM reservations WHERE id = ?', [id]);
  if (!row) return res.status(404).json({ error: 'Reservasi tidak ditemukan.' });
  if (row.user_id !== u.id && u.role !== 'admin') return res.status(403).json({ error: 'Bukan reservasi Anda.' });
  run(`UPDATE reservations SET status = 'dibatalkan' WHERE id = ?`, [id]);
  res.json({ ok: true });
}));
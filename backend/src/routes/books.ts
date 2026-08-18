import { Router } from 'express';
import { all, get, run } from '../db';
import { authRequired, adminRequired, optionalAuth, AuthUser } from '../middleware/auth';
import { asyncHandler } from '../middleware/error';
import { bookCode, qrPngBuffer } from '../utils/qr';
import { nowISO } from '../utils/date';

export const booksRouter = Router();

const BOOK_SELECT = `
  b.*,
  COALESCE(AVG(r.rating), 0) AS rating_avg,
  COUNT(r.id) AS rating_count
  FROM books b
  LEFT JOIN reviews r ON r.book_id = b.id
`;

function rowToBook(row: any) {
  return {
    id: row.id,
    judul: row.judul,
    penulis: row.penulis,
    penerbit: row.penerbit,
    tahun: row.tahun,
    kategori: row.kategori,
    isbn: row.isbn,
    cover_url: row.cover_url,
    lokasi_rak: row.lokasi_rak,
    deskripsi: row.deskripsi,
    qr_code: row.qr_code,
    stok_total: row.stok_total,
    stok_tersedia: row.stok_tersedia,
    rating_avg: Math.round(Number(row.rating_avg) * 10) / 10,
    rating_count: Number(row.rating_count),
    created_at: row.created_at,
  };
}

booksRouter.get('/', asyncHandler(async (req, res) => {
  const { q, kategori, rak, limit = 20, offset = 0 } = req.query;
  const where: string[] = [];
  const params: unknown[] = [];
  if (q) {
    where.push('(b.judul LIKE ? OR b.penulis LIKE ? OR b.isbn LIKE ?)');
    const like = `%${String(q)}%`;
    params.push(like, like, like);
  }
  if (kategori) { where.push('b.kategori = ?'); params.push(String(kategori)); }
  if (rak) { where.push('b.lokasi_rak = ?'); params.push(String(rak)); }
  const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';
  const rows = all<any>(
    `SELECT ${BOOK_SELECT} ${whereSql}
     GROUP BY b.id ORDER BY b.judul ASC LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)],
  );
  const count = get<{ c: number }>(`SELECT COUNT(*) as c FROM books b ${whereSql}`, params);
  res.json({ books: rows.map(rowToBook), total: count?.c || 0 });
}));

booksRouter.get('/kategori', asyncHandler(async (_req, res) => {
  const rows = all<{ kategori: string | null }>(
    'SELECT DISTINCT kategori FROM books WHERE kategori IS NOT NULL ORDER BY kategori');
  res.json({ kategori: rows.map((r) => r.kategori) });
}));

booksRouter.get('/:id', asyncHandler(async (req, res) => {
  const row = get<any>(`SELECT ${BOOK_SELECT} WHERE b.id = ? GROUP BY b.id`, [Number(req.params.id)]);
  if (!row) return res.status(404).json({ error: 'Buku tidak ditemukan.' });
  const reviews = all<{ id: number; user_id: number; nama: string; rating: number; ulasan: string | null; created_at: string }>(
    `SELECT r.id, r.user_id, u.nama, r.rating, r.ulasan, r.created_at
     FROM reviews r JOIN users u ON u.id = r.user_id
     WHERE r.book_id = ? ORDER BY r.created_at DESC`,
    [row.id],
  );
  const reservations = get<{ c: number }>(
    `SELECT COUNT(*) as c FROM reservations WHERE book_id = ? AND status IN ('menunggu','tersedia')`, [row.id]);
  res.json({ book: rowToBook(row), reviews, antrianReservasi: reservations?.c || 0 });
}));

booksRouter.get('/:id/qr', asyncHandler(async (req, res) => {
  const row = get<{ id: number; judul: string; qr_code: string }>(
    'SELECT id, judul, qr_code FROM books WHERE id = ?', [Number(req.params.id)]);
  if (!row) return res.status(404).json({ error: 'Buku tidak ditemukan.' });
  const png = await qrPngBuffer(row.qr_code);
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Content-Disposition', `inline; filename="qr-${row.judul.replace(/[^\w]+/g, '-')}.png"`);
  res.send(png);
}));

booksRouter.post('/', authRequired, adminRequired, asyncHandler(async (req, res) => {
  const b = req.body || {};
  const judul = String(b.judul || '').trim();
  const penulis = String(b.penulis || '').trim();
  if (!judul || !penulis) return res.status(400).json({ error: 'Judul dan penulis wajib diisi.' });
  const now = nowISO();
  const stokTotal = Math.max(0, Number(b.stok_total || 0));
  const { lastId } = run(
    `INSERT INTO books (judul, penulis, penerbit, tahun, kategori, isbn, cover_url, lokasi_rak, deskripsi, qr_code, stok_total, stok_tersedia, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [judul, penulis, b.penerbit || null, b.tahun ? Number(b.tahun) : null, b.kategori || null,
      b.isbn || null, b.cover_url || null, b.lokasi_rak || null, b.deskripsi || null,
      null, stokTotal, stokTotal, now],
  );
  run('UPDATE books SET qr_code = ? WHERE id = ?', [bookCode(lastId), lastId]);
  const row = get('SELECT * FROM books WHERE id = ?', [lastId]);
  res.status(201).json({ book: rowToBook(row) });
}));

booksRouter.put('/:id', authRequired, adminRequired, asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const row = get('SELECT * FROM books WHERE id = ?', [id]);
  if (!row) return res.status(404).json({ error: 'Buku tidak ditemukan.' });
  const b = req.body || {};
  const judul = String(b.judul ?? row.judul).trim() || row.judul;
  const penulis = String(b.penulis ?? row.penulis).trim() || row.penulis;
  const stokTotal = b.stok_total !== undefined ? Math.max(0, Number(b.stok_total)) : row.stok_total;
  const dipinjam = Math.max(0, row.stok_total - row.stok_tersedia);
  const stokTersedia = Math.max(0, stokTotal - dipinjam);
  run(
    `UPDATE books SET judul=?, penulis=?, penerbit=?, tahun=?, kategori=?, isbn=?, cover_url=?, lokasi_rak=?, deskripsi=?, stok_total=?, stok_tersedia=? WHERE id=?`,
    [judul, penulis, b.penerbit ?? row.penerbit, b.tahun !== undefined ? Number(b.tahun) : row.tahun,
      b.kategori ?? row.kategori, b.isbn ?? row.isbn, b.cover_url ?? row.cover_url,
      b.lokasi_rak ?? row.lokasi_rak, b.deskripsi ?? row.deskripsi, stokTotal, stokTersedia, id],
  );
  const updated = get('SELECT * FROM books WHERE id = ?', [id]);
  res.json({ book: rowToBook(updated) });
}));

booksRouter.delete('/:id', authRequired, adminRequired, asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const active = get('SELECT id FROM loans WHERE book_id = ? AND status IN (\'dipinjam\',\'terlambat\')', [id]);
  if (active) return res.status(409).json({ error: 'Buku masih dalam transaksi aktif. Tidak bisa dihapus.' });
  run('DELETE FROM reservations WHERE book_id = ?', [id]);
  run('DELETE FROM reviews WHERE book_id = ?', [id]);
  run('DELETE FROM books WHERE id = ?', [id]);
  res.json({ ok: true });
}));

booksRouter.post('/:id/reviews', authRequired, asyncHandler(async (req, res) => {
  const u = (req as any).user as AuthUser;
  const id = Number(req.params.id);
  const { rating, ulasan } = req.body || {};
  const r = Math.round(Number(rating));
  if (r < 1 || r > 5) return res.status(400).json({ error: 'Rating harus antara 1-5.' });
  const book = get('SELECT id FROM books WHERE id = ?', [id]);
  if (!book) return res.status(404).json({ error: 'Buku tidak ditemukan.' });
  const seen = get('SELECT id FROM reviews WHERE user_id = ? AND book_id = ?', [u.id, id]);
  const now = nowISO();
  if (seen) {
    run('UPDATE reviews SET rating = ?, ulasan = ?, created_at = ? WHERE id = ?', [r, ulasan || null, now, seen.id]);
  } else {
    run('INSERT INTO reviews (user_id, book_id, rating, ulasan, created_at) VALUES (?, ?, ?, ?, ?)',
      [u.id, id, r, ulasan || null, now]);
  }
  res.json({ ok: true });
}));
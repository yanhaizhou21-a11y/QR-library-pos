import { Router } from 'express';
import { get } from '../db';
import { parseCode, memberCode, bookCode } from '../utils/qr';
import { authRequired, AuthUser } from '../middleware/auth';
import { asyncHandler } from '../middleware/error';
import { borrowBook, returnBook } from '../services/loans';

export const scanRouter = Router();

function bookView(row: any) {
  return {
    id: row.id,
    judul: row.judul,
    penulis: row.penulis,
    kategori: row.kategori,
    stok_tersedia: row.stok_tersedia,
    lokasi_rak: row.lokasi_rak,
  };
}

scanRouter.post('/parse', asyncHandler(async (req, res) => {
  const { code } = req.body || {};
  const parsed = parseCode(String(code || ''));
  if (!parsed) {
    return res.json({ valid: false, error: 'QR tidak dikenali Pustaka QR. Pastikan QR berasal dari buku/kartu anggota kami.' });
  }
  if (parsed.type === 'book') {
    const row = get('SELECT * FROM books WHERE id = ?', [parsed.id]);
    if (!row) return res.json({ valid: false, error: 'QR buku tidak ditemukan di database. Mungkin buku sudah dihapus.' });
    return res.json({ valid: true, type: 'book', book: { ...bookView(row), qr_code: bookCode(row.id) } });
  }
  const user = get('SELECT * FROM users WHERE id = ?', [parsed.id]);
  if (!user) return res.json({ valid: false, error: 'QR anggota tidak ditemukan. Mungkin akun dihapus.' });
  res.json({
    valid: true,
    type: 'member',
    member: { id: user.id, nama: user.nama, no_anggota: user.no_anggota, status: user.status, qr_code: memberCode(user.id) },
  });
}));

scanRouter.post('/borrow', authRequired, asyncHandler(async (req, res) => {
  const u = (req as any).user as AuthUser;
  const { bookId } = req.body || {};
  if (!Number.isInteger(Number(bookId))) return res.status(400).json({ error: 'Pilih buku yang benar.' });
  const result = borrowBook(u.id, Number(bookId));
  res.status(201).json({ ok: true, loan: result });
}));

scanRouter.post('/borrow-as', authRequired, asyncHandler(async (req, res) => {
  const { bookId, memberId } = req.body || {};
  if (!Number.isInteger(Number(bookId))) return res.status(400).json({ error: 'Pilih buku yang benar.' });
  const result = borrowBook(Number(memberId), Number(bookId));
  res.status(201).json({ ok: true, loan: result });
}));

scanRouter.post('/return', asyncHandler(async (req, res) => {
  const { bookId } = req.body || {};
  if (!Number.isInteger(Number(bookId))) return res.status(400).json({ error: 'Pilih buku yang benar.' });
  const result = returnBook(Number(bookId));
  res.json({ ok: true, loan: result });
}));
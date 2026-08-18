import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { all, get, run, getSetting, setSetting, pushNotification } from '../db';
import { authRequired, adminRequired } from '../middleware/auth';
import { asyncHandler } from '../middleware/error';
import { nowISO } from '../utils/date';

export const adminRouter = Router();
adminRouter.use(authRequired, adminRequired);

function sanitizeUser(u: any) {
  if (!u) return null;
  const { password_hash, ...rest } = u;
  return rest;
}

adminRouter.get('/members', asyncHandler(async (req, res) => {
  const { q, status } = req.query;
  const where: string[] = ["u.role = 'member'"];
  const params: unknown[] = [];
  if (q) { where.push('(upper(u.nama) LIKE ? OR upper(u.email) LIKE ? OR upper(u.no_anggota) LIKE ?)'); const like = `%${String(q).toUpperCase()}%`; params.push(like, like, like); }
  if (status) { where.push('u.status = ?'); params.push(String(status)); }
  const whereSql = 'WHERE ' + where.join(' AND ');
  const rows = all<any>(
    `SELECT u.*,
       (SELECT COUNT(*) FROM loans l WHERE l.user_id = u.id AND l.status IN ('dipinjam','terlambat')) AS aktif,
       (SELECT COUNT(*) FROM loans l WHERE l.user_id = u.id) AS total_pinjam,
       (SELECT COUNT(*) FROM fines f WHERE f.user_id = u.id AND f.status_bayar = 'belum') AS denda_belum
     FROM users u ${whereSql} ORDER BY u.id DESC`,
    params,
  );
  res.json({ members: rows.map(sanitizeUser) });
}));

adminRouter.post('/members', asyncHandler(async (req, res) => {
  const { nama, email, password, phone } = req.body || {};
  if (!nama || !email || !password) return res.status(400).json({ error: 'Nama, email, dan password wajib diisi.' });
  if (get('SELECT id FROM users WHERE email = ?', [String(email).toLowerCase()])) {
    return res.status(409).json({ error: 'Email sudah terpakai.' });
  }
  const now = nowISO();
  const { lastId } = run(
    'INSERT INTO users (nama, email, password_hash, role, no_anggota, phone, status, created_at) VALUES (?, ?, ?, \'member\', ?, ?, \'aktif\', ?)',
    [String(nama), String(email).toLowerCase(), bcrypt.hashSync(String(password), 10), null, phone || null, now],
  );
  run('UPDATE users SET no_anggota = ? WHERE id = ?', ['A' + String(lastId).padStart(4, '0'), lastId]);
  res.status(201).json({ member: sanitizeUser(get('SELECT * FROM users WHERE id = ?', [lastId])) });
}));

adminRouter.put('/members/:id', asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { nama, phone, status } = req.body || {};
  const row = get('SELECT * FROM users WHERE id = ?', [id]);
  if (!row) return res.status(404).json({ error: 'Anggota tidak ditemukan.' });
  run('UPDATE users SET nama = ?, phone = ?, status = ? WHERE id = ?', [
    nama || row.nama, phone !== undefined ? phone : row.phone, status || row.status, id,
  ]);
  if (status === 'blokir') pushNotification(id, 'info', 'Akun Anda diblokir oleh admin. Hubungi petugas untuk keterangan.');
  if (status === 'aktif' && row.status !== 'aktif') pushNotification(id, 'info', 'Akun Anda telah diaktifkan kembali. Selamat bertransaksi.');
  res.json({ member: sanitizeUser(get('SELECT * FROM users WHERE id = ?', [id])) });
}));

adminRouter.post('/members/:id/reset-password', asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { password } = req.body || {};
  if (!password || String(password).length < 6) return res.status(400).json({ error: 'Password minimal 6 karakter.' });
  const row = get('SELECT id FROM users WHERE id = ?', [id]);
  if (!row) return res.status(404).json({ error: 'Anggota tidak ditemukan.' });
  run('UPDATE users SET password_hash = ? WHERE id = ?', [bcrypt.hashSync(String(password), 10), id]);
  run('DELETE FROM refresh_tokens WHERE user_id = ?', [id]);
  res.json({ ok: true });
}));

adminRouter.delete('/members/:id', asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const loans = get('SELECT id FROM loans WHERE user_id = ? AND status IN (\'dipinjam\',\'terlambat\')', [id]);
  if (loans) return res.status(409).json({ error: 'Anggota memiliki pinjaman aktif. Tidak bisa dihapus.' });
  run('DELETE FROM refresh_tokens WHERE user_id = ?', [id]);
  run('DELETE FROM notifications WHERE user_id = ?', [id]);
  run('DELETE FROM reservations WHERE user_id = ?', [id]);
  run('DELETE FROM reviews WHERE user_id = ?', [id]);
  run('DELETE FROM loans WHERE user_id = ?', [id]);
  run('DELETE FROM fines WHERE user_id = ?', [id]);
  run('DELETE FROM users WHERE id = ?', [id]);
  res.json({ ok: true });
}));

adminRouter.get('/fines', asyncHandler(async (req, res) => {
  const { status_bayar, q } = req.query;
  const where: string[] = [];
  const params: unknown[] = [];
  if (status_bayar) { where.push('f.status_bayar = ?'); params.push(String(status_bayar)); }
  if (q) { where.push('(u.nama LIKE ? OR u.no_anggota LIKE ?)'); const like = `%${String(q)}%`; params.push(like, like); }
  const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';
  const rows = all<any>(
    `SELECT f.*, u.nama, u.no_anggota, b.judul, l.tanggal_jatuh_tempo
     FROM fines f
     JOIN loans l ON l.id = f.loan_id
     JOIN users u ON u.id = f.user_id
     JOIN books b ON b.id = l.book_id
     ${whereSql} ORDER BY f.id DESC LIMIT 200`,
    params,
  );
  const total = get<{ c: number; s: number }>(
    'SELECT COUNT(*) as c, COALESCE(SUM(jumlah), 0) as s FROM fines', []) || { c: 0, s: 0 };
  res.json({ fines: rows, total: total.c, totalNominal: total.s });
}));

adminRouter.post('/fines/:id/pay', asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const row = get('SELECT * FROM fines WHERE id = ?', [id]);
  if (!row) return res.status(404).json({ error: 'Denda tidak ditemukan.' });
  if (row.status_bayar === 'lunas') return res.status(409).json({ error: 'Denda sudah lunas.' });
  run('UPDATE fines SET status_bayar = \'lunas\', tanggal_bayar = ? WHERE id = ?', [nowISO(), id]);
  pushNotification(row.user_id, 'denda', `Pembayaran denda senilai Rp ${Number(row.jumlah).toLocaleString('id-ID')} telah dicatat lunas.`, id);
  res.json({ ok: true });
}));

adminRouter.get('/reservations', asyncHandler(async (_req, res) => {
  const rows = all<any>(
    `SELECT r.*, b.judul, b.penulis, u.nama, u.no_anggota
     FROM reservations r
     JOIN books b ON b.id = r.book_id
     JOIN users u ON u.id = r.user_id
     WHERE r.status IN ('menunggu','tersedia')
     ORDER BY r.tanggal_reservasi ASC`,
  );
  res.json({ reservations: rows });
}));

adminRouter.post('/reservations/:id/cancel', asyncHandler(async (req, res) => {
  run(`UPDATE reservations SET status = 'dibatalkan' WHERE id = ?`, [Number(req.params.id)]);
  res.json({ ok: true });
}));

adminRouter.get('/settings', asyncHandler(async (_req, res) => {
  res.json({ settings: { loanDays: Number(getSetting('loanDays', 7)), finePerDay: Number(getSetting('finePerDay', 1000)), maxActiveLoans: Number(getSetting('maxActiveLoans', 3)) } });
}));

adminRouter.put('/settings', asyncHandler(async (req, res) => {
  const { loanDays, finePerDay, maxActiveLoans } = req.body || {};
  if (loanDays !== undefined) setSetting('loanDays', Math.max(1, Number(loanDays)));
  if (finePerDay !== undefined) setSetting('finePerDay', Math.max(0, Number(finePerDay)));
  if (maxActiveLoans !== undefined) setSetting('maxActiveLoans', Math.max(1, Number(maxActiveLoans)));
  res.json({ ok: true });
}));
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { all, get, run, pushNotification } from '../db';
import { config } from '../config';
import { signAccess } from '../utils/jwt';
import { uid } from '../utils/date';
import { nowISO, addDaysISO } from '../utils/date';
import { rateLimit } from '../utils/rateLimit';
import { authRequired, AuthUser } from '../middleware/auth';
import { asyncHandler } from '../middleware/error';
import { memberCode } from '../utils/qr';
import { qrPngBuffer } from '../utils/qr';

export const authRouter = Router();

function sanitize(u: any) {
  if (!u) return null;
  const { password_hash, ...rest } = u;
  return rest;
}

function issueTokens(user: { id: number; role: 'admin' | 'member' }) {
  const now = nowISO();
  const refresh = uid(40);
  run('INSERT INTO refresh_tokens (user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?)', [
    user.id, refresh, addDaysISO(now, config.refreshTtlDays), now,
  ]);
  return { accessToken: signAccess(user.id, user.role), refreshToken: refresh };
}

authRouter.post('/register', asyncHandler(async (req, res) => {
  const { nama, email, password, phone } = req.body || {};
  if (!nama || !String(nama).trim()) return res.status(400).json({ error: 'Nama wajib diisi.' });
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(email))) {
    return res.status(400).json({ error: 'Email tidak valid.' });
  }
  if (!password || String(password).length < 6) {
    return res.status(400).json({ error: 'Password minimal 6 karakter.' });
  }
  const existing = get('SELECT id FROM users WHERE email = ?', [String(email).toLowerCase()]);
  if (existing) return res.status(409).json({ error: 'Email sudah terdaftar. Silakan masuk.' });

  const now = nowISO();
  const hash = bcrypt.hashSync(String(password), 10);
  const { lastId } = run(
    'INSERT INTO users (nama, email, password_hash, role, no_anggota, phone, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [String(nama).trim(), String(email).toLowerCase(), hash, 'member', null, phone || null, 'aktif', now],
  );
  run('UPDATE users SET no_anggota = ? WHERE id = ?', ['A' + String(lastId).padStart(4, '0'), lastId]);

  const user = get('SELECT * FROM users WHERE id = ?', [lastId]);
  pushNotification(lastId, 'info', 'Selamat datang di Pustaka QR! Kartu anggota digital Anda tersedia di halaman profil.');
  res.status(201).json({ user: sanitize(user), ...issueTokens(user) });
}));

const loginLimiter = rateLimit(8, 15 * 60 * 1000);

authRouter.post('/login', loginLimiter, asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email dan password wajib diisi.' });
  const user = get('SELECT * FROM users WHERE email = ?', [String(email).toLowerCase()]);
  if (!user || !bcrypt.compareSync(String(password), user.password_hash)) {
    return res.status(401).json({ error: 'Email atau password salah.' });
  }
  if (user.status === 'blokir') return res.status(403).json({ error: 'Akun Anda diblokir. Hubungi petugas perpustakaan.' });
  res.json({ user: sanitize(user), ...issueTokens(user) });
}));

authRouter.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body || {};
  if (!refreshToken) return res.status(400).json({ error: 'Refresh token diperlukan.' });
  const row = get('SELECT * FROM refresh_tokens WHERE token = ?', [String(refreshToken)]);
  if (!row || row.expires_at < nowISO()) return res.status(401).json({ error: 'Refresh token tidak valid/kadaluarsa.' });
  const user = get('SELECT * FROM users WHERE id = ?', [row.user_id]);
  if (!user || user.status === 'blokir') return res.status(401).json({ error: 'Akun tidak valid.' });
  run('DELETE FROM refresh_tokens WHERE id = ?', [row.id]);
  res.json({ user: sanitize(user), ...issueTokens(user) });
}));

authRouter.post('/logout', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body || {};
  if (refreshToken) run('DELETE FROM refresh_tokens WHERE token = ?', [String(refreshToken)]);
  res.json({ ok: true });
}));

authRouter.post('/forgot-password', asyncHandler(async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Email wajib diisi.' });
  const user = get('SELECT * FROM users WHERE email = ?', [String(email).toLowerCase()]);
  if (!user) return res.json({ message: 'Jika email terdaftar, tautan reset akan dikirim.' });
  const token = uid(40);
  const now = nowISO();
  run('INSERT INTO password_resets (user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?)', [
    user.id, token, addDaysISO(now, 1), now,
  ]);
  pushNotification(user.id, 'info', 'Permintaan reset password diterima. Gunakan tautan reset yang dikirim.');
  res.json({ message: 'Jika email terdaftar, tautan reset akan dikirim.', resetToken: token });
}));

authRouter.post('/reset-password', asyncHandler(async (req, res) => {
  const { token, password } = req.body || {};
  if (!token || !password || String(password).length < 6) {
    return res.status(400).json({ error: 'Token dan password (min. 6 karakter) wajib diisi.' });
  }
  const row = get('SELECT * FROM password_resets WHERE token = ?', [String(token)]);
  if (!row || row.used || row.expires_at < nowISO()) {
    return res.status(400).json({ error: 'Tautan reset tidak valid atau sudah kadaluarsa.' });
  }
  const hash = bcrypt.hashSync(String(password), 10);
  run('UPDATE users SET password_hash = ? WHERE id = ?', [hash, row.user_id]);
  run('UPDATE password_resets SET used = 1 WHERE id = ?', [row.id]);
  run('DELETE FROM refresh_tokens WHERE user_id = ?', [row.user_id]);
  res.json({ message: 'Password berhasil diubah. Silakan masuk.' });
}));

authRouter.get('/me', authRequired, asyncHandler(async (req, res) => {
  const u = (req as any).user as AuthUser;
  const user = get('SELECT * FROM users WHERE id = ?', [u.id]);
  const badges = get<{ c: number }>(
    `SELECT COUNT(*) as c FROM reservations WHERE user_id = ? AND status IN ('tersedia')`, [u.id]);
  res.json({ user: sanitize(user), unclaimedReservations: badges?.c || 0 });
}));

authRouter.get('/me/qr', authRequired, asyncHandler(async (req, res) => {
  const u = (req as any).user as AuthUser;
  const png = await qrPngBuffer(memberCode(u.id));
  res.setHeader('Content-Type', 'image/png');
  res.send(png);
}));

authRouter.put('/me', authRequired, asyncHandler(async (req, res) => {
  const u = (req as any).user as AuthUser;
  const { nama, phone } = req.body || {};
  run('UPDATE users SET nama = ?, phone = ? WHERE id = ?', [String(nama || u.nama), phone || null, u.id]);
  const user = get('SELECT * FROM users WHERE id = ?', [u.id]);
  res.json({ user: sanitize(user) });
}));
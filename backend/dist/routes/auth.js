"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../db");
const config_1 = require("../config");
const jwt_1 = require("../utils/jwt");
const date_1 = require("../utils/date");
const date_2 = require("../utils/date");
const rateLimit_1 = require("../utils/rateLimit");
const auth_1 = require("../middleware/auth");
const error_1 = require("../middleware/error");
const qr_1 = require("../utils/qr");
const qr_2 = require("../utils/qr");
exports.authRouter = (0, express_1.Router)();
function sanitize(u) {
    if (!u)
        return null;
    const { password_hash, ...rest } = u;
    return rest;
}
function issueTokens(user) {
    const now = (0, date_2.nowISO)();
    const refresh = (0, date_1.uid)(40);
    (0, db_1.run)('INSERT INTO refresh_tokens (user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?)', [
        user.id, refresh, (0, date_2.addDaysISO)(now, config_1.config.refreshTtlDays), now,
    ]);
    return { accessToken: (0, jwt_1.signAccess)(user.id, user.role), refreshToken: refresh };
}
exports.authRouter.post('/register', (0, error_1.asyncHandler)(async (req, res) => {
    const { nama, email, password, phone } = req.body || {};
    if (!nama || !String(nama).trim())
        return res.status(400).json({ error: 'Nama wajib diisi.' });
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(email))) {
        return res.status(400).json({ error: 'Email tidak valid.' });
    }
    if (!password || String(password).length < 6) {
        return res.status(400).json({ error: 'Password minimal 6 karakter.' });
    }
    const existing = (0, db_1.get)('SELECT id FROM users WHERE email = ?', [String(email).toLowerCase()]);
    if (existing)
        return res.status(409).json({ error: 'Email sudah terdaftar. Silakan masuk.' });
    const now = (0, date_2.nowISO)();
    const hash = bcryptjs_1.default.hashSync(String(password), 10);
    const { lastId } = (0, db_1.run)('INSERT INTO users (nama, email, password_hash, role, no_anggota, phone, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [String(nama).trim(), String(email).toLowerCase(), hash, 'member', null, phone || null, 'aktif', now]);
    (0, db_1.run)('UPDATE users SET no_anggota = ? WHERE id = ?', ['A' + String(lastId).padStart(4, '0'), lastId]);
    const user = (0, db_1.get)('SELECT * FROM users WHERE id = ?', [lastId]);
    (0, db_1.pushNotification)(lastId, 'info', 'Selamat datang di Pustaka QR! Kartu anggota digital Anda tersedia di halaman profil.');
    res.status(201).json({ user: sanitize(user), ...issueTokens(user) });
}));
const loginLimiter = (0, rateLimit_1.rateLimit)(8, 15 * 60 * 1000);
exports.authRouter.post('/login', loginLimiter, (0, error_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password)
        return res.status(400).json({ error: 'Email dan password wajib diisi.' });
    const user = (0, db_1.get)('SELECT * FROM users WHERE email = ?', [String(email).toLowerCase()]);
    if (!user || !bcryptjs_1.default.compareSync(String(password), user.password_hash)) {
        return res.status(401).json({ error: 'Email atau password salah.' });
    }
    if (user.status === 'blokir')
        return res.status(403).json({ error: 'Akun Anda diblokir. Hubungi petugas perpustakaan.' });
    res.json({ user: sanitize(user), ...issueTokens(user) });
}));
exports.authRouter.post('/refresh', (0, error_1.asyncHandler)(async (req, res) => {
    const { refreshToken } = req.body || {};
    if (!refreshToken)
        return res.status(400).json({ error: 'Refresh token diperlukan.' });
    const row = (0, db_1.get)('SELECT * FROM refresh_tokens WHERE token = ?', [String(refreshToken)]);
    if (!row || row.expires_at < (0, date_2.nowISO)())
        return res.status(401).json({ error: 'Refresh token tidak valid/kadaluarsa.' });
    const user = (0, db_1.get)('SELECT * FROM users WHERE id = ?', [row.user_id]);
    if (!user || user.status === 'blokir')
        return res.status(401).json({ error: 'Akun tidak valid.' });
    (0, db_1.run)('DELETE FROM refresh_tokens WHERE id = ?', [row.id]);
    res.json({ user: sanitize(user), ...issueTokens(user) });
}));
exports.authRouter.post('/logout', (0, error_1.asyncHandler)(async (req, res) => {
    const { refreshToken } = req.body || {};
    if (refreshToken)
        (0, db_1.run)('DELETE FROM refresh_tokens WHERE token = ?', [String(refreshToken)]);
    res.json({ ok: true });
}));
exports.authRouter.post('/forgot-password', (0, error_1.asyncHandler)(async (req, res) => {
    const { email } = req.body || {};
    if (!email)
        return res.status(400).json({ error: 'Email wajib diisi.' });
    const user = (0, db_1.get)('SELECT * FROM users WHERE email = ?', [String(email).toLowerCase()]);
    if (!user)
        return res.json({ message: 'Jika email terdaftar, tautan reset akan dikirim.' });
    const token = (0, date_1.uid)(40);
    const now = (0, date_2.nowISO)();
    (0, db_1.run)('INSERT INTO password_resets (user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?)', [
        user.id, token, (0, date_2.addDaysISO)(now, 1), now,
    ]);
    (0, db_1.pushNotification)(user.id, 'info', 'Permintaan reset password diterima. Gunakan tautan reset yang dikirim.');
    res.json({ message: 'Jika email terdaftar, tautan reset akan dikirim.', resetToken: token });
}));
exports.authRouter.post('/reset-password', (0, error_1.asyncHandler)(async (req, res) => {
    const { token, password } = req.body || {};
    if (!token || !password || String(password).length < 6) {
        return res.status(400).json({ error: 'Token dan password (min. 6 karakter) wajib diisi.' });
    }
    const row = (0, db_1.get)('SELECT * FROM password_resets WHERE token = ?', [String(token)]);
    if (!row || row.used || row.expires_at < (0, date_2.nowISO)()) {
        return res.status(400).json({ error: 'Tautan reset tidak valid atau sudah kadaluarsa.' });
    }
    const hash = bcryptjs_1.default.hashSync(String(password), 10);
    (0, db_1.run)('UPDATE users SET password_hash = ? WHERE id = ?', [hash, row.user_id]);
    (0, db_1.run)('UPDATE password_resets SET used = 1 WHERE id = ?', [row.id]);
    (0, db_1.run)('DELETE FROM refresh_tokens WHERE user_id = ?', [row.user_id]);
    res.json({ message: 'Password berhasil diubah. Silakan masuk.' });
}));
exports.authRouter.get('/me', auth_1.authRequired, (0, error_1.asyncHandler)(async (req, res) => {
    const u = req.user;
    const user = (0, db_1.get)('SELECT * FROM users WHERE id = ?', [u.id]);
    const badges = (0, db_1.get)(`SELECT COUNT(*) as c FROM reservations WHERE user_id = ? AND status IN ('tersedia')`, [u.id]);
    res.json({ user: sanitize(user), unclaimedReservations: badges?.c || 0 });
}));
exports.authRouter.get('/me/qr', auth_1.authRequired, (0, error_1.asyncHandler)(async (req, res) => {
    const u = req.user;
    const png = await (0, qr_2.qrPngBuffer)((0, qr_1.memberCode)(u.id));
    res.setHeader('Content-Type', 'image/png');
    res.send(png);
}));
exports.authRouter.put('/me', auth_1.authRequired, (0, error_1.asyncHandler)(async (req, res) => {
    const u = req.user;
    const { nama, phone } = req.body || {};
    (0, db_1.run)('UPDATE users SET nama = ?, phone = ? WHERE id = ?', [String(nama || u.nama), phone || null, u.id]);
    const user = (0, db_1.get)('SELECT * FROM users WHERE id = ?', [u.id]);
    res.json({ user: sanitize(user) });
}));

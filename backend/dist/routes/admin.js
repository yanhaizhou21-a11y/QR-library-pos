"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const error_1 = require("../middleware/error");
const date_1 = require("../utils/date");
exports.adminRouter = (0, express_1.Router)();
exports.adminRouter.use(auth_1.authRequired, auth_1.adminRequired);
function sanitizeUser(u) {
    if (!u)
        return null;
    const { password_hash, ...rest } = u;
    return rest;
}
exports.adminRouter.get('/members', (0, error_1.asyncHandler)(async (req, res) => {
    const { q, status } = req.query;
    const where = ["u.role = 'member'"];
    const params = [];
    if (q) {
        where.push('(upper(u.nama) LIKE ? OR upper(u.email) LIKE ? OR upper(u.no_anggota) LIKE ?)');
        const like = `%${String(q).toUpperCase()}%`;
        params.push(like, like, like);
    }
    if (status) {
        where.push('u.status = ?');
        params.push(String(status));
    }
    const whereSql = 'WHERE ' + where.join(' AND ');
    const rows = (0, db_1.all)(`SELECT u.*,
       (SELECT COUNT(*) FROM loans l WHERE l.user_id = u.id AND l.status IN ('dipinjam','terlambat')) AS aktif,
       (SELECT COUNT(*) FROM loans l WHERE l.user_id = u.id) AS total_pinjam,
       (SELECT COUNT(*) FROM fines f WHERE f.user_id = u.id AND f.status_bayar = 'belum') AS denda_belum
     FROM users u ${whereSql} ORDER BY u.id DESC`, params);
    res.json({ members: rows.map(sanitizeUser) });
}));
exports.adminRouter.post('/members', (0, error_1.asyncHandler)(async (req, res) => {
    const { nama, email, password, phone } = req.body || {};
    if (!nama || !email || !password)
        return res.status(400).json({ error: 'Nama, email, dan password wajib diisi.' });
    if ((0, db_1.get)('SELECT id FROM users WHERE email = ?', [String(email).toLowerCase()])) {
        return res.status(409).json({ error: 'Email sudah terpakai.' });
    }
    const now = (0, date_1.nowISO)();
    const { lastId } = (0, db_1.run)('INSERT INTO users (nama, email, password_hash, role, no_anggota, phone, status, created_at) VALUES (?, ?, ?, \'member\', ?, ?, \'aktif\', ?)', [String(nama), String(email).toLowerCase(), bcryptjs_1.default.hashSync(String(password), 10), null, phone || null, now]);
    (0, db_1.run)('UPDATE users SET no_anggota = ? WHERE id = ?', ['A' + String(lastId).padStart(4, '0'), lastId]);
    res.status(201).json({ member: sanitizeUser((0, db_1.get)('SELECT * FROM users WHERE id = ?', [lastId])) });
}));
exports.adminRouter.put('/members/:id', (0, error_1.asyncHandler)(async (req, res) => {
    const id = Number(req.params.id);
    const { nama, phone, status } = req.body || {};
    const row = (0, db_1.get)('SELECT * FROM users WHERE id = ?', [id]);
    if (!row)
        return res.status(404).json({ error: 'Anggota tidak ditemukan.' });
    (0, db_1.run)('UPDATE users SET nama = ?, phone = ?, status = ? WHERE id = ?', [
        nama || row.nama, phone !== undefined ? phone : row.phone, status || row.status, id,
    ]);
    if (status === 'blokir')
        (0, db_1.pushNotification)(id, 'info', 'Akun Anda diblokir oleh admin. Hubungi petugas untuk keterangan.');
    if (status === 'aktif' && row.status !== 'aktif')
        (0, db_1.pushNotification)(id, 'info', 'Akun Anda telah diaktifkan kembali. Selamat bertransaksi.');
    res.json({ member: sanitizeUser((0, db_1.get)('SELECT * FROM users WHERE id = ?', [id])) });
}));
exports.adminRouter.post('/members/:id/reset-password', (0, error_1.asyncHandler)(async (req, res) => {
    const id = Number(req.params.id);
    const { password } = req.body || {};
    if (!password || String(password).length < 6)
        return res.status(400).json({ error: 'Password minimal 6 karakter.' });
    const row = (0, db_1.get)('SELECT id FROM users WHERE id = ?', [id]);
    if (!row)
        return res.status(404).json({ error: 'Anggota tidak ditemukan.' });
    (0, db_1.run)('UPDATE users SET password_hash = ? WHERE id = ?', [bcryptjs_1.default.hashSync(String(password), 10), id]);
    (0, db_1.run)('DELETE FROM refresh_tokens WHERE user_id = ?', [id]);
    res.json({ ok: true });
}));
exports.adminRouter.delete('/members/:id', (0, error_1.asyncHandler)(async (req, res) => {
    const id = Number(req.params.id);
    const loans = (0, db_1.get)('SELECT id FROM loans WHERE user_id = ? AND status IN (\'dipinjam\',\'terlambat\')', [id]);
    if (loans)
        return res.status(409).json({ error: 'Anggota memiliki pinjaman aktif. Tidak bisa dihapus.' });
    (0, db_1.run)('DELETE FROM refresh_tokens WHERE user_id = ?', [id]);
    (0, db_1.run)('DELETE FROM notifications WHERE user_id = ?', [id]);
    (0, db_1.run)('DELETE FROM reservations WHERE user_id = ?', [id]);
    (0, db_1.run)('DELETE FROM reviews WHERE user_id = ?', [id]);
    (0, db_1.run)('DELETE FROM loans WHERE user_id = ?', [id]);
    (0, db_1.run)('DELETE FROM fines WHERE user_id = ?', [id]);
    (0, db_1.run)('DELETE FROM users WHERE id = ?', [id]);
    res.json({ ok: true });
}));
exports.adminRouter.get('/fines', (0, error_1.asyncHandler)(async (req, res) => {
    const { status_bayar, q } = req.query;
    const where = [];
    const params = [];
    if (status_bayar) {
        where.push('f.status_bayar = ?');
        params.push(String(status_bayar));
    }
    if (q) {
        where.push('(u.nama LIKE ? OR u.no_anggota LIKE ?)');
        const like = `%${String(q)}%`;
        params.push(like, like);
    }
    const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const rows = (0, db_1.all)(`SELECT f.*, u.nama, u.no_anggota, b.judul, l.tanggal_jatuh_tempo
     FROM fines f
     JOIN loans l ON l.id = f.loan_id
     JOIN users u ON u.id = f.user_id
     JOIN books b ON b.id = l.book_id
     ${whereSql} ORDER BY f.id DESC LIMIT 200`, params);
    const total = (0, db_1.get)('SELECT COUNT(*) as c, COALESCE(SUM(jumlah), 0) as s FROM fines', []) || { c: 0, s: 0 };
    res.json({ fines: rows, total: total.c, totalNominal: total.s });
}));
exports.adminRouter.post('/fines/:id/pay', (0, error_1.asyncHandler)(async (req, res) => {
    const id = Number(req.params.id);
    const row = (0, db_1.get)('SELECT * FROM fines WHERE id = ?', [id]);
    if (!row)
        return res.status(404).json({ error: 'Denda tidak ditemukan.' });
    if (row.status_bayar === 'lunas')
        return res.status(409).json({ error: 'Denda sudah lunas.' });
    (0, db_1.run)('UPDATE fines SET status_bayar = \'lunas\', tanggal_bayar = ? WHERE id = ?', [(0, date_1.nowISO)(), id]);
    (0, db_1.pushNotification)(row.user_id, 'denda', `Pembayaran denda senilai Rp ${Number(row.jumlah).toLocaleString('id-ID')} telah dicatat lunas.`, id);
    res.json({ ok: true });
}));
exports.adminRouter.get('/reservations', (0, error_1.asyncHandler)(async (_req, res) => {
    const rows = (0, db_1.all)(`SELECT r.*, b.judul, b.penulis, u.nama, u.no_anggota
     FROM reservations r
     JOIN books b ON b.id = r.book_id
     JOIN users u ON u.id = r.user_id
     WHERE r.status IN ('menunggu','tersedia')
     ORDER BY r.tanggal_reservasi ASC`);
    res.json({ reservations: rows });
}));
exports.adminRouter.post('/reservations/:id/cancel', (0, error_1.asyncHandler)(async (req, res) => {
    (0, db_1.run)(`UPDATE reservations SET status = 'dibatalkan' WHERE id = ?`, [Number(req.params.id)]);
    res.json({ ok: true });
}));
exports.adminRouter.get('/settings', (0, error_1.asyncHandler)(async (_req, res) => {
    res.json({ settings: { loanDays: Number((0, db_1.getSetting)('loanDays', 7)), finePerDay: Number((0, db_1.getSetting)('finePerDay', 1000)), maxActiveLoans: Number((0, db_1.getSetting)('maxActiveLoans', 3)) } });
}));
exports.adminRouter.put('/settings', (0, error_1.asyncHandler)(async (req, res) => {
    const { loanDays, finePerDay, maxActiveLoans } = req.body || {};
    if (loanDays !== undefined)
        (0, db_1.setSetting)('loanDays', Math.max(1, Number(loanDays)));
    if (finePerDay !== undefined)
        (0, db_1.setSetting)('finePerDay', Math.max(0, Number(finePerDay)));
    if (maxActiveLoans !== undefined)
        (0, db_1.setSetting)('maxActiveLoans', Math.max(1, Number(maxActiveLoans)));
    res.json({ ok: true });
}));

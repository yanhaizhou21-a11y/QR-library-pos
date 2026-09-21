"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanRouter = void 0;
const express_1 = require("express");
const db_1 = require("../db");
const qr_1 = require("../utils/qr");
const auth_1 = require("../middleware/auth");
const error_1 = require("../middleware/error");
const loans_1 = require("../services/loans");
exports.scanRouter = (0, express_1.Router)();
function bookView(row) {
    return {
        id: row.id,
        judul: row.judul,
        penulis: row.penulis,
        kategori: row.kategori,
        stok_tersedia: row.stok_tersedia,
        lokasi_rak: row.lokasi_rak,
    };
}
exports.scanRouter.post('/parse', (0, error_1.asyncHandler)(async (req, res) => {
    const { code } = req.body || {};
    const parsed = (0, qr_1.parseCode)(String(code || ''));
    if (!parsed) {
        return res.json({ valid: false, error: 'QR tidak dikenali Pustaka QR. Pastikan QR berasal dari buku/kartu anggota kami.' });
    }
    if (parsed.type === 'book') {
        const row = (0, db_1.get)('SELECT * FROM books WHERE id = ?', [parsed.id]);
        if (!row)
            return res.json({ valid: false, error: 'QR buku tidak ditemukan di database. Mungkin buku sudah dihapus.' });
        return res.json({ valid: true, type: 'book', book: { ...bookView(row), qr_code: (0, qr_1.bookCode)(row.id) } });
    }
    const user = (0, db_1.get)('SELECT * FROM users WHERE id = ?', [parsed.id]);
    if (!user)
        return res.json({ valid: false, error: 'QR anggota tidak ditemukan. Mungkin akun dihapus.' });
    res.json({
        valid: true,
        type: 'member',
        member: { id: user.id, nama: user.nama, no_anggota: user.no_anggota, status: user.status, qr_code: (0, qr_1.memberCode)(user.id) },
    });
}));
exports.scanRouter.post('/borrow', auth_1.authRequired, (0, error_1.asyncHandler)(async (req, res) => {
    const u = req.user;
    const { bookId } = req.body || {};
    if (!Number.isInteger(Number(bookId)))
        return res.status(400).json({ error: 'Pilih buku yang benar.' });
    const result = (0, loans_1.borrowBook)(u.id, Number(bookId));
    res.status(201).json({ ok: true, loan: result });
}));
exports.scanRouter.post('/borrow-as', auth_1.authRequired, (0, error_1.asyncHandler)(async (req, res) => {
    const { bookId, memberId } = req.body || {};
    if (!Number.isInteger(Number(bookId)))
        return res.status(400).json({ error: 'Pilih buku yang benar.' });
    const result = (0, loans_1.borrowBook)(Number(memberId), Number(bookId));
    res.status(201).json({ ok: true, loan: result });
}));
exports.scanRouter.post('/return', (0, error_1.asyncHandler)(async (req, res) => {
    const { bookId } = req.body || {};
    if (!Number.isInteger(Number(bookId)))
        return res.status(400).json({ error: 'Pilih buku yang benar.' });
    const result = (0, loans_1.returnBook)(Number(bookId));
    res.json({ ok: true, loan: result });
}));

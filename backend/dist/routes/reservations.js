"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reservationsRouter = void 0;
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const error_1 = require("../middleware/error");
const date_1 = require("../utils/date");
exports.reservationsRouter = (0, express_1.Router)();
exports.reservationsRouter.post('/', auth_1.authRequired, (0, error_1.asyncHandler)(async (req, res) => {
    const u = req.user;
    const { bookId } = req.body || {};
    if (!Number.isInteger(Number(bookId)))
        return res.status(400).json({ error: 'Buku tidak valid.' });
    const book = (0, db_1.get)('SELECT id, judul, stok_tersedia FROM books WHERE id = ?', [Number(bookId)]);
    if (!book)
        return res.status(404).json({ error: 'Buku tidak ditemukan.' });
    if (book.stok_tersedia > 0) {
        return res.status(409).json({ error: 'Buku masih tersedia di rak. Silakan pinjam langsung melalui scan QR.' });
    }
    const dup = (0, db_1.get)(`SELECT id FROM reservations WHERE user_id = ? AND book_id = ? AND status IN ('menunggu','tersedia')`, [u.id, book.id]);
    if (dup)
        return res.status(409).json({ error: 'Anda sudah memiliki reservasi untuk buku ini.' });
    const loan = (0, db_1.get)(`SELECT id FROM loans WHERE user_id = ? AND book_id = ? AND status IN ('dipinjam','terlambat')`, [u.id, book.id]);
    if (loan)
        return res.status(409).json({ error: 'Anda sedang meminjam buku ini.' });
    const now = (0, date_1.nowISO)();
    const { lastId } = (0, db_1.run)(`INSERT INTO reservations (user_id, book_id, tanggal_reservasi, status, created_at)
     VALUES (?, ?, ?, 'menunggu', ?)`, [u.id, book.id, now, now]);
    (0, db_1.pushNotification)(u.id, 'reservasi', `Reservasi buku "${book.judul}" tercatat. Anda akan diberi tahu saat tersedia.`, lastId);
    res.status(201).json({ ok: true, reservationId: lastId });
}));
exports.reservationsRouter.get('/me', auth_1.authRequired, (0, error_1.asyncHandler)(async (req, res) => {
    const u = req.user;
    const rows = (0, db_1.all)(`SELECT r.*, b.judul, b.penulis, b.cover_url
     FROM reservations r JOIN books b ON b.id = r.book_id
     WHERE r.user_id = ? ORDER BY r.created_at DESC`, [u.id]);
    res.json({ reservations: rows });
}));
exports.reservationsRouter.delete('/:id', auth_1.authRequired, (0, error_1.asyncHandler)(async (req, res) => {
    const u = req.user;
    const id = Number(req.params.id);
    const row = (0, db_1.get)('SELECT * FROM reservations WHERE id = ?', [id]);
    if (!row)
        return res.status(404).json({ error: 'Reservasi tidak ditemukan.' });
    if (row.user_id !== u.id && u.role !== 'admin')
        return res.status(403).json({ error: 'Bukan reservasi Anda.' });
    (0, db_1.run)(`UPDATE reservations SET status = 'dibatalkan' WHERE id = ?`, [id]);
    res.json({ ok: true });
}));

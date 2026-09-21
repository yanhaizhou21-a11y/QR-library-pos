"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.borrowBook = borrowBook;
exports.returnBook = returnBook;
exports.claimNextReservation = claimNextReservation;
const db_1 = require("../db");
const date_1 = require("../utils/date");
class ApiError extends Error {
    status;
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}
function borrowBook(userId, bookId) {
    const user = (0, db_1.get)('SELECT id, nama, status FROM users WHERE id = ?', [userId]);
    if (!user)
        throw new ApiError(404, 'Anggota tidak ditemukan. Periksa QR kartu anggota.');
    if (user.status !== 'aktif')
        throw new ApiError(403, 'Anggota ini sedang diblokir.');
    const book = (0, db_1.get)('SELECT id, judul, stok_tersedia FROM books WHERE id = ?', [bookId]);
    if (!book)
        throw new ApiError(404, 'Buku tidak ditemukan. Periksa QR buku.');
    const existing = (0, db_1.get)(`SELECT id FROM loans WHERE user_id = ? AND book_id = ? AND status IN ('dipinjam','terlambat')`, [userId, bookId]);
    if (existing)
        throw new ApiError(409, `Anggota sudah meminjam buku ini (peminjaman #${existing.id}).`);
    if (book.stok_tersedia <= 0)
        throw new ApiError(409, 'Stok buku sedang kosong. Silakan lakukan reservasi.');
    const maxLoans = Number((0, db_1.getSetting)('maxActiveLoans', 3));
    const activeCount = (0, db_1.get)(`SELECT COUNT(*) as c FROM loans WHERE user_id = ? AND status IN ('dipinjam','terlambat')`, [userId]);
    if ((activeCount?.c || 0) >= maxLoans) {
        throw new ApiError(409, `Jumlah pinjaman aktif sudah mencapai batas (${maxLoans}). Kembalikan buku terlebih dahulu.`);
    }
    const now = (0, date_1.nowISO)();
    const loanDays = Number((0, db_1.getSetting)('loanDays', 7));
    const due = (0, date_1.addDaysISO)(now, loanDays);
    const { lastId } = (0, db_1.run)(`INSERT INTO loans (user_id, book_id, tanggal_pinjam, tanggal_jatuh_tempo, status, created_at)
     VALUES (?, ?, ?, ?, 'dipinjam', ?)`, [userId, bookId, now, due, now]);
    (0, db_1.run)('UPDATE books SET stok_tersedia = stok_tersedia - 1 WHERE id = ?', [bookId]);
    (0, db_1.run)(`UPDATE reservations SET status = 'selesai' WHERE user_id = ? AND book_id = ? AND status IN ('menunggu','tersedia')`, [userId, bookId]);
    (0, db_1.pushNotification)(userId, 'info', `Berhasil meminjam buku "${book.judul}". Jatuh tempo: ${(0, date_1.fmtDate)(due)}.`, lastId);
    return {
        loanId: lastId,
        judul: book.judul,
        nama: user.nama,
        tanggalPinjam: now,
        tanggalJatuhTempo: due,
        denda: 0,
        hariTerlambat: 0,
    };
}
function returnBook(bookId) {
    const book = (0, db_1.get)('SELECT id, judul FROM books WHERE id = ?', [bookId]);
    if (!book)
        throw new ApiError(404, 'Buku tidak ditemukan. Periksa QR buku.');
    const active = (0, db_1.get)(`SELECT id, user_id, tanggal_jatuh_tempo FROM loans
     WHERE book_id = ? AND status IN ('dipinjam','terlambat')
     ORDER BY id DESC LIMIT 1`, [bookId]);
    if (!active)
        throw new ApiError(404, 'Tidak ada peminjaman aktif untuk buku ini. Buku sudah berada di rak.');
    const now = (0, date_1.nowISO)();
    const late = (0, date_1.daysLate)(active.tanggal_jatuh_tempo, now);
    const finePerDay = Number((0, db_1.getSetting)('finePerDay', 1000));
    const denda = late * finePerDay;
    (0, db_1.run)(`UPDATE loans SET status = 'selesai', tanggal_kembali = ? WHERE id = ?`, [now, active.id]);
    (0, db_1.run)('UPDATE books SET stok_tersedia = stok_tersedia + 1 WHERE id = ?', [bookId]);
    let fineId;
    if (late > 0) {
        const res = (0, db_1.run)(`INSERT INTO fines (loan_id, user_id, jumlah, hari_terlambat, status_bayar, created_at)
       VALUES (?, ?, ?, ?, 'belum', ?)`, [active.id, active.user_id, denda, late, now]);
        fineId = res.lastId;
        const user = (0, db_1.get)('SELECT nama FROM users WHERE id = ?', [active.user_id]);
        (0, db_1.pushNotification)(active.user_id, 'denda', `Buku "${book.judul}" dikembalikan terlambat ${late} hari. Denda Rp ${(denda).toLocaleString('id-ID')} menunggu pembayaran.`, fineId);
    }
    else {
        (0, db_1.pushNotification)(active.user_id, 'info', `Buku "${book.judul}" berhasil dikembalikan tepat waktu. Terima kasih!`, active.id);
    }
    claimNextReservation(bookId);
    const nama = (0, db_1.get)('SELECT nama FROM users WHERE id = ?', [active.user_id])?.nama || '';
    return {
        loanId: active.id,
        judul: book.judul,
        nama,
        tanggalPinjam: '',
        tanggalJatuhTempo: active.tanggal_jatuh_tempo,
        denda,
        hariTerlambat: late,
    };
}
function claimNextReservation(bookId) {
    const nextRes = (0, db_1.get)(`SELECT id, user_id FROM reservations
     WHERE book_id = ? AND status = 'menunggu'
     ORDER BY tanggal_reservasi ASC, id ASC LIMIT 1`, [bookId]);
    if (!nextRes)
        return;
    (0, db_1.run)(`UPDATE reservations SET status = 'tersedia' WHERE id = ?`, [nextRes.id]);
    const book = (0, db_1.get)('SELECT judul FROM books WHERE id = ?', [bookId]);
    const user = (0, db_1.get)('SELECT nama FROM users WHERE id = ?', [nextRes.user_id]);
    (0, db_1.pushNotification)(nextRes.user_id, 'reservasi', `Buku "${book?.judul}" sudah tersedia! Silakan pinjam melalui scan QR sebelum reservasi lain mendahului.`, nextRes.id);
}

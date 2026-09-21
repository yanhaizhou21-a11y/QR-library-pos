"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportsRouter = void 0;
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const error_1 = require("../middleware/error");
const date_1 = require("../utils/date");
exports.reportsRouter = (0, express_1.Router)();
exports.reportsRouter.use(auth_1.authRequired, auth_1.adminRequired);
exports.reportsRouter.get('/overview', (0, error_1.asyncHandler)(async (_req, res) => {
    const totalBuku = (0, db_1.get)('SELECT COUNT(*) as c FROM books')?.c || 0;
    const totalAnggota = (0, db_1.get)('SELECT COUNT(*) as c FROM users WHERE role = \'member\'')?.c || 0;
    const aktif = (0, db_1.get)('SELECT COUNT(*) as c FROM loans WHERE status IN (\'dipinjam\',\'terlambat\')')?.c || 0;
    const terlambat = (0, db_1.get)('SELECT COUNT(*) as c FROM loans WHERE status = \'terlambat\'')?.c || 0;
    const reservasi = (0, db_1.get)('SELECT COUNT(*) as c FROM reservations WHERE status = \'menunggu\'')?.c || 0;
    const peminjamanHariIni = (0, db_1.get)('SELECT COUNT(*) as c FROM loans WHERE tanggal_pinjam LIKE date(\'now\') || \'%\'')?.c || 0;
    const pengembalianHariIni = (0, db_1.get)('SELECT COUNT(*) as c FROM loans WHERE tanggal_kembali LIKE date(\'now\') || \'%\'')?.c || 0;
    const totalDenda = (0, db_1.get)('SELECT COALESCE(SUM(jumlah), 0) as s FROM fines WHERE status_bayar = \'lunas\'')?.s || 0;
    const dendaBelum = (0, db_1.get)('SELECT COALESCE(SUM(jumlah), 0) as s FROM fines WHERE status_bayar = \'belum\'')?.s || 0;
    const bukuKosong = (0, db_1.get)('SELECT COUNT(*) as c FROM books WHERE stok_tersedia <= 0')?.c || 0;
    res.json({
        totalBuku, totalAnggota, aktif, terlambat, reservasi,
        peminjamanHariIni, pengembalianHariIni, totalDenda, dendaBelum, bukuKosong,
    });
}));
exports.reportsRouter.get('/popular-books', (0, error_1.asyncHandler)(async (_req, res) => {
    const rows = (0, db_1.all)(`SELECT b.id, b.judul, b.penulis, b.cover_url, COUNT(l.id) AS total_pinjam, b.stok_tersedia
     FROM books b JOIN loans l ON l.book_id = b.id
     GROUP BY b.id ORDER BY total_pinjam DESC LIMIT 10`);
    res.json({ rows });
}));
exports.reportsRouter.get('/active-members', (0, error_1.asyncHandler)(async (_req, res) => {
    const rows = (0, db_1.all)(`SELECT u.id, u.nama, u.no_anggota, COUNT(l.id) AS total_pinjam,
       SUM(CASE WHEN l.status = 'terlambat' THEN 1 ELSE 0 END) AS terlambat
     FROM users u JOIN loans l ON l.user_id = u.id
     WHERE u.role = 'member'
     GROUP BY u.id ORDER BY total_pinjam DESC LIMIT 10`);
    res.json({ rows });
}));
exports.reportsRouter.get('/monthly-loans', (0, error_1.asyncHandler)(async (_req, res) => {
    const rows = (0, db_1.all)(`SELECT strftime('%Y-%m', tanggal_pinjam) AS bulan, COUNT(*) AS pinjam, 0 AS kembali
     FROM loans GROUP BY bulan
     UNION ALL
     SELECT strftime('%Y-%m', tanggal_kembali) AS bulan, 0 AS pinjam, COUNT(*) AS kembali
     FROM loans WHERE tanggal_kembali IS NOT NULL GROUP BY bulan`);
    const byMonth = {};
    for (const r of rows) {
        byMonth[r.bulan] = byMonth[r.bulan] || { pinjam: 0, kembali: 0 };
        byMonth[r.bulan].pinjam += r.pinjam;
        byMonth[r.bulan].kembali += r.kembali;
    }
    const months = Object.keys(byMonth).sort().slice(-12);
    res.json({ months: months.map((m) => ({ bulan: m, pinjam: byMonth[m].pinjam, kembali: byMonth[m].kembali })) });
}));
exports.reportsRouter.get('/export', (0, error_1.asyncHandler)(async (_req, res) => {
    const popular = (0, db_1.all)(`SELECT b.id, b.judul, COUNT(l.id) AS total_pinjam
     FROM books b JOIN loans l ON l.book_id = b.id GROUP BY b.id ORDER BY total_pinjam DESC`);
    const line = (arr) => arr.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',');
    let csv = '=== BUKU PALING DIPINJAM ===\nJudul,Total Pinjam\n';
    csv += popular.map((r) => line([r.judul, r.total_pinjam])).join('\n') + '\n\n';
    const monthly = (0, db_1.all)(`SELECT strftime('%Y-%m', tanggal_pinjam) AS bulan, COUNT(*) AS pinjam
     FROM loans GROUP BY bulan ORDER BY bulan`);
    csv += '=== PEMINJAMAN PER BULAN ===\nBulan,Pinjam\n';
    csv += monthly.map((r) => line([r.bulan, r.pinjam])).join('\n') + '\n\n';
    const fines = (0, db_1.all)(`SELECT f.id, u.nama, u.no_anggota, b.judul, f.jumlah, f.hari_terlambat, f.status_bayar, f.tanggal_bayar
     FROM fines f JOIN users u ON u.id = f.user_id JOIN loans l ON l.id = f.loan_id JOIN books b ON b.id = l.book_id
     ORDER BY f.id DESC`);
    csv += '=== REKAP DENDA ===\nID,Nama,No Anggota,Judul,Jumlah,Hari Terlambat,Status,Tanggal Bayar\n';
    csv += fines.map((r) => line([r.id, r.nama, r.no_anggota, r.judul, r.jumlah, r.hari_terlambat, r.status_bayar, r.tanggal_bayar ? (0, date_1.fmtDate)(r.tanggal_bayar) : '-'])).join('\n') + '\n';
    csv += `\nDibuat: ${(0, date_1.fmtTime)(new Date().toISOString())}`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="laporan-pustaka.csv"');
    res.send(csv);
}));

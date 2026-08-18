import { Router } from 'express';
import { all, get } from '../db';
import { authRequired, adminRequired } from '../middleware/auth';
import { asyncHandler } from '../middleware/error';
import { fmtDate, fmtTime } from '../utils/date';

export const reportsRouter = Router();
reportsRouter.use(authRequired, adminRequired);

reportsRouter.get('/overview', asyncHandler(async (_req, res) => {
  const totalBuku = get<{ c: number }>('SELECT COUNT(*) as c FROM books')?.c || 0;
  const totalAnggota = get<{ c: number }>('SELECT COUNT(*) as c FROM users WHERE role = \'member\'')?.c || 0;
  const aktif = get<{ c: number }>('SELECT COUNT(*) as c FROM loans WHERE status IN (\'dipinjam\',\'terlambat\')')?.c || 0;
  const terlambat = get<{ c: number }>('SELECT COUNT(*) as c FROM loans WHERE status = \'terlambat\'')?.c || 0;
  const reservasi = get<{ c: number }>('SELECT COUNT(*) as c FROM reservations WHERE status = \'menunggu\'')?.c || 0;
  const peminjamanHariIni = get<{ c: number }>(
    'SELECT COUNT(*) as c FROM loans WHERE tanggal_pinjam LIKE date(\'now\') || \'%\'')?.c || 0;
  const pengembalianHariIni = get<{ c: number }>(
    'SELECT COUNT(*) as c FROM loans WHERE tanggal_kembali LIKE date(\'now\') || \'%\'')?.c || 0;
  const totalDenda = get<{ s: number }>('SELECT COALESCE(SUM(jumlah), 0) as s FROM fines WHERE status_bayar = \'lunas\'')?.s || 0;
  const dendaBelum = get<{ s: number }>('SELECT COALESCE(SUM(jumlah), 0) as s FROM fines WHERE status_bayar = \'belum\'')?.s || 0;
  const bukuKosong = get<{ c: number }>('SELECT COUNT(*) as c FROM books WHERE stok_tersedia <= 0')?.c || 0;
  res.json({
    totalBuku, totalAnggota, aktif, terlambat, reservasi,
    peminjamanHariIni, pengembalianHariIni, totalDenda, dendaBelum, bukuKosong,
  });
}));

reportsRouter.get('/popular-books', asyncHandler(async (_req, res) => {
  const rows = all<any>(
    `SELECT b.id, b.judul, b.penulis, b.cover_url, COUNT(l.id) AS total_pinjam, b.stok_tersedia
     FROM books b JOIN loans l ON l.book_id = b.id
     GROUP BY b.id ORDER BY total_pinjam DESC LIMIT 10`);
  res.json({ rows });
}));

reportsRouter.get('/active-members', asyncHandler(async (_req, res) => {
  const rows = all<any>(
    `SELECT u.id, u.nama, u.no_anggota, COUNT(l.id) AS total_pinjam,
       SUM(CASE WHEN l.status = 'terlambat' THEN 1 ELSE 0 END) AS terlambat
     FROM users u JOIN loans l ON l.user_id = u.id
     WHERE u.role = 'member'
     GROUP BY u.id ORDER BY total_pinjam DESC LIMIT 10`);
  res.json({ rows });
}));

reportsRouter.get('/monthly-loans', asyncHandler(async (_req, res) => {
  const rows = all<{ bulan: string; pinjam: number; kembali: number }>(
    `SELECT strftime('%Y-%m', tanggal_pinjam) AS bulan, COUNT(*) AS pinjam, 0 AS kembali
     FROM loans GROUP BY bulan
     UNION ALL
     SELECT strftime('%Y-%m', tanggal_kembali) AS bulan, 0 AS pinjam, COUNT(*) AS kembali
     FROM loans WHERE tanggal_kembali IS NOT NULL GROUP BY bulan`);
  const byMonth: Record<string, { pinjam: number; kembali: number }> = {};
  for (const r of rows) {
    byMonth[r.bulan] = byMonth[r.bulan] || { pinjam: 0, kembali: 0 };
    byMonth[r.bulan].pinjam += r.pinjam;
    byMonth[r.bulan].kembali += r.kembali;
  }
  const months = Object.keys(byMonth).sort().slice(-12);
  res.json({ months: months.map((m) => ({ bulan: m, pinjam: byMonth[m].pinjam, kembali: byMonth[m].kembali })) });
}));

reportsRouter.get('/export', asyncHandler(async (_req, res) => {
  const popular = all<any>(
    `SELECT b.id, b.judul, COUNT(l.id) AS total_pinjam
     FROM books b JOIN loans l ON l.book_id = b.id GROUP BY b.id ORDER BY total_pinjam DESC`);
  const line = (arr: (string | number)[]) => arr.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',');
  let csv = '=== BUKU PALING DIPINJAM ===\nJudul,Total Pinjam\n';
  csv += popular.map((r) => line([r.judul, r.total_pinjam])).join('\n') + '\n\n';

  const monthly = all<any>(
    `SELECT strftime('%Y-%m', tanggal_pinjam) AS bulan, COUNT(*) AS pinjam
     FROM loans GROUP BY bulan ORDER BY bulan`);
  csv += '=== PEMINJAMAN PER BULAN ===\nBulan,Pinjam\n';
  csv += monthly.map((r) => line([r.bulan, r.pinjam])).join('\n') + '\n\n';

  const fines = all<any>(
    `SELECT f.id, u.nama, u.no_anggota, b.judul, f.jumlah, f.hari_terlambat, f.status_bayar, f.tanggal_bayar
     FROM fines f JOIN users u ON u.id = f.user_id JOIN loans l ON l.id = f.loan_id JOIN books b ON b.id = l.book_id
     ORDER BY f.id DESC`);
  csv += '=== REKAP DENDA ===\nID,Nama,No Anggota,Judul,Jumlah,Hari Terlambat,Status,Tanggal Bayar\n';
  csv += fines.map((r) => line([r.id, r.nama, r.no_anggota, r.judul, r.jumlah, r.hari_terlambat, r.status_bayar, r.tanggal_bayar ? fmtDate(r.tanggal_bayar) : '-'])).join('\n') + '\n';

  csv += `\nDibuat: ${fmtTime(new Date().toISOString())}`;
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="laporan-pustaka.csv"');
  res.send(csv);
}));
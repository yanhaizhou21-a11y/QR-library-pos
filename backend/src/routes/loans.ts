import { Router } from 'express';
import { all, get, run, getSetting } from '../db';
import { authRequired, adminRequired, AuthUser } from '../middleware/auth';
import { asyncHandler } from '../middleware/error';
import { daysLate, fmtDate } from '../utils/date';

export const loansRouter = Router();

function loanView(l: any) {
  const lateDays = l.tanggal_kembali ? daysLate(l.tanggal_jatuh_tempo, l.tanggal_kembali) : daysLate(l.tanggal_jatuh_tempo);
  const isOverdue = !l.tanggal_kembali && lateDays > 0;
  return {
    id: l.id,
    book: { id: l.book_id, judul: l.judul, penulis: l.penulis, cover_url: l.cover_url },
    user: { id: l.user_id, nama: l.nama, no_anggota: l.no_anggota },
    tanggal_pinjam: l.tanggal_pinjam,
    tanggal_jatuh_tempo: l.tanggal_jatuh_tempo,
    tanggal_kembali: l.tanggal_kembali,
    status: isOverdue ? 'terlambat' : l.status,
    hari_terlambat: lateDays,
    denda: Number(l.denda || 0),
    created_at: l.created_at,
  };
}

loansRouter.get('/me', authRequired, asyncHandler(async (req, res) => {
  const u = (req as any).user as AuthUser;
  const finePerDay = Number(getSetting('finePerDay', 1000));
  const rows = all<any>(
    `SELECT l.*, b.judul, b.penulis, b.cover_url,
            f.jumlah as denda, f.status_bayar
     FROM loans l
     JOIN books b ON b.id = l.book_id
     LEFT JOIN fines f ON f.loan_id = l.id
     WHERE l.user_id = ?
     ORDER BY l.tanggal_pinjam DESC`,
    [u.id],
  );
  const loans = rows.map(loanView);
  const active = loans.filter((l: any) => l.status !== 'selesai');
  const history = loans.filter((l: any) => l.status === 'selesai');
  const totalDenda = loans.reduce((s: number, l: any) => s + l.denda, 0);
  const sisaDenda = loans.filter((l: any) => l.status === 'selesai' && l.denda > 0).reduce((s: number, l: any) => s + l.denda, 0);
  res.json({ loans, active, history, totalDenda, finePerDay });
}));

loansRouter.get('/me/export', authRequired, asyncHandler(async (req, res) => {
  const u = (req as any).user as AuthUser;
  const rows = all<any>(
    `SELECT l.*, b.judul, b.penulis FROM loans l
     JOIN books b ON b.id = l.book_id WHERE l.user_id = ?
     ORDER BY l.tanggal_pinjam DESC`, [u.id]);
  const header = 'ID,Judul,Penulis,Tanggal Pinjam,Jatuh Tempo,Tanggal Kembali,Status\n';
  const lines = rows.map((l) => [
    l.id, `"${String(l.judul).replace(/"/g, '""')}"`, `"${String(l.penulis).replace(/"/g, '""')}"`,
    fmtDate(l.tanggal_pinjam), fmtDate(l.tanggal_jatuh_tempo), fmtDate(l.tanggal_kembali), l.status,
  ].join(',')).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="riwayat-peminjaman.csv"');
  res.send(header + lines);
}));

loansRouter.get('/', authRequired, adminRequired, asyncHandler(async (req, res) => {
  const { status, q, limit = 50 } = req.query;
  const where: string[] = [];
  const params: unknown[] = [];
  if (status) { where.push('l.status = ?'); params.push(String(status)); }
  if (q) {
    where.push('(b.judul LIKE ? OR u.nama LIKE ? OR u.no_anggota LIKE ?)');
    const like = `%${String(q)}%`;
    params.push(like, like, like);
  }
  const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';
  const rows = all<any>(
    `SELECT l.*, b.judul, b.penulis, b.cover_url, u.nama, u.no_anggota, f.jumlah as denda
     FROM loans l
     JOIN books b ON b.id = l.book_id
     JOIN users u ON u.id = l.user_id
     LEFT JOIN fines f ON f.loan_id = l.id
     ${whereSql} ORDER BY l.id DESC LIMIT ?`,
    [...params, Number(limit)],
  );
  res.json({ loans: rows.map(loanView) });
}));

loansRouter.get('/export', authRequired, adminRequired, asyncHandler(async (req, res) => {
  const rows = all<any>(
    `SELECT l.*, b.judul, b.penulis, u.nama, u.no_anggota, f.jumlah as denda
     FROM loans l JOIN books b ON b.id = l.book_id
     JOIN users u ON u.id = l.user_id
     LEFT JOIN fines f ON f.loan_id = l.id
     ORDER BY l.id DESC`);
  const header = 'ID,Anggota,No Anggota,Judul,Penulis,Tanggal Pinjam,Jatuh Tempo,Tanggal Kembali,Status,Denda\n';
  const lines = rows.map((l) => [
    l.id, `"${String(l.nama).replace(/"/g, '""')}"`, l.no_anggota,
    `"${String(l.judul).replace(/"/g, '""')}"`, `"${String(l.penulis).replace(/"/g, '""')}"`,
    fmtDate(l.tanggal_pinjam), fmtDate(l.tanggal_jatuh_tempo), fmtDate(l.tanggal_kembali), l.status, l.denda || 0,
  ].join(',')).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="transaksi-perpustakaan.csv"');
  res.send(header + lines);
}));
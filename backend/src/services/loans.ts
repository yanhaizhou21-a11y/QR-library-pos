import { all, get, run, pushNotification, getSetting } from '../db';
import { nowISO, addDaysISO, daysLate, fmtDate } from '../utils/date';

export interface LoanResult {
  loanId: number;
  judul: string;
  nama: string;
  tanggalPinjam: string;
  tanggalJatuhTempo: string;
  denda: number;
  hariTerlambat: number;
}

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function borrowBook(userId: number, bookId: number): LoanResult {
  const user = get<{ id: number; nama: string; status: string }>('SELECT id, nama, status FROM users WHERE id = ?', [userId]);
  if (!user) throw new ApiError(404, 'Anggota tidak ditemukan. Periksa QR kartu anggota.');
  if (user.status !== 'aktif') throw new ApiError(403, 'Anggota ini sedang diblokir.');

  const book = get<{ id: number; judul: string; stok_tersedia: number }>(
    'SELECT id, judul, stok_tersedia FROM books WHERE id = ?', [bookId]);
  if (!book) throw new ApiError(404, 'Buku tidak ditemukan. Periksa QR buku.');

  const existing = get(
    `SELECT id FROM loans WHERE user_id = ? AND book_id = ? AND status IN ('dipinjam','terlambat')`,
    [userId, bookId],
  );
  if (existing) throw new ApiError(409, `Anggota sudah meminjam buku ini (peminjaman #${existing.id}).`);

  if (book.stok_tersedia <= 0) throw new ApiError(409, 'Stok buku sedang kosong. Silakan lakukan reservasi.');

  const maxLoans = Number(getSetting('maxActiveLoans', 3));
  const activeCount = get<{ c: number }>(
    `SELECT COUNT(*) as c FROM loans WHERE user_id = ? AND status IN ('dipinjam','terlambat')`, [userId]);
  if ((activeCount?.c || 0) >= maxLoans) {
    throw new ApiError(409, `Jumlah pinjaman aktif sudah mencapai batas (${maxLoans}). Kembalikan buku terlebih dahulu.`);
  }

  const now = nowISO();
  const loanDays = Number(getSetting('loanDays', 7));
  const due = addDaysISO(now, loanDays);
  const { lastId } = run(
    `INSERT INTO loans (user_id, book_id, tanggal_pinjam, tanggal_jatuh_tempo, status, created_at)
     VALUES (?, ?, ?, ?, 'dipinjam', ?)`,
    [userId, bookId, now, due, now],
  );
  run('UPDATE books SET stok_tersedia = stok_tersedia - 1 WHERE id = ?', [bookId]);
  run(
    `UPDATE reservations SET status = 'selesai' WHERE user_id = ? AND book_id = ? AND status IN ('menunggu','tersedia')`,
    [userId, bookId],
  );
  pushNotification(userId, 'info', `Berhasil meminjam buku "${book.judul}". Jatuh tempo: ${fmtDate(due)}.`, lastId);

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

export function returnBook(bookId: number): LoanResult {
  const book = get<{ id: number; judul: string }>('SELECT id, judul FROM books WHERE id = ?', [bookId]);
  if (!book) throw new ApiError(404, 'Buku tidak ditemukan. Periksa QR buku.');

  const active = get<{ id: number; user_id: number; tanggal_jatuh_tempo: string }>(
    `SELECT id, user_id, tanggal_jatuh_tempo FROM loans
     WHERE book_id = ? AND status IN ('dipinjam','terlambat')
     ORDER BY id DESC LIMIT 1`,
    [bookId],
  );
  if (!active) throw new ApiError(404, 'Tidak ada peminjaman aktif untuk buku ini. Buku sudah berada di rak.');

  const now = nowISO();
  const late = daysLate(active.tanggal_jatuh_tempo, now);
  const finePerDay = Number(getSetting('finePerDay', 1000));
  const denda = late * finePerDay;

  run(`UPDATE loans SET status = 'selesai', tanggal_kembali = ? WHERE id = ?`, [now, active.id]);
  run('UPDATE books SET stok_tersedia = stok_tersedia + 1 WHERE id = ?', [bookId]);

  let fineId: number | undefined;
  if (late > 0) {
    const res = run(
      `INSERT INTO fines (loan_id, user_id, jumlah, hari_terlambat, status_bayar, created_at)
       VALUES (?, ?, ?, ?, 'belum', ?)`,
      [active.id, active.user_id, denda, late, now],
    );
    fineId = res.lastId;
    const user = get<{ nama: string }>('SELECT nama FROM users WHERE id = ?', [active.user_id]);
    pushNotification(
      active.user_id,
      'denda',
      `Buku "${book.judul}" dikembalikan terlambat ${late} hari. Denda Rp ${(denda).toLocaleString('id-ID')} menunggu pembayaran.`,
      fineId,
    );
  } else {
    pushNotification(active.user_id, 'info', `Buku "${book.judul}" berhasil dikembalikan tepat waktu. Terima kasih!`, active.id);
  }

  claimNextReservation(bookId);

  const nama = get<{ nama: string }>('SELECT nama FROM users WHERE id = ?', [active.user_id])?.nama || '';
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

export function claimNextReservation(bookId: number) {
  const nextRes = get<{ id: number; user_id: number }>(
    `SELECT id, user_id FROM reservations
     WHERE book_id = ? AND status = 'menunggu'
     ORDER BY tanggal_reservasi ASC, id ASC LIMIT 1`,
    [bookId],
  );
  if (!nextRes) return;
  run(`UPDATE reservations SET status = 'tersedia' WHERE id = ?`, [nextRes.id]);
  const book = get<{ judul: string }>('SELECT judul FROM books WHERE id = ?', [bookId]);
  const user = get<{ nama: string }>('SELECT nama FROM users WHERE id = ?', [nextRes.user_id]);
  pushNotification(
    nextRes.user_id,
    'reservasi',
    `Buku "${book?.judul}" sudah tersedia! Silakan pinjam melalui scan QR sebelum reservasi lain mendahului.`,
    nextRes.id,
  );
}
import { all, get, run, pushNotification, getSetting } from '../db';
import { nowISO, addDaysISO, daysLate, fmtDate } from '../utils/date';

function markOverdue() {
  const now = new Date().toISOString().slice(0, 10);
  const overdue = all<{ id: number; user_id: number; book_id: number; tanggal_jatuh_tempo: string }>(
    `SELECT id, user_id, book_id, tanggal_jatuh_tempo
     FROM loans WHERE status = 'dipinjam' AND tanggal_jatuh_tempo < ?`,
    [now],
  );
  for (const loan of overdue) {
    run(`UPDATE loans SET status = 'terlambat' WHERE id = ?`, [loan.id]);
    const days = daysLate(loan.tanggal_jatuh_tempo);
    const book = get<{ judul: string }>('SELECT judul FROM books WHERE id = ?', [loan.book_id]);
    pushNotification(loan.user_id, 'denda', `Peminjaman "${book?.judul}" (#${loan.id}) terlambat ${days} hari. Denda berlaku.`, loan.id);
  }
}

function sendDueReminders() {
  const lo = Number(getSetting('loanDays', 7));
  const today = new Date().toISOString().slice(0, 10);
  const dueTomorrow = addDaysISO(new Date().toISOString(), 1).slice(0, 10);
  const rows = all<{ id: number; user_id: number; book_id: number; tanggal_jatuh_tempo: string }>(
    `SELECT l.id, l.user_id, l.book_id, l.tanggal_jatuh_tempo
     FROM loans l WHERE l.status = 'dipinjam' AND l.tanggal_jatuh_tempo BETWEEN ? AND ?`,
    [today, dueTomorrow],
  );
  for (const r of rows) {
    const exists = get('SELECT id FROM notifications WHERE tipe = ? AND ref_id = ?', ['reminder', r.id]);
    if (exists) continue;
    const book = get<{ judul: string }>('SELECT judul FROM books WHERE id = ?', [r.book_id]);
    pushNotification(r.user_id, 'reminder', `Buku "${book?.judul}" harus dikembalikan paling lambat ${fmtDate(r.tanggal_jatuh_tempo)} (H-1).`, r.id);
  }
}

export function syncNotifications() {
  try {
    markOverdue();
    sendDueReminders();
  } catch (err) {
    console.error('[scheduler]', err);
  }
}

export function startScheduler() {
  syncNotifications();
  const timer = setInterval(syncNotifications, 6 * 60 * 60 * 1000);
  timer.unref();
  return timer;
}
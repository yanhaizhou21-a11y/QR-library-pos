"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncNotifications = syncNotifications;
exports.startScheduler = startScheduler;
const db_1 = require("../db");
const date_1 = require("../utils/date");
function markOverdue() {
    const now = new Date().toISOString().slice(0, 10);
    const overdue = (0, db_1.all)(`SELECT id, user_id, book_id, tanggal_jatuh_tempo
     FROM loans WHERE status = 'dipinjam' AND tanggal_jatuh_tempo < ?`, [now]);
    for (const loan of overdue) {
        (0, db_1.run)(`UPDATE loans SET status = 'terlambat' WHERE id = ?`, [loan.id]);
        const days = (0, date_1.daysLate)(loan.tanggal_jatuh_tempo);
        const book = (0, db_1.get)('SELECT judul FROM books WHERE id = ?', [loan.book_id]);
        (0, db_1.pushNotification)(loan.user_id, 'denda', `Peminjaman "${book?.judul}" (#${loan.id}) terlambat ${days} hari. Denda berlaku.`, loan.id);
    }
}
function sendDueReminders() {
    const lo = Number((0, db_1.getSetting)('loanDays', 7));
    const today = new Date().toISOString().slice(0, 10);
    const dueTomorrow = (0, date_1.addDaysISO)(new Date().toISOString(), 1).slice(0, 10);
    const rows = (0, db_1.all)(`SELECT l.id, l.user_id, l.book_id, l.tanggal_jatuh_tempo
     FROM loans l WHERE l.status = 'dipinjam' AND l.tanggal_jatuh_tempo BETWEEN ? AND ?`, [today, dueTomorrow]);
    for (const r of rows) {
        const exists = (0, db_1.get)('SELECT id FROM notifications WHERE tipe = ? AND ref_id = ?', ['reminder', r.id]);
        if (exists)
            continue;
        const book = (0, db_1.get)('SELECT judul FROM books WHERE id = ?', [r.book_id]);
        (0, db_1.pushNotification)(r.user_id, 'reminder', `Buku "${book?.judul}" harus dikembalikan paling lambat ${(0, date_1.fmtDate)(r.tanggal_jatuh_tempo)} (H-1).`, r.id);
    }
}
function syncNotifications() {
    try {
        markOverdue();
        sendDueReminders();
    }
    catch (err) {
        console.error('[scheduler]', err);
    }
}
function startScheduler() {
    syncNotifications();
    const timer = setInterval(syncNotifications, 6 * 60 * 60 * 1000);
    timer.unref();
    return timer;
}

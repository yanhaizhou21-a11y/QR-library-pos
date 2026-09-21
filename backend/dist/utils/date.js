"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uid = uid;
exports.randomDigits = randomDigits;
exports.todayISO = todayISO;
exports.nowISO = nowISO;
exports.addDaysISO = addDaysISO;
exports.dateOnly = dateOnly;
exports.diffDays = diffDays;
exports.daysLate = daysLate;
exports.fmtTime = fmtTime;
exports.fmtDate = fmtDate;
exports.rupiah = rupiah;
const node_crypto_1 = __importDefault(require("node:crypto"));
function uid(len = 24) {
    return node_crypto_1.default.randomBytes(Math.ceil(len / 2)).toString('hex').slice(0, len);
}
function randomDigits(len = 4) {
    let out = '';
    for (let i = 0; i < len; i++)
        out += Math.floor(Math.random() * 10).toString();
    return out;
}
function todayISO() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function nowISO() {
    return new Date().toISOString();
}
function addDaysISO(iso, days) {
    const d = new Date(iso);
    d.setDate(d.getDate() + days);
    return d.toISOString();
}
function dateOnly(iso) {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function diffDays(aISO, bISO) {
    const a = new Date(dateOnly(aISO)).getTime();
    const b = new Date(dateOnly(bISO)).getTime();
    return Math.round((a - b) / 86400000);
}
function daysLate(dueISO, returnedISO = nowISO()) {
    return Math.max(0, diffDays(returnedISO, dueISO));
}
function fmtTime(iso) {
    return new Date(iso).toLocaleString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
}
function fmtDate(iso) {
    if (!iso)
        return '-';
    return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}
function rupiah(n) {
    return 'Rp ' + (n || 0).toLocaleString('id-ID');
}

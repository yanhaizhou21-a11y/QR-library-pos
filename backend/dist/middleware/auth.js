"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRequired = authRequired;
exports.adminRequired = adminRequired;
exports.optionalAuth = optionalAuth;
const jwt_1 = require("../utils/jwt");
const db_1 = require("../db");
function authRequired(req, res, next) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    const payload = token ? (0, jwt_1.verifyToken)(token) : null;
    if (!payload || payload.type !== 'access') {
        return res.status(401).json({ error: 'Sesi berakhir. Silakan masuk kembali.' });
    }
    const user = (0, db_1.get)('SELECT id, role, nama, email, no_anggota, status FROM users WHERE id = ?', [payload.id]);
    if (!user)
        return res.status(401).json({ error: 'Akun tidak ditemukan.' });
    if (user.status === 'blokir')
        return res.status(403).json({ error: 'Akun Anda diblokir. Hubungi petugas perpustakaan.' });
    req.user = user;
    next();
}
function adminRequired(req, res, next) {
    const user = req.user;
    if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Hanya dapat diakses oleh petugas/admin.' });
    }
    next();
}
function optionalAuth(req, res, next) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    const payload = token ? (0, jwt_1.verifyToken)(token) : null;
    if (payload && payload.type === 'access') {
        const user = (0, db_1.get)('SELECT id, role, nama, email, no_anggota, status FROM users WHERE id = ?', [payload.id]);
        if (user)
            req.user = user;
    }
    next();
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationsRouter = void 0;
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const error_1 = require("../middleware/error");
const db_2 = require("../db");
exports.notificationsRouter = (0, express_1.Router)();
function notifView(n) {
    return {
        id: n.id,
        tipe: n.tipe,
        pesan: n.pesan,
        is_read: Number(n.is_read) === 1,
        created_at: n.created_at,
    };
}
exports.notificationsRouter.get('/me', auth_1.authRequired, (0, error_1.asyncHandler)(async (req, res) => {
    const u = req.user;
    const rows = (0, db_2.all)('SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT 100', [u.id]);
    const count = (0, db_2.all)('SELECT COUNT(*) as c FROM notifications WHERE user_id = ? AND is_read = 0', [u.id])[0];
    res.json({ notifications: rows.map(notifView), unread: count?.c || 0 });
}));
exports.notificationsRouter.post('/:id/read', auth_1.authRequired, (0, error_1.asyncHandler)(async (req, res) => {
    const u = req.user;
    (0, db_1.run)('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [Number(req.params.id), u.id]);
    res.json({ ok: true });
}));
exports.notificationsRouter.post('/read-all', auth_1.authRequired, (0, error_1.asyncHandler)(async (req, res) => {
    const u = req.user;
    (0, db_1.run)('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [u.id]);
    res.json({ ok: true });
}));

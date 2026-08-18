import { Router } from 'express';
import { run } from '../db';
import { authRequired, adminRequired, AuthUser } from '../middleware/auth';
import { asyncHandler } from '../middleware/error';
import { all } from '../db';

export const notificationsRouter = Router();

function notifView(n: any) {
  return {
    id: n.id,
    tipe: n.tipe,
    pesan: n.pesan,
    is_read: Number(n.is_read) === 1,
    created_at: n.created_at,
  };
}

notificationsRouter.get('/me', authRequired, asyncHandler(async (req, res) => {
  const u = (req as any).user as AuthUser;
  const rows = all('SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT 100', [u.id]);
  const count = all<{ c: number }>(
    'SELECT COUNT(*) as c FROM notifications WHERE user_id = ? AND is_read = 0', [u.id])[0];
  res.json({ notifications: rows.map(notifView), unread: count?.c || 0 });
}));

notificationsRouter.post('/:id/read', authRequired, asyncHandler(async (req, res) => {
  const u = (req as any).user as AuthUser;
  run('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [Number(req.params.id), u.id]);
  res.json({ ok: true });
}));

notificationsRouter.post('/read-all', authRequired, asyncHandler(async (req, res) => {
  const u = (req as any).user as AuthUser;
  run('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [u.id]);
  res.json({ ok: true });
}));
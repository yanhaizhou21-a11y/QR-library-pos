import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { get } from '../db';

export interface AuthUser {
  id: number;
  role: 'admin' | 'member';
  nama: string;
  email: string;
  no_anggota: string | null;
  status: string;
}

export function authRequired(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const payload = token ? verifyToken(token) : null;
  if (!payload || payload.type !== 'access') {
    return res.status(401).json({ error: 'Sesi berakhir. Silakan masuk kembali.' });
  }
  const user = get<AuthUser>(
    'SELECT id, role, nama, email, no_anggota, status FROM users WHERE id = ?',
    [payload.id],
  );
  if (!user) return res.status(401).json({ error: 'Akun tidak ditemukan.' });
  if (user.status === 'blokir') return res.status(403).json({ error: 'Akun Anda diblokir. Hubungi petugas perpustakaan.' });
  (req as any).user = user;
  next();
}

export function adminRequired(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user as AuthUser | undefined;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Hanya dapat diakses oleh petugas/admin.' });
  }
  next();
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const payload = token ? verifyToken(token) : null;
  if (payload && payload.type === 'access') {
    const user = get<AuthUser>('SELECT id, role, nama, email, no_anggota, status FROM users WHERE id = ?', [payload.id]);
    if (user) (req as any).user = user;
  }
  next();
}
import jsonwebtoken from 'jsonwebtoken';
import { config } from '../config';

export interface JwtPayload {
  id: number;
  role: 'admin' | 'member';
  type: 'access' | 'refresh';
}

export function signAccess(userId: number, role: 'admin' | 'member'): string {
  return jsonwebtoken.sign({ id: userId, role, type: 'access' }, config.jwtSecret, {
    expiresIn: config.accessTtl,
  });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const payload = jsonwebtoken.verify(token, config.jwtSecret) as unknown as JwtPayload;
    return payload;
  } catch {
    return null;
  }
}
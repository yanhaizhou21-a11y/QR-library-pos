import { Request, Response, NextFunction } from 'express';

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void> | void,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function notFound(req: Request, res: Response) {
  res.status(404).json({ error: 'Endpoint tidak ditemukan.' });
}

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('[error]', err);
  const status = err.status || 500;
  const message = err.message || 'Terjadi kesalahan server.';
  if (res.headersSent) return next(err);
  res.status(status).json({ error: message });
}
import express from 'express';
import cors from 'cors';
import { config } from './config';
import './db';
import { seed } from './seed';
import { authRouter } from './routes/auth';
import { booksRouter } from './routes/books';
import { scanRouter } from './routes/scan';
import { loansRouter } from './routes/loans';
import { reservationsRouter } from './routes/reservations';
import { notificationsRouter } from './routes/notifications';
import { adminRouter } from './routes/admin';
import { reportsRouter } from './routes/reports';
import { errorHandler, notFound } from './middleware/error';
import { startScheduler } from './services/scheduler';
import { rateLimit } from './utils/rateLimit';

const app = express();

// Security Headers Middleware
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(self)');
  next();
});

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) =>
  res.json({
    ok: true,
    nama: 'Pustaka QR API',
    version: '2.0.0',
    waktu: new Date().toISOString(),
  }),
);

// Global API rate limiters for security
const scanLimiter = rateLimit(60, 60 * 1000); // 60 scans per minute per IP

app.use('/api/auth', authRouter);
app.use('/api/books', booksRouter);
app.use('/api/scan', scanLimiter, scanRouter);
app.use('/api/loans', loansRouter);
app.use('/api/reservations', reservationsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/admin/reports', reportsRouter);

app.use(notFound);
app.use(errorHandler);

const server = app.listen(config.port, () => {
  console.log(`Pustaka QR API siap di http://localhost:${config.port}`);
});
seed();
startScheduler();

const shutdown = () => {
  console.log('\nMenutup server...');
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 3000).unref();
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
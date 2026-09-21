import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
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
import { rateLimit as customRateLimit } from './utils/rateLimit';

const app = express();

// Security Headers with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "same-site" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "sameorigin" },
  hidePoweredBy: true,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: "none" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true,
}));

// CORS Configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400,
}));

// Body Parser with Size Limits
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

app.get('/health', (_req, res) =>
  res.json({
    ok: true,
    nama: 'Pustaka QR API',
    version: '2.0.0',
    waktu: new Date().toISOString(),
  }),
);

// Global API rate limiters for security
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Terlalu banyak permintaan. Coba lagi nanti.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 8, // Limit each IP to 8 login attempts per windowMs
  message: { error: 'Terlalu banyak percobaan login. Coba lagi beberapa saat.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const scanLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 scans per minute
  message: { error: 'Terlalu banyak scan. Coba lagi beberapa saat.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general rate limiter to all API routes
app.use('/api', apiLimiter);

// Apply specific rate limiters to sensitive routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/scan', scanLimiter);

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
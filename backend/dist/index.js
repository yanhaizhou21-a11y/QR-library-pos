"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const config_1 = require("./config");
require("./db");
const seed_1 = require("./seed");
const auth_1 = require("./routes/auth");
const books_1 = require("./routes/books");
const scan_1 = require("./routes/scan");
const loans_1 = require("./routes/loans");
const reservations_1 = require("./routes/reservations");
const notifications_1 = require("./routes/notifications");
const admin_1 = require("./routes/admin");
const reports_1 = require("./routes/reports");
const error_1 = require("./middleware/error");
const scheduler_1 = require("./services/scheduler");
const app = (0, express_1.default)();
// Security Headers with Helmet
app.use((0, helmet_1.default)({
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
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400,
}));
// Body Parser with Size Limits
app.use(express_1.default.json({ limit: '2mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '2mb' }));
app.get('/health', (_req, res) => res.json({
    ok: true,
    nama: 'Pustaka QR API',
    version: '2.0.0',
    waktu: new Date().toISOString(),
}));
// Global API rate limiters for security
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: 'Terlalu banyak permintaan. Coba lagi nanti.' },
    standardHeaders: true,
    legacyHeaders: false,
});
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 8, // Limit each IP to 8 login attempts per windowMs
    message: { error: 'Terlalu banyak percobaan login. Coba lagi beberapa saat.' },
    standardHeaders: true,
    legacyHeaders: false,
});
const scanLimiter = (0, express_rate_limit_1.default)({
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
app.use('/api/auth', auth_1.authRouter);
app.use('/api/books', books_1.booksRouter);
app.use('/api/scan', scanLimiter, scan_1.scanRouter);
app.use('/api/loans', loans_1.loansRouter);
app.use('/api/reservations', reservations_1.reservationsRouter);
app.use('/api/notifications', notifications_1.notificationsRouter);
app.use('/api/admin', admin_1.adminRouter);
app.use('/api/admin/reports', reports_1.reportsRouter);
app.use(error_1.notFound);
app.use(error_1.errorHandler);
const server = app.listen(config_1.config.port, () => {
    console.log(`Pustaka QR API siap di http://localhost:${config_1.config.port}`);
});
(0, seed_1.seed)();
(0, scheduler_1.startScheduler)();
const shutdown = () => {
    console.log('\nMenutup server...');
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 3000).unref();
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimit = rateLimit;
const buckets = new Map();
function rateLimit(max, windowMs, key) {
    return (req, res, next) => {
        const k = key || req.ip || 'unknown';
        const now = Date.now();
        let b = buckets.get(k);
        if (!b || b.resetAt < now) {
            b = { count: 0, resetAt: now + windowMs };
            buckets.set(k, b);
        }
        b.count++;
        if (b.count > max) {
            return res.status(429).json({
                error: 'Terlalu banyak percobaan. Coba lagi beberapa saat.',
                retryAfterMs: b.resetAt - now,
            });
        }
        next();
    };
}

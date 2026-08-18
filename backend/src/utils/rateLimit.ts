const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(max: number, windowMs: number, key?: string) {
  return (req: any, res: any, next: any) => {
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
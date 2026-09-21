"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = asyncHandler;
exports.notFound = notFound;
exports.errorHandler = errorHandler;
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
function notFound(req, res) {
    res.status(404).json({ error: 'Endpoint tidak ditemukan.' });
}
function errorHandler(err, req, res, next) {
    console.error('[error]', err);
    const status = err.status || 500;
    const message = err.message || 'Terjadi kesalahan server.';
    if (res.headersSent)
        return next(err);
    res.status(status).json({ error: message });
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULTS = exports.config = void 0;
exports.config = {
    port: Number(process.env.PORT || 4000),
    jwtSecret: process.env.JWT_SECRET || 'pustaka-dev-secret-change-me',
    accessTtl: '15m',
    refreshTtlDays: 30,
    publicUrl: process.env.PUBLIC_URL || `http://localhost:${Number(process.env.PORT || 4000)}`,
};
exports.DEFAULTS = {
    loanDays: 7,
    finePerDay: 1000,
    maxActiveLoans: 3,
};

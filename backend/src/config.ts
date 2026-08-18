export const config = {
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || 'pustaka-dev-secret-change-me',
  accessTtl: '15m' as const,
  refreshTtlDays: 30,
  publicUrl: process.env.PUBLIC_URL || `http://localhost:${Number(process.env.PORT || 4000)}`,
};

export const DEFAULTS = {
  loanDays: 7,
  finePerDay: 1000,
  maxActiveLoans: 3,
};
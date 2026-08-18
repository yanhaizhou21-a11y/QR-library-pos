import crypto from 'node:crypto';

export function uid(len = 24): string {
  return crypto.randomBytes(Math.ceil(len / 2)).toString('hex').slice(0, len);
}

export function randomDigits(len = 4): string {
  let out = '';
  for (let i = 0; i < len; i++) out += Math.floor(Math.random() * 10).toString();
  return out;
}

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function addDaysISO(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export function dateOnly(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function diffDays(aISO: string, bISO: string): number {
  const a = new Date(dateOnly(aISO)).getTime();
  const b = new Date(dateOnly(bISO)).getTime();
  return Math.round((a - b) / 86400000);
}

export function daysLate(dueISO: string, returnedISO: string = nowISO()): number {
  return Math.max(0, diffDays(returnedISO, dueISO));
}

export function fmtTime(iso: string): string {
  return new Date(iso).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function fmtDate(iso: string): string {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function rupiah(n: number): string {
  return 'Rp ' + (n || 0).toLocaleString('id-ID');
}
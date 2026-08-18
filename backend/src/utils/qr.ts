import QRCode from 'qrcode';

export const BOOK_PREFIX = 'pustaka:book:';
export const MEMBER_PREFIX = 'pustaka:member:';

export function bookCode(id: number): string {
  return `${BOOK_PREFIX}${id}`;
}
export function memberCode(id: number): string {
  return `${MEMBER_PREFIX}${id}`;
}

export function parseCode(text: string): { type: 'book' | 'member'; id: number } | null {
  if (typeof text !== 'string') return null;
  const m = text.trim().match(/^pustaka:(book|member):(\d+)$/);
  if (!m) return null;
  return { type: m[1] as 'book' | 'member', id: Number(m[2]) };
}

export async function qrPngBuffer(text: string): Promise<Buffer> {
  return QRCode.toBuffer(text, { type: 'png', width: 400, margin: 1, errorCorrectionLevel: 'M' });
}
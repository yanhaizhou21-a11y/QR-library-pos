export interface User {
  id: number;
  nama: string;
  email: string;
  role: 'admin' | 'member';
  no_anggota: string | null;
  phone?: string | null;
  status: string;
  created_at?: string;
}

export interface Book {
  id: number;
  judul: string;
  penulis: string;
  penerbit: string | null;
  tahun: number | null;
  kategori: string | null;
  isbn: string | null;
  cover_url: string | null;
  lokasi_rak: string | null;
  deskripsi: string | null;
  qr_code: string;
  stok_total: number;
  stok_tersedia: number;
  rating_avg: number;
  rating_count: number;
  created_at?: string;
}

export interface BookListItem {
  id: number;
  judul: string;
  penulis: string;
  cover_url: string | null;
  kategori: string | null;
  stok_tersedia: number;
  stok_total: number;
}

const KEY_ACCESS = 'pq_access';
const KEY_REFRESH = 'pq_refresh';
const KEY_USER = 'pq_user';

let refreshPromise: Promise<boolean> | null = null;

export function getAccess(): string | null {
  return localStorage.getItem(KEY_ACCESS);
}
export function getRefresh(): string | null {
  return localStorage.getItem(KEY_REFRESH);
}
export function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(KEY_USER);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function storeTokens(access: string, refresh: string, user: User) {
  localStorage.setItem(KEY_ACCESS, access);
  localStorage.setItem(KEY_REFRESH, refresh);
  localStorage.setItem(KEY_USER, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(KEY_ACCESS);
  localStorage.removeItem(KEY_REFRESH);
  localStorage.removeItem(KEY_USER);
}

async function refreshTokens(): Promise<boolean> {
  const refresh = getRefresh();
  if (!refresh) return false;
  try {
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refresh }),
    });
    if (!res.ok) {
      clearSession();
      return false;
    }
    const data = await res.json();
    storeTokens(data.accessToken, data.refreshToken, data.user);
    return true;
  } catch {
    clearSession();
    return false;
  }
}

async function raw(path: string, init?: RequestInit, retry = true): Promise<Response> {
  const headers: Record<string, string> = { ...(init?.headers as Record<string, string>) };
  if (init?.body) headers['Content-Type'] = 'application/json';
  const access = getAccess();
  if (access) headers['Authorization'] = `Bearer ${access}`;

  let res = await fetch(`/api${path}`, { ...init, headers });

  if (res.status === 401 && retry) {
    if (!refreshPromise) {
      refreshPromise = refreshTokens().finally(() => {
        refreshPromise = null;
      });
    }
    const ok = await refreshPromise;
    if (ok) return raw(path, init, false);
  }
  return res;
}

async function parse<T>(res: Response): Promise<T> {
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { error: text };
  }
  if (!res.ok) {
    const err = new Error(data?.error || 'Terjadi kesalahan.');
    (err as any).status = res.status;
    throw err;
  }
  return data as T;
}

export const api = {
  get<T = any>(path: string): Promise<T> {
    return raw(path).then((r) => parse<T>(r));
  },
  post<T = any>(path: string, body?: unknown): Promise<T> {
    return raw(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }).then((r) => parse<T>(r));
  },
  put<T = any>(path: string, body?: unknown): Promise<T> {
    return raw(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }).then((r) => parse<T>(r));
  },
  del<T = any>(path: string): Promise<T> {
    return raw(path, { method: 'DELETE' }).then((r) => parse<T>(r));
  },
  async download(path: string, filename: string) {
    const res = await raw(path);
    if (!res.ok) {
      const msg = await parse<{ error: string }>(res).catch(() => ({ error: 'Gagal mengunduh.' }));
      throw new Error(msg.error);
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },
};

export function setSession(access: string, refresh: string, user: User) {
  storeTokens(access, refresh, user);
}

export async function authImageUrl(path: string): Promise<string> {
  const res = await raw(path);
  if (!res.ok) throw new Error('Gagal memuat gambar.');
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}
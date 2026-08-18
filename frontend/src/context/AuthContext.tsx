import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, getStoredUser, setSession, clearSession, User } from '../api/client';

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (nama: string, email: string, password: string, phone?: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>(null as unknown as AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (getStoredUser()) {
      api
        .get<{ user: User }>('/auth/me')
        .then((d) => setUser(d.user))
        .catch(() => clearSession())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.post<{ accessToken: string; refreshToken: string; user: User }>('/auth/login', {
      email,
      password,
    });
    setSession(data.accessToken, data.refreshToken, data.user);
    setUser(data.user);
    return data.user;
  };

  const register = async (nama: string, email: string, password: string, phone?: string) => {
    const data = await api.post<{ accessToken: string; refreshToken: string; user: User }>('/auth/register', {
      nama,
      email,
      password,
      phone,
    });
    setSession(data.accessToken, data.refreshToken, data.user);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    await api.post('/auth/logout', { refreshToken: localStorage.getItem('pq_refresh') }).catch(() => undefined);
    clearSession();
    setUser(null);
  };

  const refreshUser = async () => {
    const d = await api.get<{ user: User }>('/auth/me');
    setUser(d.user);
  };

  return <Ctx.Provider value={{ user, loading, login, register, logout, refreshUser }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  return useContext(Ctx);
}

export function useHasRole(required: 'admin' | 'member' | 'any') {
  const { user } = useAuth();
  if (required === 'any') return !!user;
  return user?.role === required;
}
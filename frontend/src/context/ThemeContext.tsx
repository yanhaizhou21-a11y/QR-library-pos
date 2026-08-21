import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'monochrome' | 'monochrome-dark' | 'cyberpunk';

interface ThemeCtx {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggle: () => void;
}

const Ctx = createContext<ThemeCtx>({ theme: 'light', setTheme: () => {}, toggle: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem('pustaka_theme') as Theme | null;
    if (
      stored === 'dark' ||
      stored === 'light' ||
      stored === 'monochrome' ||
      stored === 'monochrome-dark' ||
      stored === 'cyberpunk'
    ) {
      return stored;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark' || theme === 'monochrome-dark' || theme === 'cyberpunk');
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('pustaka_theme', theme);
  }, [theme]);

  const setTheme = (next: Theme) => setThemeState(next);

  const toggle = () =>
    setThemeState((t) => {
      if (t === 'light') return 'dark';
      if (t === 'dark') return 'monochrome';
      if (t === 'monochrome') return 'monochrome-dark';
      if (t === 'monochrome-dark') return 'cyberpunk';
      return 'light';
    });

  return <Ctx.Provider value={{ theme, setTheme, toggle }}>{children}</Ctx.Provider>;
}

export function useTheme() {
  return useContext(Ctx);
}

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type Theme = 'light' | 'dark' | 'monochrome' | 'monochrome-dark' | 'cyberpunk';

export interface ThemeOption {
  id: Theme;
  label: string;
  category: 'Modern' | 'Monochrome' | 'Cyberpunk';
  badge: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  { id: 'light', label: 'Modern Clean (Light)', category: 'Modern', badge: 'Blue / Slate' },
  { id: 'dark', label: 'Modern Clean (Dark)', category: 'Modern', badge: 'Indigo Void' },
  { id: 'monochrome', label: 'Minimalist Monochrome', category: 'Monochrome', badge: 'Pure B&W / Serif' },
  { id: 'monochrome-dark', label: 'Monochrome (Dark)', category: 'Monochrome', badge: 'Onyx Editorial' },
  { id: 'cyberpunk', label: 'Cyberpunk Terminal', category: 'Cyberpunk', badge: 'Neon Matrix' },
];

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeProviderContext = createContext<ThemeProviderState | null>(null);

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = 'pustaka_theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return defaultTheme;

    const storedTheme = localStorage.getItem(storageKey) as Theme | null;
    if (
      storedTheme === 'light' ||
      storedTheme === 'dark' ||
      storedTheme === 'monochrome' ||
      storedTheme === 'monochrome-dark' ||
      storedTheme === 'cyberpunk'
    ) {
      return storedTheme;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : defaultTheme;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark' || theme === 'monochrome-dark' || theme === 'cyberpunk');
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const setTheme = useCallback(
    (nextTheme: Theme) => {
      localStorage.setItem(storageKey, nextTheme);
      setThemeState(nextTheme);
    },
    [storageKey],
  );

  const toggleTheme = useCallback(() => {
    setThemeState((currentTheme) => {
      let nextTheme: Theme;
      if (currentTheme === 'light') nextTheme = 'dark';
      else if (currentTheme === 'dark') nextTheme = 'monochrome';
      else if (currentTheme === 'monochrome') nextTheme = 'monochrome-dark';
      else if (currentTheme === 'monochrome-dark') nextTheme = 'cyberpunk';
      else nextTheme = 'light';
      localStorage.setItem(storageKey, nextTheme);
      return nextTheme;
    });
  }, [storageKey]);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [setTheme, theme, toggleTheme],
  );

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeProviderContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider.');
  }

  return context;
}

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeProviderContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'dark' | 'light'; // resolved theme (system -> actual)
}

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

const ThemeProviderContext = createContext<ThemeProviderContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'content-store-theme',
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );
  const [actualTheme, setActualTheme] = useState<'dark' | 'light'>('light');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    let resolvedTheme: 'dark' | 'light';

    if (theme === 'system') {
      resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    } else {
      resolvedTheme = theme;
    }

    root.classList.add(resolvedTheme);
    setActualTheme(resolvedTheme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      
      const newTheme = mediaQuery.matches ? 'dark' : 'light';
      root.classList.add(newTheme);
      setActualTheme(newTheme);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    actualTheme,
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};
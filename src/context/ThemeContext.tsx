import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppTheme = 'dark' | 'light' | 'amoled' | 'system';

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  resolvedTheme: 'dark' | 'light' | 'amoled';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem('tradex_theme');
      if (saved === 'dark' || saved === 'light' || saved === 'amoled' || saved === 'system') {
        return saved;
      }
    } catch (e) {
      // ignore
    }
    return 'amoled';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light' | 'amoled'>('amoled');

  const applyTheme = (t: AppTheme) => {
    let active: 'dark' | 'light' | 'amoled' = 'dark';
    if (t === 'system') {
      const isSystemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      active = isSystemDark ? 'dark' : 'light';
    } else {
      active = t;
    }

    setResolvedTheme(active);

    const root = document.documentElement;
    root.classList.remove('theme-light', 'theme-dark', 'theme-amoled', 'dark', 'light');

    if (active === 'light') {
      root.classList.add('theme-light', 'light');
      root.style.colorScheme = 'light';
      document.body.style.backgroundColor = '#f8fafc';
      document.body.style.color = '#0f172a';
    } else if (active === 'amoled') {
      root.classList.add('theme-amoled', 'dark');
      root.style.colorScheme = 'dark';
      document.body.style.backgroundColor = '#000000';
      document.body.style.color = '#E0E0E0';
    } else {
      root.classList.add('theme-dark', 'dark');
      root.style.colorScheme = 'dark';
      document.body.style.backgroundColor = '#09090b';
      document.body.style.color = '#E0E0E0';
    }
  };

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem('tradex_theme', theme);
    } catch (e) {
      // ignore
    }
  }, [theme]);

  // Listen to system changes if system mode
  useEffect(() => {
    if (theme !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => applyTheme('system');
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [theme]);

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
};

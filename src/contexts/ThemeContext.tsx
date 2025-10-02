import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  isDark: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  systemPrefersDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'theme-preference';
const THEME_ATTRIBUTE = 'data-theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    // Always start in light mode
    return 'light';
  });
  
  const [systemPrefersDark, setSystemPrefersDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  
  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemPrefersDark);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Legacy browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  // Apply theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    const body = document.body;

    // Remove all theme classes
    body.classList.remove('dark-mode');
    root.removeAttribute(THEME_ATTRIBUTE);

    // Apply the current theme
    if (isDark) {
      body.classList.add('dark-mode');
      root.setAttribute(THEME_ATTRIBUTE, 'dark');
    } else {
      root.setAttribute(THEME_ATTRIBUTE, 'light');
    }

    // Save preference (but not if it's system default)
    localStorage.setItem(THEME_STORAGE_KEY, themeMode);
  }, [isDark, themeMode]);

  // Initialize theme on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Set initial system preference
    setSystemPrefersDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
  }, []);

  const toggleTheme = () => {
    setThemeMode(prev => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'system';
      return 'light';
    });
  };

  const handleSetThemeMode = (mode: ThemeMode) => {
    setThemeMode(mode);
  };

  return (
    <ThemeContext.Provider value={{ 
      isDark, 
      themeMode, 
      setThemeMode: handleSetThemeMode, 
      toggleTheme, 
      systemPrefersDark 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
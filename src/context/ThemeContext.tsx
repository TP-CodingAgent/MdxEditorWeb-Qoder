'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  actualTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeContextProvider');
  }
  return context;
};

interface ThemeContextProviderProps {
  children: ReactNode;
}

export const ThemeContextProvider: React.FC<ThemeContextProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('system');
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Load theme preference from localStorage
    const savedMode = localStorage.getItem('theme-mode') as ThemeMode;
    if (savedMode) {
      setMode(savedMode);
    }
  }, []);

  useEffect(() => {
    // Save theme preference to localStorage
    localStorage.setItem('theme-mode', mode);

    // Determine actual theme based on mode
    if (mode === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setActualTheme(systemPrefersDark ? 'dark' : 'light');
    } else {
      setActualTheme(mode);
    }
  }, [mode]);

  useEffect(() => {
    // Listen for system theme changes when in system mode
    if (mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        setActualTheme(e.matches ? 'dark' : 'light');
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [mode]);

  const theme = createTheme({
    palette: {
      mode: actualTheme,
      ...(actualTheme === 'light'
        ? {
            // Light theme colors
            primary: {
              main: '#1976d2',
            },
            secondary: {
              main: '#dc004e',
            },
            background: {
              default: '#ffffff',
              paper: '#f5f5f5',
            },
          }
        : {
            // Dark theme colors
            primary: {
              main: '#90caf9',
            },
            secondary: {
              main: '#f48fb1',
            },
            background: {
              default: '#121212',
              paper: '#1e1e1e',
            },
          }),
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor: actualTheme === 'dark' ? '#6b6b6b #2b2b2b' : '#959595 #f5f5f5',
            '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
              backgroundColor: actualTheme === 'dark' ? '#2b2b2b' : '#f5f5f5',
              width: '8px',
            },
            '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
              borderRadius: 8,
              backgroundColor: actualTheme === 'dark' ? '#6b6b6b' : '#959595',
              minHeight: 24,
            },
            '&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus': {
              backgroundColor: actualTheme === 'dark' ? '#959595' : '#6b6b6b',
            },
            '&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active': {
              backgroundColor: actualTheme === 'dark' ? '#959595' : '#6b6b6b',
            },
            '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
              backgroundColor: actualTheme === 'dark' ? '#959595' : '#6b6b6b',
            },
          },
        },
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
  });

  return (
    <ThemeContext.Provider value={{ mode, setMode, actualTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
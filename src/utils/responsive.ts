import React from 'react';
import { Theme } from '@mui/material/styles';

// Breakpoint values for responsive design
export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
} as const;

// Responsive design utilities
export const responsive = {
  // Mobile-first media queries
  up: (key: keyof typeof breakpoints) => `@media (min-width:${breakpoints[key]}px)`,
  down: (key: keyof typeof breakpoints) => {
    const breakpointValues = Object.values(breakpoints);
    const index = Object.keys(breakpoints).indexOf(key);
    const nextValue = breakpointValues[index + 1];
    return nextValue ? `@media (max-width:${nextValue - 0.05}px)` : '';
  },
  between: (start: keyof typeof breakpoints, end: keyof typeof breakpoints) =>
    `@media (min-width:${breakpoints[start]}px) and (max-width:${breakpoints[end] - 0.05}px)`,
  only: (key: keyof typeof breakpoints) => {
    const breakpointValues = Object.values(breakpoints);
    const index = Object.keys(breakpoints).indexOf(key);
    const nextValue = breakpointValues[index + 1];
    return nextValue
      ? `@media (min-width:${breakpoints[key]}px) and (max-width:${nextValue - 0.05}px)`
      : `@media (min-width:${breakpoints[key]}px)`;
  },
};

// Common responsive styles
export const responsiveStyles = {
  // Container styles
  container: {
    width: '100%',
    paddingLeft: '16px',
    paddingRight: '16px',
    [responsive.up('sm')]: {
      paddingLeft: '24px',
      paddingRight: '24px',
    },
    [responsive.up('lg')]: {
      paddingLeft: '32px',
      paddingRight: '32px',
    },
  },

  // Editor layout styles
  editorLayout: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
  },

  // Toolbar styles
  toolbar: {
    padding: '8px 16px',
    [responsive.up('sm')]: {
      padding: '12px 24px',
    },
  },

  // Split view styles
  splitView: {
    display: 'flex',
    flexDirection: 'column' as const,
    [responsive.up('md')]: {
      flexDirection: 'row' as const,
    },
  },

  // Editor panel styles
  editorPanel: {
    flex: 1,
    minHeight: '300px',
    [responsive.up('md')]: {
      minHeight: 'auto',
    },
  },

  // Preview panel styles
  previewPanel: {
    flex: 1,
    minHeight: '300px',
    [responsive.up('md')]: {
      minHeight: 'auto',
      borderLeft: '1px solid',
      borderColor: 'divider',
    },
  },

  // Mobile drawer styles
  mobileDrawer: {
    width: '280px',
    [responsive.up('sm')]: {
      width: '320px',
    },
  },

  // AI Assistant styles
  aiAssistant: {
    position: 'fixed' as const,
    bottom: '20px',
    right: '20px',
    zIndex: 1000,
    [responsive.up('sm')]: {
      bottom: '32px',
      right: '32px',
    },
  },

  // Dialog styles for mobile
  mobileDialog: {
    margin: '16px',
    width: 'calc(100% - 32px)',
    maxWidth: 'none',
    [responsive.up('sm')]: {
      margin: '32px',
      width: 'calc(100% - 64px)',
      maxWidth: '600px',
    },
  },
};

// Helper function to get responsive values
export const getResponsiveValue = <T>(
  theme: Theme,
  values: Partial<Record<keyof typeof breakpoints, T>>,
  defaultValue: T
): T => {
  const currentBreakpoint = getCurrentBreakpoint();
  return values[currentBreakpoint] || defaultValue;
};

// Helper function to get current breakpoint
export const getCurrentBreakpoint = (): keyof typeof breakpoints => {
  if (typeof window === 'undefined') return 'lg'; // Default for SSR
  
  const width = window.innerWidth;
  
  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  if (width >= breakpoints.sm) return 'sm';
  return 'xs';
};

// Hook for responsive behavior
export const useResponsive = () => {
  const [currentBreakpoint, setCurrentBreakpoint] = React.useState<keyof typeof breakpoints>('lg');
  
  React.useEffect(() => {
    const handleResize = () => {
      setCurrentBreakpoint(getCurrentBreakpoint());
    };
    
    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return {
    currentBreakpoint,
    isMobile: currentBreakpoint === 'xs' || currentBreakpoint === 'sm',
    isTablet: currentBreakpoint === 'md',
    isDesktop: currentBreakpoint === 'lg' || currentBreakpoint === 'xl',
  };
};
'use client';

import React from 'react';
import { Box, useTheme, alpha } from '@mui/material';

interface FooterProps {
  children: React.ReactNode;
  variant?: 'default' | 'minimal' | 'decorative';
}

export const Footer: React.FC<FooterProps> = ({ children, variant = 'default' }) => {
  const theme = useTheme();

  const getFooterStyles = () => {
    switch (variant) {
      case 'minimal':
        return {
          marginTop: 3,
          padding: 2,
          textAlign: 'center' as const,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          color: theme.palette.text.secondary,
          fontSize: '0.875rem',
        };
      case 'decorative':
        return {
          marginTop: 5,
          padding: 4,
          textAlign: 'center' as const,
          borderTop: `3px double ${alpha(theme.palette.primary.main, 0.3)}`,
          color: theme.palette.text.secondary,
          fontStyle: 'italic',
          background: alpha(theme.palette.background.paper, 0.5),
          borderRadius: '8px 8px 0 0',
        };
      default:
        return {
          marginTop: 5,
          padding: 3,
          textAlign: 'center' as const,
          borderTop: `2px solid ${alpha(theme.palette.divider, 0.2)}`,
          color: theme.palette.text.secondary,
          fontStyle: 'italic',
        };
    }
  };

  return (
    <Box
      sx={{
        ...getFooterStyles(),
        '& > *:first-of-type': {
          marginTop: 0,
        },
        '& > *:last-child': {
          marginBottom: 0,
        },
      }}
    >
      {children}
    </Box>
  );
};
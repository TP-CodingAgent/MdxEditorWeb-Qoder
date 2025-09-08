'use client';

import React from 'react';
import { Box } from '@mui/material';

interface ThemeBoxProps {
  children: React.ReactNode;
  gradient?: string;
}

export const ThemeBox: React.FC<ThemeBoxProps> = ({ 
  children, 
  gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
}) => {
  return (
    <Box 
      sx={{
        padding: 3,
        borderRadius: 2,
        margin: '16px 0',
        background: gradient,
        color: 'white',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '50%',
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.2), transparent)',
          pointerEvents: 'none',
        },
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
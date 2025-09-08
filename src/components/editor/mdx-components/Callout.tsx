'use client';

import React from 'react';
import { Box, useTheme, alpha } from '@mui/material';

interface CalloutProps {
  type: 'warning' | 'info' | 'success' | 'error';
  children: React.ReactNode;
}

export const Callout: React.FC<CalloutProps> = ({ type, children }) => {
  const theme = useTheme();

  const getCalloutStyles = () => {
    switch (type) {
      case 'warning':
        return {
          backgroundColor: alpha('#ffc107', 0.1),
          borderColor: '#ffc107',
          textColor: '#856404',
        };
      case 'info':
        return {
          backgroundColor: alpha('#17a2b8', 0.1),
          borderColor: '#17a2b8',
          textColor: '#0c5460',
        };
      case 'success':
        return {
          backgroundColor: alpha('#28a745', 0.1),
          borderColor: '#28a745',
          textColor: '#155724',
        };
      case 'error':
        return {
          backgroundColor: alpha('#dc3545', 0.1),
          borderColor: '#dc3545',
          textColor: '#721c24',
        };
      default:
        return {
          backgroundColor: alpha(theme.palette.primary.main, 0.1),
          borderColor: theme.palette.primary.main,
          textColor: theme.palette.text.primary,
        };
    }
  };

  const styles = getCalloutStyles();

  return (
    <Box
      sx={{
        padding: 2,
        marginBottom: 2,
        borderRadius: 2,
        backgroundColor: styles.backgroundColor,
        borderLeft: `4px solid ${styles.borderColor}`,
        color: styles.textColor,
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
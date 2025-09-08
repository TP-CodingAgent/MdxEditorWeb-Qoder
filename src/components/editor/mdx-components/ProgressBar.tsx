'use client';

import React from 'react';
import { Box, Typography, useTheme, alpha } from '@mui/material';

interface ProgressBarProps {
  progress: number;
  label: string;
  color?: string;
  showPercentage?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  label, 
  color,
  showPercentage = true 
}) => {
  const theme = useTheme();
  const progressColor = color || theme.palette.primary.main;
  
  // Clamp progress between 0 and 100
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <Box sx={{ margin: '20px 0' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '8px' 
      }}>
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 500,
            color: theme.palette.text.primary 
          }}
        >
          {label}
        </Typography>
        {showPercentage && (
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 600,
              color: progressColor,
              fontSize: '0.875rem'
            }}
          >
            {clampedProgress}%
          </Typography>
        )}
      </Box>
      <Box sx={{ 
        width: '100%', 
        height: '20px', 
        backgroundColor: alpha(theme.palette.divider, 0.3), 
        borderRadius: '10px',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: `inset 0 2px 4px ${alpha(theme.palette.common.black, 0.1)}`,
      }}>
        <Box 
          sx={{
            width: `${clampedProgress}%`,
            height: '100%',
            backgroundColor: progressColor,
            borderRadius: '10px',
            transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '50%',
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)',
              borderRadius: '10px 10px 0 0',
            },
          }} 
        />
      </Box>
    </Box>
  );
};
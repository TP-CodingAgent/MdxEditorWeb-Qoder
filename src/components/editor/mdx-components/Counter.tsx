'use client';

import React, { useState } from 'react';
import { Box, Typography, useTheme, alpha } from '@mui/material';

export const Counter: React.FC = () => {
  const [count, setCount] = useState(0);
  const theme = useTheme();

  return (
    <Box 
      sx={{ 
        padding: 3, 
        border: `2px solid ${theme.palette.primary.main}`, 
        borderRadius: 2, 
        margin: '16px 0',
        textAlign: 'center',
        backgroundColor: alpha(theme.palette.primary.main, 0.05),
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.2)}`,
        },
      }}
    >
      <Typography variant="h6" gutterBottom>
        Interactive Counter Component
      </Typography>
      <Typography 
        variant="h4" 
        sx={{ 
          color: theme.palette.primary.main, 
          my: 2,
          fontWeight: 'bold',
          fontSize: '2.5rem',
        }}
      >
        {count}
      </Typography>
      <Box sx={{ 
        gap: 1, 
        display: 'flex', 
        justifyContent: 'center', 
        flexWrap: 'wrap' 
      }}>
        <button 
          onClick={() => setCount(count - 1)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#c82333';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#dc3545';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Decrement
        </button>
        <button 
          onClick={() => setCount(0)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#5a6268';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#6c757d';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Reset
        </button>
        <button 
          onClick={() => setCount(count + 1)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#218838';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#28a745';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Increment
        </button>
      </Box>
    </Box>
  );
};
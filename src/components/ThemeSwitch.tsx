'use client';

import React from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from '@mui/material';
import {
  Brightness4,
  Brightness7,
  SettingsBrightness,
  Check,
} from '@mui/icons-material';
import { useTheme } from '@/context/ThemeContext';

export const ThemeSwitch: React.FC = () => {
  const { mode, setMode, actualTheme } = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleModeSelect = (selectedMode: 'light' | 'dark' | 'system') => {
    setMode(selectedMode);
    handleClose();
  };

  const getIcon = () => {
    if (mode === 'system') {
      return <SettingsBrightness />;
    }
    return actualTheme === 'dark' ? <Brightness4 /> : <Brightness7 />;
  };

  const getTooltip = () => {
    return `Current theme: ${mode} ${mode === 'system' ? `(${actualTheme})` : ''}`;
  };

  return (
    <>
      <Tooltip title={getTooltip()}>
        <IconButton
          onClick={handleClick}
          size="small"
          aria-controls={open ? 'theme-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          {getIcon()}
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        id="theme-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => handleModeSelect('light')}>
          <ListItemIcon>
            <Brightness7 fontSize="small" />
          </ListItemIcon>
          <ListItemText>Light</ListItemText>
          {mode === 'light' && <Check fontSize="small" color="primary" />}
        </MenuItem>
        <MenuItem onClick={() => handleModeSelect('dark')}>
          <ListItemIcon>
            <Brightness4 fontSize="small" />
          </ListItemIcon>
          <ListItemText>Dark</ListItemText>
          {mode === 'dark' && <Check fontSize="small" color="primary" />}
        </MenuItem>
        <MenuItem onClick={() => handleModeSelect('system')}>
          <ListItemIcon>
            <SettingsBrightness fontSize="small" />
          </ListItemIcon>
          <ListItemText>System</ListItemText>
          {mode === 'system' && <Check fontSize="small" color="primary" />}
        </MenuItem>
      </Menu>
    </>
  );
};
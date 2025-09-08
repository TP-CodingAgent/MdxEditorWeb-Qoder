'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  IconButton,
  Button,
  Slide,
  useTheme,
  alpha,
  Alert,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import {
  Close,
  Save,
  Visibility,
  VisibilityOff,
  Key,
  Delete,
  SettingsSuggest,
} from '@mui/icons-material';
import { TransitionProps } from '@mui/material/transitions';

// Custom transition for the dialog
const SlideTransition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface AISettingsProps {
  open: boolean;
  onClose: () => void;
}

interface APIKeys {
  openai: string;
  google: string;
  openrouter: string;
}

const AI_SETTINGS_STORAGE_KEY = 'mdx-editor-ai-settings';

export const AISettings: React.FC<AISettingsProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const [apiKeys, setApiKeys] = useState<APIKeys>({
    openai: '',
    google: '',
    openrouter: '',
  });
  const [showPassword, setShowPassword] = useState({
    openai: false,
    google: false,
    openrouter: false,
  });
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load saved API keys from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem(AI_SETTINGS_STORAGE_KEY);
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setApiKeys(parsed);
      } catch (error) {
        console.error('Failed to parse saved AI settings:', error);
      }
    }
  }, []);

  // Check for changes
  useEffect(() => {
    const savedSettings = localStorage.getItem(AI_SETTINGS_STORAGE_KEY);
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        const hasChanged = 
          parsed.openai !== apiKeys.openai ||
          parsed.google !== apiKeys.google ||
          parsed.openrouter !== apiKeys.openrouter;
        setHasChanges(hasChanged);
      } catch {
        setHasChanges(true);
      }
    } else {
      setHasChanges(
        apiKeys.openai !== '' ||
        apiKeys.google !== '' ||
        apiKeys.openrouter !== ''
      );
    }
  }, [apiKeys]);

  const handleApiKeyChange = (provider: keyof APIKeys, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: value,
    }));
    setSaved(false);
  };

  const handleToggleVisibility = (provider: keyof APIKeys) => {
    setShowPassword(prev => ({
      ...prev,
      [provider]: !prev[provider],
    }));
  };

  const handleSave = () => {
    localStorage.setItem(AI_SETTINGS_STORAGE_KEY, JSON.stringify(apiKeys));
    setSaved(true);
    setHasChanges(false);
    
    // Trigger a custom event to notify other components
    window.dispatchEvent(new CustomEvent('ai-settings-changed', { 
      detail: apiKeys 
    }));
    
    setTimeout(() => setSaved(false), 3000);
  };

  const handleClear = (provider: keyof APIKeys) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: '',
    }));
    setSaved(false);
  };

  const handleClearAll = () => {
    setApiKeys({
      openai: '',
      google: '',
      openrouter: '',
    });
    localStorage.removeItem(AI_SETTINGS_STORAGE_KEY);
    setSaved(false);
    setHasChanges(false);
    
    // Trigger a custom event to notify other components
    window.dispatchEvent(new CustomEvent('ai-settings-changed', { 
      detail: { openai: '', google: '', openrouter: '' }
    }));
  };

  const handleClose = () => {
    onClose();
  };

  const providers = [
    {
      key: 'openai' as keyof APIKeys,
      name: 'OpenAI (GPT-5)',
      description: 'Your OpenAI API key for ChatGPT-5 access',
      placeholder: 'sk-proj-...',
      color: theme.palette.primary.main,
    },
    {
      key: 'google' as keyof APIKeys,
      name: 'Google AI (Gemini 2.5)',
      description: 'Your Google AI API key for Gemini 2.5 Flash access',
      placeholder: 'AIzaSy...',
      color: theme.palette.secondary.main,
    },
    {
      key: 'openrouter' as keyof APIKeys,
      name: 'OpenRouter',
      description: 'Your OpenRouter API key for multiple free AI models',
      placeholder: 'sk-or-v1-...',
      color: theme.palette.info.main,
    },
  ];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      TransitionComponent={SlideTransition}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: `0 24px 80px ${alpha(theme.palette.common.black, 0.15)}`,
          minHeight: '500px',
          maxHeight: '80vh',
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
          color: 'white',
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SettingsSuggest sx={{ fontSize: 28 }} />
          <Box>
            <Typography variant="h6" fontWeight="700">
              AI Settings
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Configure API keys for AI providers
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={handleClose}
          sx={{ color: 'white', '&:hover': { backgroundColor: alpha('#ffffff', 0.1) } }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ p: 3 }}>
        {saved && (
          <Alert 
            severity="success" 
            sx={{ mb: 3 }}
            onClose={() => setSaved(false)}
          >
            API keys saved successfully! They will be used for AI requests.
          </Alert>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
          Configure your API keys here to override environment variables. 
          If a key is provided, it will be used for AI requests. 
          Otherwise, the system will fallback to environment variables.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {providers.map((provider) => (
            <Box key={provider.key}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Key sx={{ fontSize: 20, color: provider.color }} />
                <Typography variant="subtitle1" fontWeight="600">
                  {provider.name}
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {provider.description}
              </Typography>

              <TextField
                fullWidth
                type={showPassword[provider.key] ? 'text' : 'password'}
                value={apiKeys[provider.key]}
                onChange={(e) => handleApiKeyChange(provider.key, e.target.value)}
                placeholder={provider.placeholder}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Key sx={{ color: provider.color, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title={showPassword[provider.key] ? 'Hide' : 'Show'}>
                        <IconButton
                          onClick={() => handleToggleVisibility(provider.key)}
                          edge="end"
                          size="small"
                        >
                          {showPassword[provider.key] ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </Tooltip>
                      {apiKeys[provider.key] && (
                        <Tooltip title="Clear">
                          <IconButton
                            onClick={() => handleClear(provider.key)}
                            edge="end"
                            size="small"
                            sx={{ ml: 1 }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: provider.color,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: provider.color,
                    },
                  },
                }}
              />
            </Box>
          ))}
        </Box>
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button
          onClick={handleClearAll}
          color="error"
          variant="outlined"
          startIcon={<Delete />}
          disabled={!Object.values(apiKeys).some(key => key.trim())}
        >
          Clear All
        </Button>
        
        <Box sx={{ flex: 1 }} />
        
        <Button
          onClick={handleClose}
          color="inherit"
          variant="outlined"
        >
          Cancel
        </Button>
        
        <Button
          onClick={handleSave}
          variant="contained"
          startIcon={<Save />}
          disabled={!hasChanges}
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
            color: 'white',
            '&:hover': {
              background: `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.main} 100%)`,
            },
          }}
        >
          Save Settings
        </Button>
      </DialogActions>
    </Dialog>
  );
};
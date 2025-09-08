'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  useTheme,
  alpha,
  Tooltip,
  Chip,
  Collapse,
  IconButton,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Settings,
  Speed,
  Psychology,
  ExpandMore,
  CheckCircle,
} from '@mui/icons-material';
import { useAI, AI_PROVIDERS } from '@/lib/ai';

interface AIProviderSelectorProps {
  compact?: boolean;
  showDetails?: boolean;
}

export const AIProviderSelector: React.FC<AIProviderSelectorProps> = ({
  compact = false,
  showDetails = true,
}) => {
  const theme = useTheme();
  const { selectedProvider, setSelectedProvider, selectedModel, setSelectedModel, getCurrentProvider, getOpenRouterModels } = useAI();
  const [expanded, setExpanded] = useState(!compact);

  const handleProviderChange = (
    event: React.MouseEvent<HTMLElement>,
    newProvider: 'openai' | 'gemini' | 'openrouter' | null,
  ) => {
    if (newProvider !== null) {
      setSelectedProvider(newProvider);
      // Reset model selection when switching providers
      if (newProvider === 'openrouter' && !selectedModel) {
        setSelectedModel('deepseek/deepseek-chat-v3.1:free');
      }
    }
  };

  const handleModelChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedModel(event.target.value as string);
  };

  const currentProvider = getCurrentProvider();
  const openRouterModels = getOpenRouterModels();

  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="caption" color="text.secondary">
          AI Model:
        </Typography>
        <ToggleButtonGroup
          value={selectedProvider}
          exclusive
          onChange={handleProviderChange}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              px: 1.5,
              py: 0.5,
              fontSize: '0.75rem',
              borderRadius: 1,
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
              },
            },
          }}
        >
          {AI_PROVIDERS.map((provider) => (
            <ToggleButton key={provider.id} value={provider.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <span>{provider.icon}</span>
                <span>
                  {provider.id === 'openai'
                    ? 'GPT-5'
                    : provider.id === 'gemini'
                    ? 'Gemini 2.5'
                    : 'Open Router'}
                </span>
              </Box>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)'
          : 'linear-gradient(135deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.01) 100%)',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderRadius: 2,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: expanded ? 2 : 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Settings sx={{ fontSize: 20, color: theme.palette.text.secondary }} />
          <Typography variant="subtitle2" fontWeight="600">
            AI Provider
          </Typography>
          {currentProvider && (
            <Chip
              label={currentProvider.name}
              size="small"
              sx={{
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                fontSize: '0.7rem',
                height: 20,
              }}
            />
          )}
        </Box>
        
        {compact !== false && (
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
            sx={{
              transform: expanded ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.3s ease',
            }}
          >
            <ExpandMore fontSize="small" />
          </IconButton>
        )}
      </Box>

      <Collapse in={expanded}>
        {/* Provider Selection */}
        <ToggleButtonGroup
          value={selectedProvider}
          exclusive
          onChange={handleProviderChange}
          orientation="vertical"
          fullWidth
          sx={{
            mb: showDetails ? 2 : 0,
            '& .MuiToggleButton-root': {
              justifyContent: 'flex-start',
              p: 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              borderRadius: 1.5,
              mb: 1,
              '&:last-child': {
                mb: 0,
              },
              '&.Mui-selected': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                border: `1px solid ${theme.palette.primary.main}`,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.15),
                },
              },
              '&:hover': {
                backgroundColor: alpha(theme.palette.action.hover, 0.05),
              },
              transition: 'all 0.3s ease',
            },
          }}
        >
          {AI_PROVIDERS.map((provider) => (
            <ToggleButton
              key={provider.id}
              value={provider.id}
              sx={{ textAlign: 'left' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <Box
                  sx={{
                    fontSize: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    background: selectedProvider === provider.id
                      ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                      : alpha(theme.palette.background.default, 0.5),
                    color: selectedProvider === provider.id ? 'white' : 'inherit',
                  }}
                >
                  {provider.icon}
                </Box>
                
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2" fontWeight="600">
                      {provider.name}
                    </Typography>
                    {selectedProvider === provider.id && (
                      <CheckCircle
                        sx={{
                          fontSize: 16,
                          color: theme.palette.primary.main,
                        }}
                      />
                    )}
                  </Box>
                  
                  {showDetails && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mt: 0.5, lineHeight: 1.3 }}
                    >
                      {provider.description}
                    </Typography>
                  )}
                </Box>
              </Box>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        {/* Features Comparison */}
        {showDetails && (
          <>
            <Divider sx={{ mb: 2 }} />
            
            {/* OpenRouter Model Selection */}
            {selectedProvider === 'openrouter' && (
              <Box sx={{ mb: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>OpenRouter Model</InputLabel>
                  <Select
                    value={selectedModel || ''}
                    onChange={handleModelChange}
                    label="OpenRouter Model"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1.5,
                      },
                    }}
                  >
                    {openRouterModels.map((model) => (
                      <MenuItem key={model.id} value={model.id}>
                        <Box>
                          <Typography variant="body2" fontWeight="600">
                            {model.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {model.description}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-around' }}>
              <Tooltip title="Response Speed">
                <Box sx={{ textAlign: 'center' }}>
                  <Speed sx={{ fontSize: 20, color: theme.palette.info.main, mb: 0.5 }} />
                  <Typography variant="caption" color="text.secondary" display="block">
                    Speed
                  </Typography>
                  <Typography variant="caption" fontWeight="600">
                    {selectedProvider === 'gemini'
                      ? 'Very Fast'
                      : selectedProvider === 'openrouter'
                      ? 'Fast'
                      : 'Fast'}
                  </Typography>
                </Box>
              </Tooltip>
              
              <Tooltip title="Response Quality">
                <Box sx={{ textAlign: 'center' }}>
                  <Psychology sx={{ fontSize: 20, color: theme.palette.success.main, mb: 0.5 }} />
                  <Typography variant="caption" color="text.secondary" display="block">
                    Quality
                  </Typography>
                  <Typography variant="caption" fontWeight="600">
                    {selectedProvider === 'openai'
                      ? 'Excellent'
                      : selectedProvider === 'openrouter'
                      ? 'Very Good'
                      : 'Very Good'}
                  </Typography>
                </Box>
              </Tooltip>
            </Box>
          </>
        )}
      </Collapse>
    </Paper>
  );
};
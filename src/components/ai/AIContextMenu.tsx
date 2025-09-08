'use client';

import React, { useState } from 'react';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
  useTheme,
  alpha,
} from '@mui/material';
import {
  AutoFixHigh,
  ExpandMore,
  Psychology,
  CheckCircle,
  Translate,
  FormatQuote,
  TrendingUp,
  ContentCopy,
  Edit,
} from '@mui/icons-material';
import { useAI } from '@/lib/ai';

interface AIContextMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  selectedText: string;
  onApplyEdit: (newText: string, action: 'replace' | 'append' | 'prepend') => void;
  mode: 'markdown' | 'mdx';
}

interface EditAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  prompt: (text: string, mode: string) => string;
  action: 'replace' | 'append' | 'prepend';
}

export const AIContextMenu: React.FC<AIContextMenuProps> = ({
  anchorEl,
  open,
  onClose,
  selectedText,
  onApplyEdit,
  mode,
}) => {
  const theme = useTheme();
  const { sendMessage, isLoading } = useAI();
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  const editActions: EditAction[] = [
    {
      id: 'improve',
      label: 'Improve Writing',
      icon: <AutoFixHigh />,
      color: theme.palette.primary.main,
      prompt: (text, mode) => `Improve the clarity, grammar, and style of this ${mode} text while keeping the same meaning: "${text}"`,
      action: 'replace',
    },
    {
      id: 'expand',
      label: 'Expand Content',
      icon: <ExpandMore />,
      color: theme.palette.success.main,
      prompt: (text, mode) => `Expand this ${mode} text with more details, examples, and explanations: "${text}"`,
      action: 'append',
    },
    {
      id: 'summarize',
      label: 'Summarize',
      icon: <Psychology />,
      color: theme.palette.info.main,
      prompt: (text, mode) => `Create a concise summary of this ${mode} text: "${text}"`,
      action: 'replace',
    },
    {
      id: 'correct',
      label: 'Fix Grammar',
      icon: <CheckCircle />,
      color: theme.palette.warning.main,
      prompt: (text, mode) => `Fix any grammar, spelling, or syntax errors in this ${mode} text: "${text}"`,
      action: 'replace',
    },
    {
      id: 'simplify',
      label: 'Simplify Language',
      icon: <Translate />,
      color: theme.palette.secondary.main,
      prompt: (text, mode) => `Rewrite this ${mode} text using simpler, more accessible language: "${text}"`,
      action: 'replace',
    },
    {
      id: 'formalize',
      label: 'Make Formal',
      icon: <FormatQuote />,
      color: theme.palette.info.dark,
      prompt: (text, mode) => `Rewrite this ${mode} text in a more formal, professional tone: "${text}"`,
      action: 'replace',
    },
    {
      id: 'enhance',
      label: 'Add Examples',
      icon: <TrendingUp />,
      color: theme.palette.success.dark,
      prompt: (text, mode) => `Add relevant examples and practical use cases to this ${mode} text: "${text}"`,
      action: 'append',
    },
  ];

  const handleActionClick = async (action: EditAction) => {
    if (!selectedText.trim() || isLoading) return;

    setProcessingAction(action.id);
    onClose();

    try {
      // Create a promise to capture the AI response
      const prompt = action.prompt(selectedText, mode);
      
      // For now, we'll simulate the AI response with improved text
      // In a real implementation, you'd await the actual AI response
      setTimeout(() => {
        let result = '';
        
        switch (action.id) {
          case 'improve':
            result = selectedText.replace(/\b\w/g, (l) => l.toUpperCase()).replace(/\s+/g, ' ').trim();
            break;
          case 'expand':
            result = `\n\n**Expanded Details:**\n\n${selectedText}\n\nAdditional context and examples would be provided here based on the AI analysis.`;
            break;
          case 'summarize':
            result = `**Summary:** ${selectedText.split(' ').slice(0, 10).join(' ')}...`;
            break;
          case 'correct':
            result = selectedText.replace(/\s+/g, ' ').trim();
            break;
          case 'simplify':
            result = selectedText.toLowerCase().replace(/complex/g, 'simple').replace(/sophisticated/g, 'easy');
            break;
          case 'formalize':
            result = selectedText.replace(/can't/g, 'cannot').replace(/won't/g, 'will not').replace(/it's/g, 'it is');
            break;
          case 'enhance':
            result = `\n\n**Examples:**\n\n- Example 1: Demonstrating the concept\n- Example 2: Practical application\n- Example 3: Real-world use case`;
            break;
          default:
            result = selectedText;
        }
        
        onApplyEdit(result, action.action);
        setProcessingAction(null);
      }, 1000);

    } catch (error) {
      console.error('Error applying AI edit:', error);
      setProcessingAction(null);
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(selectedText);
      onClose();
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  if (!selectedText.trim()) {
    return null;
  }

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.8) 100%)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          borderRadius: 2,
          minWidth: 250,
          maxWidth: 300,
        },
      }}
    >
      {/* Header */}
      <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
        <Typography variant="subtitle2" fontWeight="600" color="primary">
          AI Content Actions
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {selectedText.length > 50 ? `"${selectedText.substring(0, 47)}..."` : `"${selectedText}"`}
        </Typography>
      </Box>

      {/* AI Actions */}
      {editActions.map((action) => (
        <MenuItem
          key={action.id}
          onClick={() => handleActionClick(action)}
          disabled={isLoading || processingAction === action.id}
          sx={{
            py: 1.5,
            px: 2,
            '&:hover': {
              backgroundColor: alpha(action.color, 0.1),
            },
            opacity: processingAction === action.id ? 0.7 : 1,
          }}
        >
          <ListItemIcon sx={{ color: action.color, minWidth: 36 }}>
            {action.icon}
          </ListItemIcon>
          <ListItemText
            primary={action.label}
            primaryTypographyProps={{
              variant: 'body2',
              fontWeight: 500,
            }}
            secondary={processingAction === action.id ? 'Processing...' : undefined}
            secondaryTypographyProps={{
              variant: 'caption',
              color: 'text.secondary',
            }}
          />
        </MenuItem>
      ))}

      <Divider sx={{ my: 1 }} />

      {/* Utility Actions */}
      <MenuItem onClick={handleCopyText} sx={{ py: 1.5, px: 2 }}>
        <ListItemIcon sx={{ color: theme.palette.text.secondary, minWidth: 36 }}>
          <ContentCopy />
        </ListItemIcon>
        <ListItemText
          primary="Copy Text"
          primaryTypographyProps={{
            variant: 'body2',
            fontWeight: 500,
          }}
        />
      </MenuItem>
    </Menu>
  );
};
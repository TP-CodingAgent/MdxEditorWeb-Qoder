'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  CircularProgress,
  Alert,
  Fade,
  Slide,
  useTheme,
  alpha,
  Paper,
  Chip,
  Divider,
  Tooltip,
  Avatar,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import {
  Close,
  Send,
  SmartToy,
  Person,
  AutoFixHigh,
  ExpandMore,
  ContentCopy,
  CheckCircle,
  Psychology,
  CleaningServices,
  SettingsSuggest,
} from '@mui/icons-material';
import { TransitionProps } from '@mui/material/transitions';
import { useAI, ChatMessage } from '@/lib/ai';
import { AIProviderSelector } from './AIProviderSelector';
import { AISettings } from './AISettings';

interface AIAssistantProps {
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
  content: string;
  onContentUpdate: (content: string) => void;
  mode: 'markdown' | 'mdx';
}

// Custom transition for the dialog
const SlideTransition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface MessageBubbleProps {
  message: ChatMessage;
  isLatest: boolean;
  onCopyContent: (content: string) => void;
  onInsertContent: (content: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isLatest, 
  onCopyContent, 
  onInsertContent 
}) => {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      onCopyContent(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const handleInsert = () => {
    onInsertContent(message.content);
  };

  return (
    <Fade in timeout={600}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: isUser ? 'row-reverse' : 'row',
          alignItems: 'flex-start',
          gap: 2,
          mb: 3,
          animation: isLatest ? 'slideInFromBottom 0.5s ease-out' : 'none',
          '@keyframes slideInFromBottom': {
            '0%': {
              transform: 'translateY(20px)',
              opacity: 0,
            },
            '100%': {
              transform: 'translateY(0)',
              opacity: 1,
            },
          },
        }}
      >
        {/* Avatar */}
        <Avatar
          sx={{
            bgcolor: isUser 
              ? theme.palette.primary.main 
              : theme.palette.secondary.main,
            color: 'white',
            width: 40,
            height: 40,
            fontSize: '1.2rem',
            boxShadow: `0 4px 20px ${alpha(
              isUser ? theme.palette.primary.main : theme.palette.secondary.main, 
              0.3
            )}`,
          }}
        >
          {isUser ? <Person /> : <SmartToy />}
        </Avatar>

        {/* Message Content */}
        <Paper
          elevation={0}
          sx={{
            maxWidth: '75%',
            p: 2.5,
            position: 'relative',
            background: isUser
              ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.8)} 100%)`
              : theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
                : 'linear-gradient(135deg, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0.01) 100%)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderRadius: isUser ? '20px 20px 8px 20px' : '20px 20px 20px 8px',
            color: isUser ? 'white' : theme.palette.text.primary,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 8px 40px ${alpha(
                isUser ? theme.palette.primary.main : theme.palette.divider, 
                0.2
              )}`,
            },
          }}
        >
          <Typography
            variant="body1"
            sx={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              lineHeight: 1.6,
              fontSize: '0.95rem',
            }}
          >
            {message.content}
          </Typography>

          {/* Action buttons for AI messages */}
          {!isUser && (
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                mt: 2,
                pt: 2,
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
                <IconButton
                  size="small"
                  onClick={handleCopy}
                  sx={{
                    color: copied ? theme.palette.success.main : theme.palette.text.secondary,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.action.hover, 0.1),
                    },
                  }}
                >
                  {copied ? <CheckCircle fontSize="small" /> : <ContentCopy fontSize="small" />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Insert into editor">
                <IconButton
                  size="small"
                  onClick={handleInsert}
                  sx={{
                    color: theme.palette.text.secondary,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.action.hover, 0.1),
                      color: theme.palette.primary.main,
                    },
                  }}
                >
                  <AutoFixHigh fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Paper>
      </Box>
    </Fade>
  );
};

export const AIAssistant: React.FC<AIAssistantProps> = ({
  open,
  onClose,
  content,
  onContentUpdate,
  mode,
}) => {
  const theme = useTheme();
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    clearError,
    selectedProvider,
    selectedModel,
    setSelectedModel,
    getCurrentProvider,
    getOpenRouterModels,
  } = useAI();

  const [inputValue, setInputValue] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // OpenRouter model selection handler
  const handleModelChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedModel(event.target.value as string);
  };

  const openRouterModels = getOpenRouterModels();

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && open) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  // Focus input when dialog opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const messageContent = inputValue.trim();
    setInputValue('');
    clearError();

    try {
      await sendMessage(messageContent, mode);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [inputValue, isLoading, sendMessage, mode, clearError]);

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = async (action: string) => {
    if (!content.trim()) {
      await sendMessage(`Please help me ${action} content for ${mode} editing.`, mode);
      return;
    }

    let prompt = '';
    switch (action) {
      case 'improve':
        prompt = `Please improve the following ${mode} content by enhancing clarity, structure, and readability:\n\n${content}`;
        break;
      case 'expand':
        prompt = `Please expand the following ${mode} content with more details, examples, and explanations:\n\n${content}`;
        break;
      case 'summarize':
        prompt = `Please create a concise summary of the following ${mode} content:\n\n${content}`;
        break;
      case 'correct':
        prompt = `Please fix any grammar, spelling, or syntax errors in the following ${mode} content:\n\n${content}`;
        break;
      default:
        prompt = inputValue;
    }

    setInputValue('');
    clearError();
    
    try {
      await sendMessage(prompt, mode);
    } catch (error) {
      console.error('Failed to send quick action:', error);
    }
  };

  const handleCopyContent = useCallback((_content: string) => {
    // Copy functionality handled in MessageBubble
  }, []);;

  const extractMarkdownCodeBlocks = useCallback((text: string): string => {
    // Regular expression to match markdown/MDX code blocks
    // const codeBlockRegex = /```(?:mdx|markdown|md)\n([\s\S]*?)```/gi;
    const codeBlockRegex = /```(?:mdx|markdown|md)\n([\s\S]*?)(```([\s]{0,1})$)/gi;
    const matches = [];
    let match;
    
    while ((match = codeBlockRegex.exec(text)) !== null) {
      matches.push(match[1].trim());
    }
    
    if (matches.length > 0) {
      // Join multiple code blocks with double newlines
      return matches.join('\n\n');
    }
    
    // If no markdown/MDX code blocks found, return the original text
    return text;
  }, []);

  const handleInsertContent = useCallback((aiContent: string) => {
    // Extract only markdown/MDX code blocks from the AI response
    const extractedContent = extractMarkdownCodeBlocks(aiContent);
    
    // Try to insert at cursor position in Monaco Editor first
    const monacoEditor = (window as Record<string, unknown>).monacoEditorInstance;
    if (monacoEditor) {
      const position = monacoEditor.getPosition();
      const selection = monacoEditor.getSelection();
      
      if (selection && !selection.isEmpty()) {
        // Replace selected text with extracted content
        monacoEditor.executeEdits('ai-assistant', [{
          range: selection,
          text: extractedContent,
          forceMoveMarkers: true
        }]);
      } else {
        // Insert at cursor position
        monacoEditor.executeEdits('ai-assistant', [{
          range: {
            startLineNumber: position.lineNumber,
            startColumn: position.column,
            endLineNumber: position.lineNumber,
            endColumn: position.column
          },
          text: extractedContent,
          forceMoveMarkers: true
        }]);
      }
      monacoEditor.focus();
    } else {
      // Fallback: append extracted content to existing content if Monaco Editor not available
      const newContent = content + (content.endsWith('\n') ? '' : '\n\n') + extractedContent;
      onContentUpdate(newContent);
    }
  }, [content, onContentUpdate, extractMarkdownCodeBlocks]);

  const currentProvider = getCurrentProvider();

  const quickActions = [
    { id: 'improve', label: 'Improve', icon: <AutoFixHigh />, color: theme.palette.primary.main },
    { id: 'expand', label: 'Expand', icon: <ExpandMore />, color: theme.palette.secondary.main },
    { id: 'summarize', label: 'Summarize', icon: <Psychology />, color: theme.palette.info.main },
    { id: 'correct', label: 'Correct', icon: <CheckCircle />, color: theme.palette.success.main },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={SlideTransition}
      maxWidth="md"
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
          minHeight: '700px',
          maxHeight: '90vh',
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: 'white',
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SmartToy sx={{ fontSize: 28 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight="700">
              AI Assistant
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {currentProvider?.name} • {mode.toUpperCase()} Mode
            </Typography>
          </Box>
          
          {/* AI Provider Selector */}
          <Box sx={{ 
            minWidth: 200,
            '& .MuiPaper-root': {
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            },
            '& .MuiToggleButton-root': {
              color: 'rgba(255, 255, 255, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              '&.Mui-selected': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                },
              },
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            },
            '& .MuiChip-root': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
            },
            '& .MuiTypography-root': {
              color: 'rgba(255, 255, 255, 0.9)',
            },
            '& .MuiSvgIcon-root': {
              color: 'rgba(255, 255, 255, 0.8)',
            },
          }}>
            <AIProviderSelector compact showDetails={false} />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="AI settings">
            <IconButton
              onClick={() => setShowSettings(true)}
              sx={{ color: 'white', '&:hover': { backgroundColor: alpha('#ffffff', 0.1) } }}
            >
              <SettingsSuggest />
            </IconButton>
          </Tooltip>
          <Tooltip title="Clear conversation">
            <IconButton
              onClick={clearMessages}
              sx={{ color: 'white', '&:hover': { backgroundColor: alpha('#ffffff', 0.1) } }}
            >
              <CleaningServices />
            </IconButton>
          </Tooltip>
          <Tooltip title="Close">
            <IconButton
              onClick={onClose}
              sx={{ color: 'white', '&:hover': { backgroundColor: alpha('#ffffff', 0.1) } }}
            >
              <Close />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>

      {/* Content */}
      <DialogContent
        sx={{
          p: 0,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Error Display */}
        {error && (
          <Alert
            severity="error"
            sx={{ m: 2 }}
            action={
              <IconButton size="small" onClick={clearError}>
                <Close fontSize="small" />
              </IconButton>
            }
          >
            {error}
          </Alert>
        )}

        {/* Quick Actions and Model Selection Row */}
        <Box sx={{ p: 2, pb: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, mb: 2, flexWrap: 'wrap' }}>
            {/* Quick Actions Section */}
            <Box sx={{ flex: 1, minWidth: '300px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Quick Actions:
                </Typography>
                <Button
                  size="small"
                  variant="text"
                  onClick={() => setShowQuickActions(!showQuickActions)}
                  endIcon={<ExpandMore sx={{ transform: showQuickActions ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />}
                  sx={{ minWidth: 'auto', px: 1 }}
                >
                  {showQuickActions ? 'Hide' : 'Show'}
                </Button>
              </Box>
              
              <Fade in={showQuickActions}>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {quickActions.map((action) => (
                    <Chip
                      key={action.id}
                      label={action.label}
                      icon={action.icon}
                      onClick={() => handleQuickAction(action.id)}
                      disabled={isLoading}
                      size="small"
                      sx={{
                        color: action.color,
                        borderColor: action.color,
                        fontSize: '0.75rem',
                        height: 28,
                        '&:hover': {
                          backgroundColor: alpha(action.color, 0.1),
                          transform: 'translateY(-1px)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Fade>
            </Box>

            {/* OpenRouter Model Selection */}
            {selectedProvider === 'openrouter' && (
              <Box sx={{ flex: '1', minWidth: '250px' }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
                  OpenRouter Model:
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={selectedModel || ''}
                    onChange={handleModelChange}
                    displayEmpty
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1.5,
                        backgroundColor: alpha(theme.palette.background.paper, 0.8),
                        backdropFilter: 'blur(10px)',
                        fontSize: '0.875rem',
                      },
                    }}
                  >
                    {openRouterModels.map((model) => (
                      <MenuItem key={model.id} value={model.id}>
                        <Box>
                          <Typography variant="body2" fontWeight="600" sx={{ fontSize: '0.8rem' }}>
                            {model.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                            {model.description}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}
          </Box>

          <Divider sx={{ mb: 2 }} />
        </Box>

        {/* Messages */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            px: 2,
            pb: 2,
            minHeight: '400px',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: alpha(theme.palette.divider, 0.1),
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: alpha(theme.palette.primary.main, 0.3),
              borderRadius: '10px',
              '&:hover': {
                background: alpha(theme.palette.primary.main, 0.5),
              },
            },
          }}
        >
          {messages.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                textAlign: 'center',
                py: 4,
              }}
            >
              <SmartToy
                sx={{
                  fontSize: 64,
                  color: alpha(theme.palette.primary.main, 0.3),
                  mb: 2,
                }}
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Welcome to AI Assistant
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
                I&apos;m here to help you with your {mode} content. Ask me anything about writing, editing, or improving your content!
              </Typography>
            </Box>
          ) : (
            <>
              {messages.map((message, index) => (
                <MessageBubble
                  key={`${message.timestamp}-${index}`}
                  message={message}
                  isLatest={index === messages.length - 1}
                  onCopyContent={handleCopyContent}
                  onInsertContent={handleInsertContent}
                />
              ))}
              
              {/* Loading indicator */}
              {isLoading && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: theme.palette.secondary.main,
                      color: 'white',
                      width: 40,
                      height: 40,
                    }}
                  >
                    <SmartToy />
                  </Avatar>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      background: theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
                        : 'linear-gradient(135deg, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0.01) 100%)',
                      backdropFilter: 'blur(20px)',
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      borderRadius: '20px 20px 20px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <CircularProgress size={20} />
                    <Typography variant="body2" color="text.secondary">
                      {currentProvider?.name} is thinking...
                    </Typography>
                  </Paper>
                </Box>
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </Box>
      </DialogContent>

      {/* Input Area */}
      <DialogActions
        sx={{
          p: 3,
          pt: 2,
          background: alpha(theme.palette.background.default, 0.5),
          backdropFilter: 'blur(10px)',
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, width: '100%', alignItems: 'flex-end' }}>
          <TextField
            ref={inputRef}
            fullWidth
            multiline
            maxRows={4}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Ask me anything about your ${mode} content...`}
            disabled={isLoading}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                background: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: 'blur(10px)',
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.primary.main,
                },
              },
            }}
          />
          <IconButton
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: 'white',
              p: 1.5,
              '&:hover': {
                bgcolor: theme.palette.primary.dark,
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
              },
              '&:disabled': {
                bgcolor: alpha(theme.palette.action.disabled, 0.1),
                color: theme.palette.action.disabled,
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : <Send />}
          </IconButton>
        </Box>
      </DialogActions>

      {/* AI Settings Dialog */}
      <AISettings
        open={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </Dialog>
  );
};
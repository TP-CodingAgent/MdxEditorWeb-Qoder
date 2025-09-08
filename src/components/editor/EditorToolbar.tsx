'use client';

import React, { useRef } from 'react';
import {
  Box,
  Toolbar,
  Typography,
  IconButton,
  Divider,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  alpha,
  Tooltip,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  Code,
  Link,
  Image,
  ViewSidebar,
  Edit,
  AutoAwesome,
  SmartToy,
  Title,
  FormatQuote,
  TableChart,
  CheckBox,
  HorizontalRule,
  Extension,
  ExpandMore,
  Visibility,
} from '@mui/icons-material';

interface EditorToolbarProps {
  mode: 'markdown' | 'mdx';
  editorMode: 'split' | 'rich' | 'view';
  onEditorModeChange: (mode: 'split' | 'rich' | 'view') => void;
  onContentUpdate: (content: string) => void;
  content: string;
  onOpenAIAssistant?: () => void;
}

// Utility function to insert text at cursor position
const insertTextAtCursor = (textarea: HTMLTextAreaElement, textToInsert: string, selectionStart?: number, selectionEnd?: number) => {
  const start = selectionStart ?? textarea.selectionStart;
  const end = selectionEnd ?? textarea.selectionEnd;
  const before = textarea.value.substring(0, start);
  const after = textarea.value.substring(end);
  const newValue = before + textToInsert + after;
  
  return {
    newValue,
    newCursorPos: start + textToInsert.length
  };
};

// Function to wrap selected text with markdown syntax
const wrapSelection = (textarea: HTMLTextAreaElement, prefix: string, suffix: string = '') => {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = textarea.value.substring(start, end);
  const wrapSuffix = suffix || prefix;
  
  if (selectedText) {
    // Wrap the selected text
    const wrappedText = prefix + selectedText + wrapSuffix;
    return insertTextAtCursor(textarea, wrappedText, start, end);
  } else {
    // Insert the markers and place cursor in between
    const textToInsert = prefix + wrapSuffix;
    const result = insertTextAtCursor(textarea, textToInsert);
    return {
      ...result,
      newCursorPos: start + prefix.length
    };
  }
};

// Function to insert at line start
const insertAtLineStart = (textarea: HTMLTextAreaElement, prefix: string) => {
  const start = textarea.selectionStart;
  const before = textarea.value.substring(0, start);
  const after = textarea.value.substring(start);
  
  // Find the start of the current line
  const lineStart = before.lastIndexOf('\n') + 1;
  const linePrefix = before.substring(lineStart);
  
  // Check if the line already has the prefix
  if (linePrefix.startsWith(prefix)) {
    // Remove the prefix
    const newBefore = before.substring(0, lineStart) + linePrefix.substring(prefix.length);
    const newValue = newBefore + after;
    return {
      newValue,
      newCursorPos: start - prefix.length
    };
  } else {
    // Add the prefix
    const newBefore = before.substring(0, lineStart) + prefix + linePrefix;
    const newValue = newBefore + after;
    return {
      newValue,
      newCursorPos: start + prefix.length
    };
  }
};

// Function to interact with Monaco Editor
const getMonacoEditor = () => {
  // Try to get Monaco editor instance from global window object
  const monacoContainer = document.querySelector('.monaco-editor');
  if (monacoContainer) {
    // Check if Monaco editor instance is available
    const editorInstance = (window as Record<string, unknown>).monacoEditorInstance;
    if (editorInstance) {
      return editorInstance;
    }
  }
  return null;
};

// Function to insert text in Monaco Editor
const insertTextInMonaco = (text: string, replaceSelection: boolean = false) => {
  const editor = getMonacoEditor();
  if (editor) {
    const selection = editor.getSelection();
    const position = editor.getPosition();
    
    if (replaceSelection && selection && !selection.isEmpty()) {
      // Replace selected text
      editor.executeEdits('toolbar', [{
        range: selection,
        text: text,
        forceMoveMarkers: true
      }]);
    } else {
      // Insert at cursor position
      editor.executeEdits('toolbar', [{
        range: {
          startLineNumber: position.lineNumber,
          startColumn: position.column,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        },
        text: text,
        forceMoveMarkers: true
      }]);
    }
    
    editor.focus();
    return true;
  }
  return false;
};

// Function to wrap selected text in Monaco Editor
const wrapTextInMonaco = (prefix: string, suffix: string = '') => {
  const editor = getMonacoEditor();
  if (editor) {
    const selection = editor.getSelection();
    const model = editor.getModel();
    
    if (selection && model) {
      const selectedText = model.getValueInRange(selection);
      const wrapSuffix = suffix || prefix;
      
      if (selectedText) {
        // Wrap the selected text
        const wrappedText = prefix + selectedText + wrapSuffix;
        editor.executeEdits('toolbar', [{
          range: selection,
          text: wrappedText,
          forceMoveMarkers: true
        }]);
      } else {
        // Insert the markers and place cursor in between
        const insertText = prefix + wrapSuffix;
        editor.executeEdits('toolbar', [{
          range: selection,
          text: insertText,
          forceMoveMarkers: true
        }]);
        
        // Move cursor to between the markers
        const newPosition = {
          lineNumber: selection.startLineNumber,
          column: selection.startColumn + prefix.length
        };
        editor.setPosition(newPosition);
      }
      
      editor.focus();
      return true;
    }
  }
  return false;
};

// Function to insert at line start in Monaco Editor
const insertAtLineStartInMonaco = (prefix: string) => {
  const editor = getMonacoEditor();
  if (editor) {
    const position = editor.getPosition();
    const model = editor.getModel();
    
    if (position && model) {
      const lineContent = model.getLineContent(position.lineNumber);
      const lineStartRange = {
        startLineNumber: position.lineNumber,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: lineContent.length + 1
      };
      
      if (lineContent.startsWith(prefix)) {
        // Remove the prefix
        const newContent = lineContent.substring(prefix.length);
        editor.executeEdits('toolbar', [{
          range: lineStartRange,
          text: newContent,
          forceMoveMarkers: true
        }]);
      } else {
        // Add the prefix
        const newContent = prefix + lineContent;
        editor.executeEdits('toolbar', [{
          range: lineStartRange,
          text: newContent,
          forceMoveMarkers: true
        }]);
      }
      
      editor.focus();
      return true;
    }
  }
  return false;
};

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  mode,
  editorMode,
  onEditorModeChange,
  onContentUpdate,
  content,
  onOpenAIAssistant,
}) => {
  const theme = useTheme();
  const [headerMenuAnchor, setHeaderMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [mdxMenuAnchor, setMdxMenuAnchor] = React.useState<null | HTMLElement>(null);

  // Calculate word count for display
  const wordCount = content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .split(/\s+/)
    .filter(word => word.length > 0).length;

  const characterCount = content.length;

  // Formatting action handlers
  const handleBold = () => {
    if (!wrapTextInMonaco('**')) {
      // Fallback: append to content
      const newContent = content + (content.endsWith('\n') ? '' : ' ') + '**bold text**';
      onContentUpdate(newContent);
    }
  };

  const handleItalic = () => {
    if (!wrapTextInMonaco('*')) {
      const newContent = content + (content.endsWith('\n') ? '' : ' ') + '*italic text*';
      onContentUpdate(newContent);
    }
  };

  const handleInlineCode = () => {
    if (!wrapTextInMonaco('`')) {
      const newContent = content + (content.endsWith('\n') ? '' : ' ') + '`code`';
      onContentUpdate(newContent);
    }
  };

  const handleLink = () => {
    const linkText = '[link text](https://example.com)';
    if (!insertTextInMonaco(linkText)) {
      const newContent = content + (content.endsWith('\n') ? '' : ' ') + linkText;
      onContentUpdate(newContent);
    }
  };

  const handleImage = () => {
    const imageText = '![alt text](https://example.com/image.jpg)';
    if (!insertTextInMonaco(imageText)) {
      const newContent = content + (content.endsWith('\n') ? '' : ' ') + imageText;
      onContentUpdate(newContent);
    }
  };

  const handleBulletList = () => {
    if (!insertAtLineStartInMonaco('- ')) {
      const newContent = content + (content.endsWith('\n') ? '' : '\n') + '- List item';
      onContentUpdate(newContent);
    }
  };

  const handleNumberedList = () => {
    if (!insertAtLineStartInMonaco('1. ')) {
      const newContent = content + (content.endsWith('\n') ? '' : '\n') + '1. List item';
      onContentUpdate(newContent);
    }
  };

  const handleHeader = (level: number) => {
    const headerPrefix = '#'.repeat(level) + ' ';
    if (!insertAtLineStartInMonaco(headerPrefix)) {
      const newContent = content + (content.endsWith('\n') ? '' : '\n') + headerPrefix + 'Header';
      onContentUpdate(newContent);
    }
    setHeaderMenuAnchor(null);
  };

  const handleBlockquote = () => {
    if (!insertAtLineStartInMonaco('> ')) {
      const newContent = content + (content.endsWith('\n') ? '' : '\n') + '> Quote';
      onContentUpdate(newContent);
    }
  };

  const handleTable = () => {
    const tableText = '\n| Header 1 | Header 2 | Header 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n';
    if (!insertTextInMonaco(tableText)) {
      const newContent = content + tableText;
      onContentUpdate(newContent);
    }
  };

  const handleTaskList = () => {
    if (!insertAtLineStartInMonaco('- [ ] ')) {
      const newContent = content + (content.endsWith('\n') ? '' : '\n') + '- [ ] Task item';
      onContentUpdate(newContent);
    }
  };

  const handleHorizontalRule = () => {
    const hrText = '\n---\n';
    if (!insertTextInMonaco(hrText)) {
      const newContent = content + hrText;
      onContentUpdate(newContent);
    }
  };

  // MDX Component handlers
  const handleMDXComponent = (componentText: string) => {
    const textWithNewlines = '\n' + componentText + '\n';
    if (!insertTextInMonaco(textWithNewlines)) {
      const newContent = content + (content.endsWith('\n') ? '' : '\n') + componentText;
      onContentUpdate(newContent);
    }
    setMdxMenuAnchor(null);
  };

  const formatActions = [
    { icon: <FormatBold />, label: 'Bold (Ctrl+B)', action: handleBold, shortcut: 'Ctrl+B' },
    { icon: <FormatItalic />, label: 'Italic (Ctrl+I)', action: handleItalic, shortcut: 'Ctrl+I' },
    { icon: <Code />, label: 'Inline Code', action: handleInlineCode },
    { icon: <Link />, label: 'Insert Link', action: handleLink },
    { icon: <Image />, label: 'Insert Image', action: handleImage },
    { icon: <FormatListBulleted />, label: 'Bullet List', action: handleBulletList },
    { icon: <FormatListNumbered />, label: 'Numbered List', action: handleNumberedList },
    { icon: <FormatQuote />, label: 'Blockquote', action: handleBlockquote },
    { icon: <TableChart />, label: 'Insert Table', action: handleTable },
    { icon: <CheckBox />, label: 'Task List', action: handleTaskList },
    { icon: <HorizontalRule />, label: 'Horizontal Rule', action: handleHorizontalRule },
  ];

  // Header options
  const headerOptions = [
    { level: 1, label: 'Heading 1', example: '# Large heading' },
    { level: 2, label: 'Heading 2', example: '## Medium heading' },
    { level: 3, label: 'Heading 3', example: '### Small heading' },
    { level: 4, label: 'Heading 4', example: '#### Tiny heading' },
  ];

  // MDX Components (only show in MDX mode)
  const mdxComponents = [
    { 
      name: 'Callout Info', 
      text: '<Callout type="info">\n  Your important information here\n</Callout>',
      description: 'Information callout box'
    },
    { 
      name: 'Callout Warning', 
      text: '<Callout type="warning">\n  Your warning message here\n</Callout>',
      description: 'Warning callout box'
    },
    { 
      name: 'Callout Success', 
      text: '<Callout type="success">\n  Your success message here\n</Callout>',
      description: 'Success callout box'
    },
    { 
      name: 'Counter', 
      text: '<Counter />',
      description: 'Interactive counter component'
    },
    { 
      name: 'Progress Bar', 
      text: '<ProgressBar progress={75} label="Progress" />',
      description: 'Progress indicator'
    },
  ];

  return (
    <Box
      sx={{
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        backgroundColor: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(10px)',
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: '64px !important',
          px: 3,
        }}
      >
        {/* Left side - Mode indicator and formatting tools */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Mode Indicator */}
          <Chip
            label={`${mode.toUpperCase()} ${editorMode === 'rich' ? 'Rich Editor' : editorMode === 'view' ? 'View Only' : 'Code Editor'}`}
            size="small"
            icon={editorMode === 'rich' ? <Edit fontSize="small" /> : editorMode === 'view' ? <Visibility fontSize="small" /> : <Code fontSize="small" />}
            sx={{
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              fontWeight: 600,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              '& .MuiChip-icon': {
                color: theme.palette.primary.main,
              },
            }}
          />
          
          <Divider orientation="vertical" flexItem sx={{ height: 32, alignSelf: 'center' }} />
          
          {/* Formatting Tools - Only show in split mode or as preview in rich mode */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>            
            {/* Headers Dropdown */}
            <Tooltip title="Headers" arrow>
              <IconButton
                size="small"
                onClick={(e) => setHeaderMenuAnchor(e.currentTarget)}
                disabled={editorMode === 'rich' || editorMode === 'view'}
                sx={{
                  color: (editorMode === 'rich' || editorMode === 'view') 
                    ? theme.palette.text.disabled
                    : theme.palette.text.secondary,
                  backgroundColor: 'transparent',
                  border: `1px solid transparent`,
                  borderRadius: 1.5,
                  width: 32,
                  height: 32,
                  '&:hover': {
                    backgroundColor: (editorMode === 'rich' || editorMode === 'view') 
                      ? 'transparent'
                      : alpha(theme.palette.primary.main, 0.08),
                    color: (editorMode === 'rich' || editorMode === 'view')
                      ? theme.palette.text.disabled
                      : theme.palette.primary.main,
                    border: (editorMode === 'rich' || editorMode === 'view')
                      ? `1px solid transparent`
                      : `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    transform: (editorMode === 'rich' || editorMode === 'view') ? 'none' : 'translateY(-1px)',
                  },
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <Title fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Menu
              anchorEl={headerMenuAnchor}
              open={Boolean(headerMenuAnchor)}
              onClose={() => setHeaderMenuAnchor(null)}
              sx={{
                '& .MuiPaper-root': {
                  backgroundColor: alpha(theme.palette.background.paper, 0.95),
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }
              }}
            >
              {headerOptions.map((header) => (
                <MenuItem 
                  key={header.level} 
                  onClick={() => handleHeader(header.level)}
                  sx={{ minWidth: 200 }}
                >
                  <ListItemText 
                    primary={header.label}
                    secondary={header.example}
                    secondaryTypographyProps={{
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      color: theme.palette.text.secondary
                    }}
                  />
                </MenuItem>
              ))}
            </Menu>
            
            {/* Quick formatting tools */}
            {formatActions.map((action, index) => (
              <Tooltip key={index} title={action.label} arrow>
                <span>
                  <IconButton
                    size="small"
                    onClick={action.action}
                    disabled={editorMode === 'rich' || editorMode === 'view'}
                    sx={{
                      color: (editorMode === 'rich' || editorMode === 'view') 
                        ? theme.palette.text.disabled
                        : theme.palette.text.secondary,
                      backgroundColor: 'transparent',
                      border: `1px solid transparent`,
                      borderRadius: 1.5,
                      width: 32,
                      height: 32,
                      '&:hover': {
                        backgroundColor: (editorMode === 'rich' || editorMode === 'view') 
                          ? 'transparent'
                          : alpha(theme.palette.primary.main, 0.08),
                        color: (editorMode === 'rich' || editorMode === 'view')
                          ? theme.palette.text.disabled
                          : theme.palette.primary.main,
                        border: (editorMode === 'rich' || editorMode === 'view')
                          ? `1px solid transparent`
                          : `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        transform: (editorMode === 'rich' || editorMode === 'view') ? 'none' : 'translateY(-1px)',
                      },
                      '&:disabled': {
                        color: theme.palette.text.disabled,
                      },
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    {action.icon}
                  </IconButton>
                </span>
              </Tooltip>
            ))}
            
            {/* MDX Components Dropdown - Only in MDX mode */}
            {mode === 'mdx' && (
              <>
                <Divider orientation="vertical" flexItem sx={{ height: 24, mx: 1 }} />
                <Tooltip title="MDX Components" arrow>
                  <IconButton
                    size="small"
                    onClick={(e) => setMdxMenuAnchor(e.currentTarget)}
                    disabled={editorMode === 'rich' || editorMode === 'view'}
                    sx={{
                      color: (editorMode === 'rich' || editorMode === 'view') 
                        ? theme.palette.text.disabled
                        : theme.palette.secondary.main,
                      backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                      border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                      borderRadius: 1.5,
                      width: 32,
                      height: 32,
                      '&:hover': {
                        backgroundColor: (editorMode === 'rich' || editorMode === 'view') 
                          ? alpha(theme.palette.secondary.main, 0.1)
                          : alpha(theme.palette.secondary.main, 0.15),
                        color: (editorMode === 'rich' || editorMode === 'view')
                          ? theme.palette.text.disabled
                          : theme.palette.secondary.main,
                        transform: (editorMode === 'rich' || editorMode === 'view') ? 'none' : 'translateY(-1px)',
                      },
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    <Extension fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <Menu
                  anchorEl={mdxMenuAnchor}
                  open={Boolean(mdxMenuAnchor)}
                  onClose={() => setMdxMenuAnchor(null)}
                  sx={{
                    '& .MuiPaper-root': {
                      backgroundColor: alpha(theme.palette.background.paper, 0.95),
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    }
                  }}
                >
                  {mdxComponents.map((component) => (
                    <MenuItem 
                      key={component.name} 
                      onClick={() => handleMDXComponent(component.text)}
                      sx={{ minWidth: 240 }}
                    >
                      <ListItemIcon>
                        <Extension color="secondary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={component.name}
                        secondary={component.description}
                        secondaryTypographyProps={{
                          fontSize: '0.75rem',
                          color: theme.palette.text.secondary
                        }}
                      />
                    </MenuItem>
                  ))}
                </Menu>
              </>
            )}
          </Box>
          
          {/* Content Statistics */}
          {content && content.trim() && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  px: 1.5,
                  py: 0.5,
                  backgroundColor: alpha(theme.palette.background.default, 0.5),
                  borderRadius: 1,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                {wordCount} words • {characterCount} chars
              </Typography>
            </Box>
          )}
        </Box>

        {/* Right side - View mode toggle and AI assistant */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          {/* AI Assistant Button */}
          <Tooltip title="AI Assistant" arrow>
            <IconButton
              size="small"
              onClick={onOpenAIAssistant}
              disabled={!onOpenAIAssistant}
              sx={{
                color: onOpenAIAssistant ? theme.palette.secondary.main : theme.palette.text.disabled,
                backgroundColor: onOpenAIAssistant 
                  ? alpha(theme.palette.secondary.main, 0.1)
                  : alpha(theme.palette.action.disabled, 0.1),
                border: onOpenAIAssistant
                  ? `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`
                  : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                borderRadius: 1.5,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: onOpenAIAssistant
                    ? alpha(theme.palette.secondary.main, 0.15)
                    : alpha(theme.palette.action.disabled, 0.2),
                  transform: onOpenAIAssistant ? 'translateY(-2px)' : 'none',
                  boxShadow: onOpenAIAssistant
                    ? `0 8px 25px ${alpha(theme.palette.secondary.main, 0.3)}`
                    : 'none',
                },
                '&:disabled': {
                  color: theme.palette.text.disabled,
                },
              }}
            >
              <Badge
                badgeContent="AI"
                color="secondary"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.6rem',
                    minWidth: '16px',
                    height: '16px',
                    right: -6,
                    top: -6,
                  },
                }}
              >
                <SmartToy fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ height: 32, alignSelf: 'center' }} />

          {/* Editor Mode Switcher */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: theme.palette.text.secondary,
                fontWeight: 500,
                fontSize: '0.875rem',
              }}
            >
              Editor Mode:
            </Typography>
            <ToggleButtonGroup
              value={editorMode}
              exclusive
              onChange={(_, newMode) => newMode && onEditorModeChange(newMode)}
              size="small"
              sx={{
                backgroundColor: alpha(theme.palette.background.default, 0.5),
                borderRadius: 2,
                padding: '2px',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                '& .MuiToggleButton-root': {
                  border: 'none',
                  borderRadius: '6px !important',
                  px: 2,
                  py: 1,
                  minWidth: '80px',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  color: theme.palette.text.secondary,
                  background: 'transparent',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    color: theme.palette.primary.main,
                    transform: 'translateY(-1px)',
                  },
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
                    transform: 'translateY(-1px)',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                      color: theme.palette.primary.contrastText,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
                    },
                  },
                },
              }}
            >
              <ToggleButton value="split" aria-label="split view">
                <ViewSidebar sx={{ mr: 1, fontSize: 16 }} />
                Split
              </ToggleButton>
              {mode === 'markdown' ? (
                <ToggleButton value="rich" aria-label="rich text">
                  <Edit sx={{ mr: 1, fontSize: 16 }} />
                  Rich
                </ToggleButton>
              ) : (
                <ToggleButton value="view" aria-label="view only">
                  <Visibility sx={{ mr: 1, fontSize: 16 }} />
                  View Only
                </ToggleButton>
              )}
            </ToggleButtonGroup>
          </Box>
        </Box>
      </Toolbar>
    </Box>
  );
};
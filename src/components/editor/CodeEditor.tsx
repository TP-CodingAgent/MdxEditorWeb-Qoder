'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { Box, useTheme, alpha, Typography } from '@mui/material';
import Editor from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  mode: 'markdown' | 'mdx';
  height?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  mode,
  height = '100%',
}) => {
  const theme = useTheme();
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const lastExternalValue = useRef(value);
  const isUpdatingValue = useRef(false);
  const lastUserEdit = useRef(Date.now());
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const rapidTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRapidTyping = useRef(false);

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    
    // Make editor instance globally available for toolbar actions
    (window as Record<string, unknown>).monacoEditorInstance = editor;
    
    // Configure editor options
    editor.updateOptions({
      fontSize: 14,
      lineHeight: 24,
      fontFamily: '"Fira Code", "JetBrains Mono", "Monaco", "Consolas", monospace',
      fontLigatures: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      lineNumbers: 'on',
      folding: true,
      matchBrackets: 'always',
      autoIndent: 'full',
      formatOnPaste: true,
      formatOnType: true,
      renderLineHighlight: 'all',
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      smoothScrolling: true,
    });
    
    // Listen for content changes to update the global reference
    editor.onDidChangeModelContent(() => {
      (window as Record<string, unknown>).monacoEditorInstance = editor;
    });
  };

  const handleEditorChange = useCallback((newValue: string | undefined) => {
    if (newValue !== undefined && !isUpdatingValue.current) {
      const now = Date.now();
      const timeSinceLastEdit = now - lastUserEdit.current;
      
      // Detect rapid typing (less than 100ms between keystrokes)
      if (timeSinceLastEdit < 100) {
        isRapidTyping.current = true;
        
        // Clear existing rapid typing timeout
        if (rapidTypingTimeoutRef.current) {
          clearTimeout(rapidTypingTimeoutRef.current);
        }
        
        // Set longer timeout for rapid typing detection
        rapidTypingTimeoutRef.current = setTimeout(() => {
          isRapidTyping.current = false;
        }, 800); // 800ms timeout for rapid typing
      }
      
      lastUserEdit.current = now;
      lastExternalValue.current = newValue;
      
      // Clear any pending external updates during typing
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
        updateTimeoutRef.current = null;
      }
      
      onChange(newValue);
    }
  }, [onChange]);

  // Handle external value changes while preserving cursor position
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const currentValue = editor.getValue();
    const now = Date.now();
    
    // Much more aggressive protection during rapid typing
    const recentUserActivity = now - lastUserEdit.current < 1000; // 1 second protection
    const isCurrentlyRapidTyping = isRapidTyping.current;
    
    // Only update if this is a real external change, not from user typing
    const isExternalChange = value !== lastExternalValue.current && 
                           value !== currentValue && 
                           !isUpdatingValue.current &&
                           !recentUserActivity &&
                           !isCurrentlyRapidTyping;
    
    // Additional check: only allow substantial changes during active editing
    if (recentUserActivity || isCurrentlyRapidTyping) {
      const lengthDiff = Math.abs(value.length - currentValue.length);
      const isSubstantialChange = lengthDiff > 50; // Much higher threshold
      
      if (!isSubstantialChange) {
        return; // Block the update completely
      }
    }
    
    if (isExternalChange) {
      // Clear any existing timeout
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      
      // Much longer debounce during active typing
      const debounceTime = (recentUserActivity || isCurrentlyRapidTyping) ? 1500 : 200;
      
      updateTimeoutRef.current = setTimeout(() => {
        if (!editorRef.current || isUpdatingValue.current || isRapidTyping.current) return;
        
        // Double-check we're not in the middle of rapid typing
        const stillTyping = Date.now() - lastUserEdit.current < 500;
        if (stillTyping) {
          return;
        }
        
        // Set flag to prevent triggering onChange during programmatic updates
        isUpdatingValue.current = true;
        
        // Store current cursor position and selection
        const position = editorRef.current?.getPosition();
        const selection = editorRef.current?.getSelection();
        const scrollTop = editorRef.current?.getScrollTop();
        
        // Update the value using model to preserve more state
        const model = editorRef.current.getModel();
        if (model) {
          // Use model.setValue() which is less disruptive than editor.setValue()
          model.setValue(value);
        } else {
          editorRef.current.setValue(value);
        }
        
        lastExternalValue.current = value;
        
        // Restore cursor position, selection, and scroll position
        setTimeout(() => {
          try {
            if (position && editorRef.current) {
              const model = editorRef.current.getModel();
              if (model) {
                const lineCount = model.getLineCount();
                const maxColumn = model.getLineMaxColumn(Math.min(position.lineNumber, lineCount));
                
                const restoredPosition = {
                  lineNumber: Math.min(position.lineNumber, lineCount),
                  column: Math.min(position.column, maxColumn)
                };
                
                editorRef.current.setPosition(restoredPosition);
                
                // Restore selection if it existed
                if (selection && !selection.isEmpty()) {
                  const endLine = Math.min(selection.endLineNumber, lineCount);
                  const endColumn = Math.min(selection.endColumn, model.getLineMaxColumn(endLine));
                  
                  const restoredSelection = selection.setEndPosition(endLine, endColumn);
                  editorRef.current.setSelection(restoredSelection);
                }
                
                // Restore scroll position
                editorRef.current.setScrollTop(scrollTop);
              }
            }
          } catch (error) {
            console.debug('Could not restore cursor position in Monaco:', error);
            if (editorRef.current) {
              editorRef.current.focus();
            }
          }
          
          // Reset updating flag
          isUpdatingValue.current = false;
        }, 0);
        
        updateTimeoutRef.current = null;
      }, debounceTime);
    }
  }, [value]);
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      if (rapidTypingTimeoutRef.current) {
        clearTimeout(rapidTypingTimeoutRef.current);
      }
      
      // Clean up global editor reference
      if ((window as Record<string, unknown>).monacoEditorInstance === editorRef.current) {
        (window as Record<string, unknown>).monacoEditorInstance = null;
      }
    };
  }, []);

  // Configure theme based on current Material UI theme
  const editorTheme = theme.palette.mode === 'dark' ? 'vs-dark' : 'light';
  
  // Get language based on mode
  const language = mode === 'mdx' ? 'typescript' : 'markdown';

  return (
    <Box
      sx={{
        height,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.background.paper,
        position: 'relative',
      }}
    >
      {/* Editor Header */}
      <Box
        sx={{
          py: 2,
          px: 3,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          backgroundColor: alpha(theme.palette.background.default, 0.5),
          backdropFilter: 'blur(10px)',
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            color: theme.palette.text.secondary,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontSize: '0.75rem',
          }}
        >
          {mode.toUpperCase()} Editor
        </Typography>
      </Box>

      {/* Editor Content */}
      <Box
        sx={{
          flex: 1,
          overflow: 'hidden',
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)'
            : 'linear-gradient(135deg, rgba(0,0,0,0.01) 0%, rgba(0,0,0,0.005) 100%)',
          '& .monaco-editor': {
            backgroundColor: 'transparent !important',
          },
          '& .monaco-editor .monaco-editor-background': {
            backgroundColor: 'transparent !important',
          },
          '& .monaco-editor .margin': {
            backgroundColor: 'transparent !important',
          },
        }}
      >
        <Editor
          height="100%"
          language={language}
          theme={editorTheme}
          value={value}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            automaticLayout: true,
            padding: { top: 16, bottom: 16 },
            scrollbar: {
              vertical: 'auto',
              horizontal: 'auto',
              useShadows: false,
              verticalScrollbarSize: 12,
              horizontalScrollbarSize: 12,
            },
          }}
        />
      </Box>
    </Box>
  );
};
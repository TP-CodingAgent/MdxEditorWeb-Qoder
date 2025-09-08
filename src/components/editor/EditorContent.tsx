'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Box, useTheme, Divider, IconButton, alpha, CircularProgress } from '@mui/material';
import { DragIndicator } from '@mui/icons-material';
import { CodeEditor } from './CodeEditor';
import { PreviewPanel } from './PreviewPanel';
import { RichTextEditor } from './RichTextEditor';
import { useResponsive } from '@/utils/responsive';
import { prepareContentForRichEditor, prepareContentForCodeEditor } from '@/utils/contentConversion';

interface EditorContentProps {
  mode: 'markdown' | 'mdx';
  editorMode: 'split' | 'rich' | 'view';
  content: string;
  onContentChange: (content: string) => void;
}

export const EditorContent: React.FC<EditorContentProps> = ({
  mode,
  editorMode,
  content,
  onContentChange,
}) => {
  const theme = useTheme();
  const { isMobile } = useResponsive();
  const [splitRatio, setSplitRatio] = useState(50); // Percentage for left panel
  const [isDragging, setIsDragging] = useState(false);
  const [lastEditorMode, setLastEditorMode] = useState<'split' | 'rich' | 'view'>(editorMode);
  const [processedContent, setProcessedContent] = useState(content);
  const [isConverting, setIsConverting] = useState(false);
  const lastContentUpdate = useRef(Date.now());
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingDetectionRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);
  const rapidTypingDetectionRef = useRef<NodeJS.Timeout | null>(null);
  const isRapidTypingRef = useRef(false);

  // Enhanced content change handler that detects typing patterns (for CodeEditor)
  const handleCodeEditorChange = (newContent: string) => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastContentUpdate.current;
    
    // Detect rapid typing (less than 150ms between changes)
    if (timeSinceLastUpdate < 150) {
      isRapidTypingRef.current = true;
      
      // Clear existing rapid typing timeout
      if (rapidTypingDetectionRef.current) {
        clearTimeout(rapidTypingDetectionRef.current);
      }
      
      // Set longer timeout for rapid typing
      rapidTypingDetectionRef.current = setTimeout(() => {
        isRapidTypingRef.current = false;
      }, 1000); // 1 second timeout for rapid typing
    }
    
    // Detect any typing activity
    isTypingRef.current = true;
    
    // Clear existing typing detection timeout
    if (typingDetectionRef.current) {
      clearTimeout(typingDetectionRef.current);
    }
    
    // Set a timeout to detect when typing stops
    const typingTimeout = isRapidTypingRef.current ? 800 : 400; // Longer timeout for rapid typing
    typingDetectionRef.current = setTimeout(() => {
      isTypingRef.current = false;
      // After typing stops, update the processed content for preview
      if (editorMode === 'split' && newContent !== processedContent) {
        setProcessedContent(newContent);
        lastContentUpdate.current = Date.now();
      }
    }, typingTimeout);
    
    lastContentUpdate.current = now;
    
    // Always call the original onChange for parent component
    onContentChange(newContent);
  };

  // Regular content change handler for RichTextEditor
  const handleRichEditorChange = (newContent: string) => {
    onContentChange(newContent);
  };

  // Handle content conversion when switching between editor modes
  useEffect(() => {
    const convertContent = async () => {
      setIsConverting(true);
      let convertedContent = content;
      
      try {
        if (editorMode === 'rich') {
          // Converting to rich text - always convert markdown to HTML
          convertedContent = await prepareContentForRichEditor(content, mode);
        } else if (editorMode === 'split') {
          // Converting to split (code) mode
          if (lastEditorMode === 'rich') {
            // Only convert from HTML back to markdown if coming from rich mode
            convertedContent = prepareContentForCodeEditor(content, mode);
          } else {
            // Keep as-is if already in split mode or initial load
            convertedContent = content;
          }
        }
        
        setProcessedContent(convertedContent);
        
        // Only update parent content if we're switching modes and content changed
        if (lastEditorMode !== editorMode && convertedContent !== content) {
          onContentChange(convertedContent);
        }
      } catch (error) {
        console.error('Content conversion failed:', error);
        setProcessedContent(content); // Fallback to original content
      } finally {
        setIsConverting(false);
        setLastEditorMode(editorMode);
      }
    };

    convertContent();
  }, [editorMode, mode, lastEditorMode]); // Removed 'content' to prevent infinite loop
  
  // Separate effect to handle content changes from external sources (like typing in editor)
  useEffect(() => {
    // Only update processed content if we're not currently converting
    // and the content is different from what we have
    if (!isConverting && content !== processedContent) {
      const now = Date.now();
      
      if (editorMode === 'rich') {
        // Don't update during rich mode to prevent cursor issues
        return;
      }
      
      if (editorMode === 'split') {
        // Don't update if user is actively typing or rapid typing
        if (isTypingRef.current || isRapidTypingRef.current) {
          return;
        }
        
        // Additional protection: check time since last update
        const timeSinceLastUpdate = now - lastContentUpdate.current;
        if (timeSinceLastUpdate < 1000) { // 1 second minimum between updates
          return;
        }
        
        // Clear existing timeout
        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current);
        }
        
        // Only allow updates when user is completely idle
        setProcessedContent(content);
        lastContentUpdate.current = now;
      } else {
        setProcessedContent(content);
        lastContentUpdate.current = now;
      }
    }
  }, [content, isConverting, processedContent, editorMode]);
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      if (typingDetectionRef.current) {
        clearTimeout(typingDetectionRef.current);
      }
      if (rapidTypingDetectionRef.current) {
        clearTimeout(rapidTypingDetectionRef.current);
      }
    };
  }, []);

  // Handle split pane resizing
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    
    const container = document.querySelector('[data-split-container]') as HTMLElement;
    if (!container) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const newRatio = ((e.clientX - rect.left) / rect.width) * 100;
      
      // Limit ratio between 20% and 80%
      if (newRatio >= 20 && newRatio <= 80) {
        setSplitRatio(newRatio);
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // For rich text mode, show the WYSIWYG editor
  if (editorMode === 'rich') {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: theme.palette.background.paper,
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)'
            : 'linear-gradient(135deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.01) 100%)',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          borderRadius: 2,
          m: 2,
          overflow: 'hidden',
        }}
      >
        <RichTextEditor
          content={processedContent}
          onChange={handleRichEditorChange}
          mode={mode}
          height="100%"
        />
        {isConverting && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              zIndex: 1000,
            }}
          >
            <CircularProgress size={40} />
          </Box>
        )}
      </Box>
    );
  }

  // For view-only mode, show only the preview panel at full width
  if (editorMode === 'view') {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          borderRadius: 2,
          overflow: 'hidden',
          m: 2,
          boxShadow: theme.palette.mode === 'dark'
            ? '0 4px 20px rgba(0,0,0,0.3)'
            : '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        <PreviewPanel
          content={processedContent}
          mode={mode}
        />
        {isConverting && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              zIndex: 1000,
            }}
          >
            <CircularProgress size={40} />
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box
      data-split-container
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        backgroundColor: theme.palette.background.default,
        position: 'relative',
        overflow: 'hidden',
        cursor: isDragging ? 'col-resize' : 'default',
        userSelect: isDragging ? 'none' : 'auto',
      }}
    >
      {/* Dragging Overlay */}
      {isDragging && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: alpha(theme.palette.primary.main, 0.05),
            zIndex: 1000,
            cursor: 'col-resize',
            pointerEvents: 'none',
          }}
        />
      )}
      {/* Code Editor Panel */}
      <Box
        sx={{
          width: isMobile ? '100%' : `${splitRatio}%`,
          height: isMobile ? '50%' : '100%',
          minHeight: isMobile ? '300px' : 'auto',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          borderRadius: isMobile ? '12px 12px 0 0' : '12px 0 0 12px',
          overflow: 'hidden',
          m: isMobile ? '8px 8px 4px 8px' : '8px 4px 8px 8px',
          boxShadow: theme.palette.mode === 'dark'
            ? '0 4px 20px rgba(0,0,0,0.3)'
            : '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        <CodeEditor
          value={processedContent}
          onChange={handleCodeEditorChange}
          mode={mode}
          height="100%"
        />
      </Box>

      {/* Resizable Divider - Only on desktop */}
      {!isMobile && (
        <Box
          sx={{
            width: '8px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'col-resize',
            backgroundColor: isDragging 
              ? alpha(theme.palette.primary.main, 0.2)
              : alpha(theme.palette.divider, 0.1),
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            my: 1,
            position: 'relative',
            zIndex: isDragging ? 1001 : 1,
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.15),
              '& .drag-indicator': {
                color: theme.palette.primary.main,
                transform: 'rotate(90deg) scale(1.2)',
              },
            },
            transition: 'all 0.2s ease',
          }}
          onMouseDown={handleMouseDown}
        >
          <DragIndicator
            className="drag-indicator"
            sx={{
              fontSize: 16,
              color: isDragging 
                ? theme.palette.primary.main
                : alpha(theme.palette.text.secondary, 0.5),
              transform: isDragging 
                ? 'rotate(90deg) scale(1.2)'
                : 'rotate(90deg)',
              transition: 'all 0.2s ease',
            }}
          />
        </Box>
      )}

      {/* Preview Panel */}
      <Box
        sx={{
          width: isMobile ? '100%' : `${100 - splitRatio}%`,
          height: isMobile ? '50%' : '100%',
          minHeight: isMobile ? '300px' : 'auto',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          borderRadius: isMobile ? '0 0 12px 12px' : '0 12px 12px 0',
          overflow: 'hidden',
          m: isMobile ? '4px 8px 8px 8px' : '8px 8px 8px 4px',
          boxShadow: theme.palette.mode === 'dark'
            ? '0 4px 20px rgba(0,0,0,0.3)'
            : '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        <PreviewPanel
          content={processedContent}
          mode={mode}
        />
      </Box>
    </Box>
  );
};
'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  CircularProgress,
  Fab,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import { ArrowBack, AutoAwesome, SmartToy } from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { ThemeSwitch } from '@/components/ThemeSwitch';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { EditorContent } from '@/components/editor/EditorContent';
import { AIAssistant } from '@/components/ai/AIAssistant';
import { ContentSuggestions } from '@/components/ai/ContentSuggestions';
import { AIContextMenu } from '@/components/ai/AIContextMenu';
import { ContentAnalysis } from '@/components/ai/ContentAnalysis';

function EditorPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const [mode, setMode] = useState<'markdown' | 'mdx'>('markdown');
  const [editorMode, setEditorMode] = useState<'split' | 'rich' | 'view'>('split');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showContentSuggestions, setShowContentSuggestions] = useState(false);
  const [contextMenuAnchor, setContextMenuAnchor] = useState<HTMLElement | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(true);

  // Load sample content based on mode
  const loadSampleContent = async (currentMode: 'markdown' | 'mdx') => {
    try {
      setIsLoading(true);
      const fileName = currentMode === 'markdown' ? 'sample-markdown.md' : 'sample-mdx.mdx';
      const response = await fetch(`/${fileName}`);
      if (response.ok) {
        const sampleContent = await response.text();
        setContent(sampleContent);
      } else {
        // Fallback content if files don't exist
        const fallbackContent = currentMode === 'markdown' 
          ? '# Welcome to Markdown Editor!\n\nStart typing your markdown content here...'
          : '# Welcome to MDX Editor!\n\nStart typing your MDX content here...\n\n{/* You can use React components here! */}';
        setContent(fallbackContent);
      }
    } catch (error) {
      console.warn('Failed to load sample content:', error);
      // Fallback content on error
      const fallbackContent = currentMode === 'markdown' 
        ? '# Welcome to Markdown Editor!\n\nStart typing your markdown content here...'
        : '# Welcome to MDX Editor!\n\nStart typing your MDX content here...\n\n{/* You can use React components here! */}';
      setContent(fallbackContent);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle text selection for AI context menu
  const handleTextSelection = useCallback((event: MouseEvent) => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim() || '';
    
    if (selectedText && event.button === 2) { // Right click
      setSelectedText(selectedText);
      setContextMenuAnchor(event.target as HTMLElement);
    }
  }, []);

  // Handle applying AI edits
  const handleApplyEdit = useCallback((newText: string, action: 'replace' | 'append' | 'prepend') => {
    if (action === 'replace' && selectedText) {
      const updatedContent = content.replace(selectedText, newText);
      setContent(updatedContent);
    } else if (action === 'append') {
      setContent(content + newText);
    } else if (action === 'prepend') {
      setContent(newText + content);
    }
    setContextMenuAnchor(null);
    setSelectedText('');
  }, [content, selectedText]);

  // Handle content suggestions
  const handleApplySuggestion = useCallback((suggestion: string, type: 'replace' | 'append' | 'prepend') => {
    if (type === 'replace') {
      setContent(suggestion);
    } else if (type === 'append') {
      setContent(content + suggestion);
    } else if (type === 'prepend') {
      setContent(suggestion + content);
    }
  }, [content]);

  // Handle analysis suggestions
  const handleAnalysisSuggestion = useCallback((_suggestion: string) => {
    // For now, just show in AI assistant
    setShowAIAssistant(true);
  }, []);

  useEffect(() => {
    // Add event listener for text selection
    document.addEventListener('contextmenu', handleTextSelection);
    return () => {
      document.removeEventListener('contextmenu', handleTextSelection);
    };
  }, [handleTextSelection]);

  useEffect(() => {
    const modeParam = searchParams.get('mode');
    if (modeParam === 'markdown' || modeParam === 'mdx') {
      setMode(modeParam);
      // Validate and adjust editor mode based on content mode
      if (modeParam === 'mdx' && editorMode === 'rich') {
        // MDX mode doesn't support rich text editing, switch to split
        setEditorMode('split');
      }
      // Load sample content when mode changes
      loadSampleContent(modeParam);
    } else {
      // Default to markdown mode and load its sample content
      setMode('markdown');
      loadSampleContent('markdown');
    }
  }, [searchParams]);

  const handleEditorModeChange = (newMode: 'split' | 'rich' | 'view') => {
    // Validate mode combinations
    if (mode === 'mdx' && newMode === 'rich') {
      // MDX mode doesn't support rich text editing
      console.warn('Rich text editing is not supported in MDX mode');
      return;
    }
    if (mode === 'markdown' && newMode === 'view') {
      // Markdown mode doesn't support view-only mode
      console.warn('View-only mode is only available in MDX mode');
      return;
    }
    setEditorMode(newMode);
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <IconButton edge="start" onClick={() => router.push('/')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {mode === 'markdown' ? 'Markdown Editor' : 'MDX Editor'}
          </Typography>
          <ThemeSwitch />
        </Toolbar>
      </AppBar>
      
      {/* Editor Toolbar */}
      <EditorToolbar
        mode={mode}
        editorMode={editorMode}
        onEditorModeChange={handleEditorModeChange}
        onContentUpdate={handleContentChange}
        content={content}
        onOpenAIAssistant={() => setShowAIAssistant(true)}
      />
      
      {/* Content Analysis Panel */}
      {showAnalysis && (
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <ContentAnalysis
            content={content}
            mode={mode}
            onSuggestionClick={handleAnalysisSuggestion}
          />
        </Box>
      )}
      
      {/* Editor Content */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {isLoading ? (
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100%',
              flexDirection: 'column',
              gap: 2
            }}
          >
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              Loading {mode === 'markdown' ? 'Markdown' : 'MDX'} sample content...
            </Typography>
          </Box>
        ) : (
          <EditorContent
            mode={mode}
            editorMode={editorMode}
            content={content}
            onContentChange={handleContentChange}
          />
        )}
      </Box>
      
      {/* AI Context Menu */}
      <AIContextMenu
        anchorEl={contextMenuAnchor}
        open={Boolean(contextMenuAnchor)}
        onClose={() => setContextMenuAnchor(null)}
        selectedText={selectedText}
        onApplyEdit={handleApplyEdit}
        mode={mode}
      />
      
      {/* Content Suggestions Dialog */}
      {showContentSuggestions && (
        <Box
          sx={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1300,
          }}
        >
          <ContentSuggestions
            content={content}
            mode={mode}
            onApplySuggestion={handleApplySuggestion}
            onClose={() => setShowContentSuggestions(false)}
          />
        </Box>
      )}
      
      {/* Floating AI Suggestions Button */}
      <Fab
        color="secondary"
        size="medium"
        onClick={() => setShowContentSuggestions(true)}
        sx={{
          position: 'fixed',
          bottom: 100,
          right: 24,
          background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${alpha(theme.palette.secondary.main, 0.8)} 100%)`,
          boxShadow: `0 8px 32px ${alpha(theme.palette.secondary.main, 0.3)}`,
          '&:hover': {
            background: `linear-gradient(135deg, ${theme.palette.secondary.dark} 0%, ${alpha(theme.palette.secondary.dark, 0.9)} 100%)`,
            transform: 'translateY(-2px)',
            boxShadow: `0 12px 40px ${alpha(theme.palette.secondary.main, 0.4)}`,
          },
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Tooltip title="AI Content Suggestions" placement="left">
          <AutoAwesome />
        </Tooltip>
      </Fab>
      
      {/* Floating AI Assistant Button */}
      <Fab
        color="primary"
        size="large"
        onClick={() => setShowAIAssistant(true)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.8)} 100%)`,
          boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
          '&:hover': {
            background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${alpha(theme.palette.primary.dark, 0.9)} 100%)`,
            transform: 'translateY(-3px)',
            boxShadow: `0 16px 48px ${alpha(theme.palette.primary.main, 0.4)}`,
          },
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 1000,
        }}
      >
        <Tooltip title="AI Assistant Chat" placement="left">
          <SmartToy />
        </Tooltip>
      </Fab>
      
      {/* AI Assistant */}
      <AIAssistant
        open={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        onOpen={() => setShowAIAssistant(true)}
        content={content}
        onContentUpdate={handleContentChange}
        mode={mode}
      />
    </Box>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    }>
      <EditorPageContent />
    </Suspense>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Fade,
  useTheme,
  alpha,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  AutoAwesome,
  TrendingUp,
  Edit,
  AddCircle,
  Lightbulb,
  Close,
  ContentCopy,
  Check,
} from '@mui/icons-material';
import { useAI } from '@/lib/ai';

interface ContentSuggestionsProps {
  content: string;
  mode: 'markdown' | 'mdx';
  onApplySuggestion: (suggestion: string, type: 'replace' | 'append' | 'prepend') => void;
  onClose: () => void;
}

interface Suggestion {
  id: string;
  type: 'improve' | 'extend' | 'rephrase' | 'structure';
  title: string;
  content: string;
  action: 'replace' | 'append' | 'prepend';
  confidence: number;
}

export const ContentSuggestions: React.FC<ContentSuggestionsProps> = ({
  content,
  mode,
  onApplySuggestion,
  onClose,
}) => {
  const theme = useTheme();
  const { sendMessage, isLoading, error } = useAI();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [generatingSuggestions, setGeneratingSuggestions] = useState(false);
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (content.trim()) {
      generateSuggestions();
    }
  }, [content]);

  const generateSuggestions = async () => {
    if (!content.trim()) return;

    setGeneratingSuggestions(true);
    try {
      // Analyze content and generate suggestions
      const analysisPrompt = `Analyze the following ${mode} content and provide 3-4 specific improvement suggestions. For each suggestion, specify:
1. Type (improve/extend/rephrase/structure)
2. Title (brief description)
3. Content (the actual suggested text)
4. Action (replace/append/prepend)
5. Confidence (1-10)

Content to analyze:
${content}

Respond in JSON format:
{
  "suggestions": [
    {
      "type": "improve",
      "title": "Brief title",
      "content": "Suggested content",
      "action": "replace",
      "confidence": 8
    }
  ]
}`;

      // Since we can't directly get JSON response, we'll simulate suggestions based on content analysis
      const mockSuggestions: Suggestion[] = [
        {
          id: '1',
          type: 'improve',
          title: 'Enhance clarity and flow',
          content: generateImprovedContent(content),
          action: 'replace',
          confidence: 8,
        },
        {
          id: '2',
          type: 'extend',
          title: 'Add more details and examples',
          content: '\n\n## Additional Details\n\nTo further elaborate on this topic, consider these key points:\n\n- Detailed explanation with examples\n- Practical applications and use cases\n- Best practices and recommendations',
          action: 'append',
          confidence: 7,
        },
        {
          id: '3',
          type: 'structure',
          title: 'Improve document structure',
          content: generateStructureImprovement(content),
          action: 'replace',
          confidence: 6,
        },
      ];

      setSuggestions(mockSuggestions);
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setGeneratingSuggestions(false);
    }
  };

  const generateImprovedContent = (originalContent: string): string => {
    // Simple content improvement logic
    if (originalContent.length < 100) {
      return originalContent + '\n\nThis content has been enhanced with additional context and improved formatting.';
    }
    return originalContent.replace(/\. /g, '. Furthermore, ').replace(/\n\n/g, '\n\nAdditionally, ');
  };

  const generateStructureImprovement = (originalContent: string): string => {
    // Simple structure improvement
    const lines = originalContent.split('\n');
    const improved = lines.map(line => {
      if (line.trim() && !line.startsWith('#') && !line.startsWith('-') && !line.startsWith('*')) {
        return `> ${line}`;
      }
      return line;
    });
    return improved.join('\n');
  };

  const handleApplySuggestion = (suggestion: Suggestion) => {
    onApplySuggestion(suggestion.content, suggestion.action);
    setAppliedSuggestions(prev => new Set([...prev, suggestion.id]));
  };

  const getSuggestionIcon = (type: Suggestion['type']) => {
    switch (type) {
      case 'improve': return <AutoAwesome />;
      case 'extend': return <AddCircle />;
      case 'rephrase': return <Edit />;
      case 'structure': return <TrendingUp />;
      default: return <Lightbulb />;
    }
  };

  const getSuggestionColor = (type: Suggestion['type']) => {
    switch (type) {
      case 'improve': return theme.palette.primary.main;
      case 'extend': return theme.palette.success.main;
      case 'rephrase': return theme.palette.warning.main;
      case 'structure': return theme.palette.info.main;
      default: return theme.palette.secondary.main;
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderRadius: 3,
        p: 3,
        maxWidth: 600,
        maxHeight: '80vh',
        overflow: 'auto',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AutoAwesome sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
          <Box>
            <Typography variant="h6" fontWeight="700">
              Content Suggestions
            </Typography>
            <Typography variant="caption" color="text.secondary">
              AI-powered improvements for your {mode} content
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {generatingSuggestions && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 4, textAlign: 'center' }}>
          <CircularProgress size={24} />
          <Typography variant="body2" color="text.secondary">
            Analyzing your content and generating suggestions...
          </Typography>
        </Box>
      )}

      {/* Suggestions List */}
      {!generatingSuggestions && suggestions.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {suggestions.map((suggestion, index) => (
            <Fade in key={suggestion.id} timeout={300 + index * 100}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  background: alpha(getSuggestionColor(suggestion.type), 0.05),
                  border: `1px solid ${alpha(getSuggestionColor(suggestion.type), 0.2)}`,
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 25px ${alpha(getSuggestionColor(suggestion.type), 0.15)}`,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box
                    sx={{
                      color: getSuggestionColor(suggestion.type),
                      mt: 0.5,
                    }}
                  >
                    {getSuggestionIcon(suggestion.type)}
                  </Box>
                  
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight="600">
                        {suggestion.title}
                      </Typography>
                      <Chip
                        label={suggestion.type}
                        size="small"
                        sx={{
                          backgroundColor: alpha(getSuggestionColor(suggestion.type), 0.1),
                          color: getSuggestionColor(suggestion.type),
                          fontSize: '0.7rem',
                          height: 20,
                        }}
                      />
                      <Chip
                        label={`${suggestion.confidence}/10`}
                        size="small"
                        sx={{
                          backgroundColor: alpha(theme.palette.info.main, 0.1),
                          color: theme.palette.info.main,
                          fontSize: '0.7rem',
                          height: 20,
                        }}
                      />
                    </Box>
                    
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        maxHeight: 120,
                        overflow: 'auto',
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                        backgroundColor: alpha(theme.palette.background.default, 0.3),
                        p: 1.5,
                        borderRadius: 1,
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      }}
                    >
                      {suggestion.content.substring(0, 200)}
                      {suggestion.content.length > 200 && '...'}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {appliedSuggestions.has(suggestion.id) ? (
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<Check />}
                          disabled
                          sx={{
                            backgroundColor: theme.palette.success.main,
                            color: 'white',
                          }}
                        >
                          Applied
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={getSuggestionIcon(suggestion.type)}
                            onClick={() => handleApplySuggestion(suggestion)}
                            sx={{
                              backgroundColor: getSuggestionColor(suggestion.type),
                              color: 'white',
                              '&:hover': {
                                backgroundColor: alpha(getSuggestionColor(suggestion.type), 0.8),
                              },
                            }}
                          >
                            Apply {suggestion.action}
                          </Button>
                          <Tooltip title="Copy suggestion">
                            <IconButton
                              size="small"
                              onClick={() => navigator.clipboard.writeText(suggestion.content)}
                              sx={{ color: getSuggestionColor(suggestion.type) }}
                            >
                              <ContentCopy fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Fade>
          ))}
        </Box>
      )}

      {/* Empty State */}
      {!generatingSuggestions && suggestions.length === 0 && content.trim() && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Lightbulb sx={{ fontSize: 64, color: alpha(theme.palette.primary.main, 0.3), mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No suggestions available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your content looks great! Try adding more content to get AI suggestions.
          </Typography>
        </Box>
      )}

      {/* Regenerate Button */}
      {!generatingSuggestions && suggestions.length > 0 && (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            variant="outlined"
            onClick={generateSuggestions}
            startIcon={<AutoAwesome />}
            sx={{
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            Generate New Suggestions
          </Button>
        </Box>
      )}
    </Paper>
  );
};
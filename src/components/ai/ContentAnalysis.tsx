'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  LinearProgress,
  useTheme,
  alpha,
  Collapse,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Analytics,
  TrendingUp,
  CheckCircle,
  Visibility,
  ExpandLess,
  ExpandMore,
  AutoAwesome,
  Timer,
} from '@mui/icons-material';

interface ContentAnalysisProps {
  content: string;
  mode: 'markdown' | 'mdx';
  onSuggestionClick: (suggestion: string) => void;
}

interface AnalysisMetrics {
  wordCount: number;
  characterCount: number;
  readingTime: number;
  readabilityScore: number;
  sentenceCount: number;
  paragraphCount: number;
  headingCount: number;
  linkCount: number;
  codeBlockCount: number;
}

interface ContentIssue {
  type: 'grammar' | 'style' | 'structure' | 'clarity';
  severity: 'low' | 'medium' | 'high';
  message: string;
  suggestion: string;
  line?: number;
}

export const ContentAnalysis: React.FC<ContentAnalysisProps> = ({
  content,
  mode,
  onSuggestionClick,
}) => {
  const theme = useTheme();
  const [metrics, setMetrics] = useState<AnalysisMetrics | null>(null);
  const [issues, setIssues] = useState<ContentIssue[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const analyzeContent = useCallback(() => {
    if (!content.trim()) {
      setMetrics(null);
      setIssues([]);
      return;
    }

    setAnalyzing(true);

    // Simulate analysis delay
    setTimeout(() => {
      // Calculate basic metrics
      const words = content.trim().split(/\s+/).filter(word => word.length > 0);
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
      const headings = (content.match(/^#+\s/gm) || []).length;
      const links = (content.match(/\[([^\]]+)\]\([^)]+\)/g) || []).length;
      const codeBlocks = (content.match(/```[\s\S]*?```/g) || []).length;

      const newMetrics: AnalysisMetrics = {
        wordCount: words.length,
        characterCount: content.length,
        readingTime: Math.ceil(words.length / 200), // Average reading speed
        readabilityScore: calculateReadabilityScore(words, sentences),
        sentenceCount: sentences.length,
        paragraphCount: paragraphs.length,
        headingCount: headings,
        linkCount: links,
        codeBlockCount: codeBlocks,
      };

      setMetrics(newMetrics);

      // Generate content issues
      const newIssues: ContentIssue[] = [];

      if (newMetrics.wordCount > 0) {
        // Check for common issues
        if (newMetrics.wordCount < 50) {
          newIssues.push({
            type: 'structure',
            severity: 'medium',
            message: 'Content is quite short',
            suggestion: 'Consider adding more details and examples to provide comprehensive coverage.',
          });
        }

        if (newMetrics.headingCount === 0 && newMetrics.wordCount > 100) {
          newIssues.push({
            type: 'structure',
            severity: 'medium',
            message: 'No headings found',
            suggestion: 'Add headings to improve content structure and readability.',
          });
        }

        if (newMetrics.paragraphCount === 1 && newMetrics.wordCount > 150) {
          newIssues.push({
            type: 'structure',
            severity: 'low',
            message: 'Single paragraph detected',
            suggestion: 'Break long content into multiple paragraphs for better readability.',
          });
        }

        if (newMetrics.readabilityScore < 5) {
          newIssues.push({
            type: 'clarity',
            severity: 'high',
            message: 'Text may be difficult to read',
            suggestion: 'Simplify sentence structure and use shorter words where possible.',
          });
        }

        // Check for repeated words
        const wordFreq = new Map<string, number>();
        words.forEach(word => {
          const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
          if (cleanWord.length > 3) {
            wordFreq.set(cleanWord, (wordFreq.get(cleanWord) || 0) + 1);
          }
        });

        for (const [word, count] of wordFreq.entries()) {
          if (count > 5) {
            newIssues.push({
              type: 'style',
              severity: 'low',
              message: `Word "${word}" appears ${count} times`,
              suggestion: 'Consider using synonyms to avoid repetition.',
            });
            break; // Only show one repetition issue
          }
        }
      }

      setIssues(newIssues);
      setAnalyzing(false);
    }, 500);
  }, [content]);

  useEffect(() => {
    analyzeContent();
  }, [analyzeContent]);

  const calculateReadabilityScore = (words: string[], sentences: string[]): number => {
    if (sentences.length === 0) return 10;
    
    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = words.reduce((sum, word) => sum + countSyllables(word), 0) / words.length;
    
    // Simplified Flesch Reading Ease Score (0-10 scale)
    const score = 10 - (avgWordsPerSentence * 0.1) - (avgSyllablesPerWord * 0.5);
    return Math.max(0, Math.min(10, score));
  };

  const countSyllables = (word: string): number => {
    const vowels = 'aeiouyAEIOUY';
    let count = 0;
    let prevWasVowel = false;
    
    for (const char of word) {
      const isVowel = vowels.includes(char);
      if (isVowel && !prevWasVowel) {
        count++;
      }
      prevWasVowel = isVowel;
    }
    
    return Math.max(1, count);
  };

  const getReadabilityColor = (score: number) => {
    if (score >= 8) return theme.palette.success.main;
    if (score >= 6) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getSeverityColor = (severity: ContentIssue['severity']) => {
    switch (severity) {
      case 'high': return theme.palette.error.main;
      case 'medium': return theme.palette.warning.main;
      case 'low': return theme.palette.info.main;
      default: return theme.palette.text.secondary;
    }
  };

  if (!content.trim()) {
    return null;
  }

  return (
    <Paper
      elevation={0}
      sx={{
        background: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderRadius: 2,
        p: 2,
        mb: 2,
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Analytics sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
          <Typography variant="subtitle2" fontWeight="600">
            Content Analysis
          </Typography>
          {analyzing && <Timer sx={{ fontSize: 16, color: theme.palette.text.secondary, animation: 'pulse 1.5s infinite' }} />}
        </Box>
        <IconButton size="small" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      {/* Quick Metrics */}
      {metrics && (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          <Chip
            size="small"
            label={`${metrics.wordCount} words`}
            sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1) }}
          />
          <Chip
            size="small"
            label={`${metrics.readingTime} min read`}
            sx={{ backgroundColor: alpha(theme.palette.info.main, 0.1) }}
          />
          <Chip
            size="small"
            label={`Readability: ${metrics.readabilityScore.toFixed(1)}/10`}
            sx={{ 
              backgroundColor: alpha(getReadabilityColor(metrics.readabilityScore), 0.1),
              color: getReadabilityColor(metrics.readabilityScore),
            }}
          />
        </Box>
      )}

      {/* Issues Summary */}
      {issues.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Found {issues.length} suggestion{issues.length !== 1 ? 's' : ''}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {issues.slice(0, 3).map((issue, index) => (
              <Tooltip key={index} title={issue.suggestion} arrow>
                <Chip
                  size="small"
                  label={issue.message}
                  onClick={() => onSuggestionClick(issue.suggestion)}
                  sx={{
                    backgroundColor: alpha(getSeverityColor(issue.severity), 0.1),
                    color: getSeverityColor(issue.severity),
                    cursor: 'pointer',
                    fontSize: '0.7rem',
                    '&:hover': {
                      backgroundColor: alpha(getSeverityColor(issue.severity), 0.2),
                    },
                  }}
                />
              </Tooltip>
            ))}
            {issues.length > 3 && (
              <Chip
                size="small"
                label={`+${issues.length - 3} more`}
                onClick={() => setIsExpanded(true)}
                sx={{
                  backgroundColor: alpha(theme.palette.text.secondary, 0.1),
                  cursor: 'pointer',
                  fontSize: '0.7rem',
                }}
              />
            )}
          </Box>
        </Box>
      )}

      {/* Expanded Details */}
      <Collapse in={isExpanded}>
        {metrics && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Detailed Metrics
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 1 }}>
              <Box sx={{ textAlign: 'center', p: 1, backgroundColor: alpha(theme.palette.background.default, 0.5), borderRadius: 1 }}>
                <Typography variant="h6" color="primary">{metrics.wordCount}</Typography>
                <Typography variant="caption">Words</Typography>
              </Box>
              <Box sx={{ textAlign: 'center', p: 1, backgroundColor: alpha(theme.palette.background.default, 0.5), borderRadius: 1 }}>
                <Typography variant="h6" color="primary">{metrics.sentenceCount}</Typography>
                <Typography variant="caption">Sentences</Typography>
              </Box>
              <Box sx={{ textAlign: 'center', p: 1, backgroundColor: alpha(theme.palette.background.default, 0.5), borderRadius: 1 }}>
                <Typography variant="h6" color="primary">{metrics.paragraphCount}</Typography>
                <Typography variant="caption">Paragraphs</Typography>
              </Box>
              <Box sx={{ textAlign: 'center', p: 1, backgroundColor: alpha(theme.palette.background.default, 0.5), borderRadius: 1 }}>
                <Typography variant="h6" color="primary">{metrics.headingCount}</Typography>
                <Typography variant="caption">Headings</Typography>
              </Box>
            </Box>
          </Box>
        )}

        {/* All Issues */}
        {issues.length > 0 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Improvement Suggestions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {issues.map((issue, index) => (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    p: 1.5,
                    backgroundColor: alpha(getSeverityColor(issue.severity), 0.05),
                    border: `1px solid ${alpha(getSeverityColor(issue.severity), 0.2)}`,
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: alpha(getSeverityColor(issue.severity), 0.1),
                    },
                  }}
                  onClick={() => onSuggestionClick(issue.suggestion)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <CheckCircle sx={{ fontSize: 16, color: getSeverityColor(issue.severity) }} />
                    <Typography variant="body2" fontWeight="500">
                      {issue.message}
                    </Typography>
                    <Chip
                      size="small"
                      label={issue.severity}
                      sx={{
                        backgroundColor: getSeverityColor(issue.severity),
                        color: 'white',
                        fontSize: '0.65rem',
                        height: 18,
                      }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {issue.suggestion}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Box>
        )}
      </Collapse>

      {/* Progress Bar for Analysis */}
      {analyzing && (
        <LinearProgress
          sx={{
            mt: 1,
            borderRadius: 1,
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
          }}
        />
      )}
    </Paper>
  );
};
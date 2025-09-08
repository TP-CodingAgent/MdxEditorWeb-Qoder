'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Box, Typography, useTheme, alpha } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { 
  oneDark, 
  oneLight 
} from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Callout, Counter, ProgressBar, ThemeBox, Footer } from './mdx-components';

interface PreviewPanelProps {
  content: string;
  mode: 'markdown' | 'mdx';
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ content, mode }) => {
  const theme = useTheme();
  
  const syntaxTheme = theme.palette.mode === 'dark' ? oneDark : oneLight;

  // MDX Components that can be used in the content
  const mdxComponents = {
    Callout,
    Counter,
    ProgressBar,
    ThemeBox,
    Footer,
  };

  // Process content for MDX mode - convert JSX-like syntax to renderable React content
  const processedContent = useMemo(() => {
    if (mode === 'mdx') {
      let processed = content;
      
      // Remove export statements for preview
      processed = processed.replace(/export\s+const\s+\w+\s*=\s*[\s\S]*?;/g, '');
      
      // Remove JSX comments
      processed = processed.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
      
      return processed;
    }
    return content;
  }, [content, mode]);

  // Custom component renderer for MDX components
  const renderMDXComponent = (componentName: string, props: Record<string, unknown> = {}, children?: React.ReactNode) => {
    const Component = mdxComponents[componentName as keyof typeof mdxComponents];
    if (Component) {
      return React.createElement(Component, props, children);
    }
    return null;
  };

  // Parse and render MDX components from content
  const renderMDXContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let currentMarkdown = '';
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      
      // Check for code blocks first (highest priority)
      if (line.startsWith('```')) {
        // Render accumulated markdown
        if (currentMarkdown.trim()) {
          elements.push(
            <ReactMarkdown
              key={elements.length}
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={customComponents}
            >
              {currentMarkdown}
            </ReactMarkdown>
          );
          currentMarkdown = '';
        }
        
        // Collect the entire code block
        let codeBlock = line + '\n';
        i++;
        while (i < lines.length && !lines[i].startsWith('```')) {
          codeBlock += lines[i] + '\n';
          i++;
        }
        if (i < lines.length) {
          codeBlock += lines[i] + '\n'; // Add closing ```
        }
        
        // Render the code block as markdown
        elements.push(
          <ReactMarkdown
            key={elements.length}
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={customComponents}
          >
            {codeBlock}
          </ReactMarkdown>
        );
        i++;
        continue;
      }
      
      // Check for component tags
      if (line.includes('<Counter')) {
        // Render accumulated markdown
        if (currentMarkdown.trim()) {
          elements.push(
            <ReactMarkdown
              key={elements.length}
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={customComponents}
            >
              {currentMarkdown}
            </ReactMarkdown>
          );
          currentMarkdown = '';
        }
        
        // Render Counter component
        elements.push(
          <div key={elements.length}>
            {renderMDXComponent('Counter')}
          </div>
        );
        i++;
        continue;
      }
      
      // Check for Callout components
      const calloutMatch = line.match(/<Callout type="(\w+)">/);
      if (calloutMatch) {
        // Render accumulated markdown
        if (currentMarkdown.trim()) {
          elements.push(
            <ReactMarkdown
              key={elements.length}
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={customComponents}
            >
              {currentMarkdown}
            </ReactMarkdown>
          );
          currentMarkdown = '';
        }
        
        // Find the closing tag and extract content
        let calloutContent = '';
        i++;
        while (i < lines.length && !lines[i].includes('</Callout>')) {
          calloutContent += lines[i] + '\n';
          i++;
        }
        
        // Render Callout component
        elements.push(
          <div key={elements.length}>
            {renderMDXComponent('Callout', { type: calloutMatch[1] }, calloutContent)}
          </div>
        );
        i++;
        continue;
      }
      
      // Check for ProgressBar components
      const progressMatch = line.match(/<ProgressBar progress={(\d+)} label="([^"]+)" \/>/);
      if (progressMatch) {
        // Render accumulated markdown
        if (currentMarkdown.trim()) {
          elements.push(
            <ReactMarkdown
              key={elements.length}
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={customComponents}
            >
              {currentMarkdown}
            </ReactMarkdown>
          );
          currentMarkdown = '';
        }
        
        // Render ProgressBar component
        elements.push(
          <div key={elements.length}>
            {renderMDXComponent('ProgressBar', { 
              progress: parseInt(progressMatch[1]), 
              label: progressMatch[2] 
            })}
          </div>
        );
        i++;
        continue;
      }
      
      // Check for ThemeBox components
      if (line.includes('<ThemeBox')) {
        // Render accumulated markdown
        if (currentMarkdown.trim()) {
          elements.push(
            <ReactMarkdown
              key={elements.length}
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={customComponents}
            >
              {currentMarkdown}
            </ReactMarkdown>
          );
          currentMarkdown = '';
        }
        
        // Check if it's self-closing or has content
        if (line.includes('/>')) {
          elements.push(
            <div key={elements.length}>
              {renderMDXComponent('ThemeBox')}
            </div>
          );
        } else {
          // Find the closing tag and extract content
          let themeContent = '';
          i++;
          while (i < lines.length && !lines[i].includes('</ThemeBox>')) {
            themeContent += lines[i] + '\n';
            i++;
          }
          
          elements.push(
            <div key={elements.length}>
              {renderMDXComponent('ThemeBox', {}, themeContent)}
            </div>
          );
        }
        i++;
        continue;
      }
      
      // Check for Footer components
      if (line.includes('<Footer')) {
        // Render accumulated markdown
        if (currentMarkdown.trim()) {
          elements.push(
            <ReactMarkdown
              key={elements.length}
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={customComponents}
            >
              {currentMarkdown}
            </ReactMarkdown>
          );
          currentMarkdown = '';
        }
        
        // Check if it's self-closing or has content
        if (line.includes('/>')) {
          elements.push(
            <div key={elements.length}>
              {renderMDXComponent('Footer')}
            </div>
          );
        } else {
          // Find the closing tag and extract content
          let footerContent = '';
          i++;
          while (i < lines.length && !lines[i].includes('</Footer>')) {
            footerContent += lines[i] + '\n';
            i++;
          }
          
          elements.push(
            <div key={elements.length}>
              {renderMDXComponent('Footer', {}, footerContent)}
            </div>
          );
        }
        i++;
        continue;
      }
      
      // Regular markdown line
      currentMarkdown += line + '\n';
      i++;
    }
    
    // Render any remaining markdown
    if (currentMarkdown.trim()) {
      elements.push(
        <ReactMarkdown
          key={elements.length}
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={customComponents}
        >
          {currentMarkdown}
        </ReactMarkdown>
      );
    }
    
    return elements;
  };

  const customComponents = {
    code({ inline, className, children, ...props }: Record<string, unknown>) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={syntaxTheme}
          language={match[1]}
          PreTag="div"
          customStyle={{
            borderRadius: '8px',
            margin: '16px 0',
            fontSize: '14px',
          }}
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code 
          className={className} 
          style={{
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.main,
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '0.9em',
            fontFamily: '"Fira Code", "Monaco", "Consolas", monospace',
          }}
          {...props}
        >
          {children}
        </code>
      );
    },
    h1: ({ children }: Record<string, unknown>) => (
      <Typography 
        variant="h3" 
        component="h1" 
        gutterBottom
        sx={{ 
          fontWeight: 700,
          color: theme.palette.text.primary,
          borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          paddingBottom: 1,
          marginBottom: 3,
          marginTop: 4,
        }}
      >
        {children}
      </Typography>
    ),
    h2: ({ children }: Record<string, unknown>) => (
      <Typography 
        variant="h4" 
        component="h2" 
        gutterBottom
        sx={{ 
          fontWeight: 600,
          color: theme.palette.text.primary,
          marginTop: 4,
          marginBottom: 2,
        }}
      >
        {children}
      </Typography>
    ),
    h3: ({ children }: Record<string, unknown>) => (
      <Typography 
        variant="h5" 
        component="h3" 
        gutterBottom
        sx={{ 
          fontWeight: 600,
          color: theme.palette.text.primary,
          marginTop: 3,
          marginBottom: 1.5,
        }}
      >
        {children}
      </Typography>
    ),
    p: ({ children }: Record<string, unknown>) => (
      <Typography 
        variant="body1" 
        paragraph
        sx={{ 
          lineHeight: 1.7,
          marginBottom: 2,
          color: theme.palette.text.primary,
        }}
      >
        {children}
      </Typography>
    ),
    blockquote: ({ children }: Record<string, unknown>) => (
      <Box
        sx={{
          borderLeft: `4px solid ${theme.palette.primary.main}`,
          backgroundColor: alpha(theme.palette.primary.main, 0.05),
          padding: 2,
          margin: '16px 0',
          borderRadius: '0 8px 8px 0',
          fontStyle: 'italic',
        }}
      >
        {children}
      </Box>
    ),
    ul: ({ children }: Record<string, unknown>) => (
      <Box 
        component="ul" 
        sx={{ 
          paddingLeft: 3, 
          marginBottom: 2,
          listStyleType: 'disc',
          listStylePosition: 'outside',
          '& ul': {
            listStyleType: 'circle',
            '& ul': {
              listStyleType: 'square',
            },
          },
        }}
      >
        {children}
      </Box>
    ),
    ol: ({ children }: Record<string, unknown>) => (
      <Box 
        component="ol" 
        sx={{ 
          paddingLeft: 3, 
          marginBottom: 2,
          listStyleType: 'decimal',
          listStylePosition: 'outside',
          '& ol': {
            listStyleType: 'lower-alpha',
            '& ol': {
              listStyleType: 'lower-roman',
            },
          },
        }}
      >
        {children}
      </Box>
    ),
    li: ({ children }: Record<string, unknown>) => (
      <Typography 
        component="li" 
        sx={{ 
          marginBottom: 0.5, 
          lineHeight: 1.6,
          display: 'list-item',
          color: theme.palette.text.primary,
        }}
      >
        {children}
      </Typography>
    ),
    table: ({ children }: Record<string, unknown>) => (
      <Box 
        sx={{ 
          overflowX: 'auto',
          marginBottom: 2,
          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          borderRadius: 2,
        }}
      >
        <Box 
          component="table" 
          sx={{ 
            width: '100%',
            borderCollapse: 'collapse',
          }}
        >
          {children}
        </Box>
      </Box>
    ),
    th: ({ children }: Record<string, unknown>) => (
      <Box
        component="th"
        sx={{
          padding: 2,
          backgroundColor: alpha(theme.palette.primary.main, 0.1),
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          fontWeight: 600,
          textAlign: 'left',
        }}
      >
        {children}
      </Box>
    ),
    td: ({ children }: Record<string, unknown>) => (
      <Box
        component="td"
        sx={{
          padding: 2,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        {children}
      </Box>
    ),
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.background.paper,
        position: 'relative',
      }}
    >
      {/* Preview Header */}
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
          {mode.toUpperCase()} Preview
        </Typography>
      </Box>

      {/* Preview Content */}
      <Box
        sx={{
          flex: 1,
          padding: 3,
          overflow: 'auto',
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)'
            : 'linear-gradient(135deg, rgba(0,0,0,0.01) 0%, rgba(0,0,0,0.005) 100%)',
          '& > *:first-of-type': {
            marginTop: 0,
          },
          '& > *:last-child': {
            marginBottom: 0,
          },
          // Custom scrollbar
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: alpha(theme.palette.divider, 0.1),
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: alpha(theme.palette.primary.main, 0.3),
            borderRadius: '4px',
            '&:hover': {
              background: alpha(theme.palette.primary.main, 0.5),
            },
          },
        }}
      >
        {content.trim() === '' ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: theme.palette.text.secondary,
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Typography variant="h6" sx={{ opacity: 0.6, textAlign: 'center' }}>
              Start typing to see the preview...
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.4, textAlign: 'center' }}>
              Your {mode === 'markdown' ? 'Markdown' : 'MDX'} content will be rendered here in real-time
            </Typography>
          </Box>
        ) : (
          <Box>
            {mode === 'mdx' ? (
              <>{renderMDXContent(processedContent)}</>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[]}
                components={customComponents}
              >
                {processedContent}
              </ReactMarkdown>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};
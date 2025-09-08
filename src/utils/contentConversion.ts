import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import { marked } from 'marked';
import { compile } from '@mdx-js/mdx';
import { runSync } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
import React from 'react';

// Create turndown instance for HTML to Markdown conversion
const turndownService = new TurndownService({
  headingStyle: 'atx',
  hr: '---',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  fence: '```',
});

// Add GitHub Flavored Markdown support
turndownService.use(gfm);

// Custom rules for better conversion
turndownService.addRule('taskList', {
  filter: function(node) {
    return node.nodeName === 'UL' && node.classList.contains('task-list');
  },
  replacement: function(content) {
    return content;
  }
});

turndownService.addRule('taskItem', {
  filter: function(node) {
    return node.nodeName === 'LI' && node.classList.contains('task-item');
  },
  replacement: function(content, node) {
    const checkbox = node.querySelector('input[type=\"checkbox\"]');
    const checked = checkbox && checkbox.checked;
    return `- [${checked ? 'x' : ' '}] ${content.trim()}\n`;
  }
});

/**
 * Convert HTML content to Markdown
 */
export function htmlToMarkdown(html: string): string {
  if (!html || html.trim() === '') {
    return '';
  }
  
  try {
    return turndownService.turndown(html);
  } catch (error) {
    console.warn('Failed to convert HTML to Markdown:', error);
    return html; // Fallback to original HTML
  }
}

/**
 * Convert MDX content to HTML by processing MDX components
 */
export async function mdxToHtml(mdxContent: string): Promise<string> {
  try {
    console.log('Processing MDX content:', mdxContent.substring(0, 200) + '...');
    
    // For MDX content, we need to handle it differently than regular markdown
    // Since TipTap can't execute React components, we'll convert MDX syntax to HTML equivalents
    
    // First, handle JSX component syntax and convert to HTML representations
    let processedContent = mdxContent;
    
    // Convert Callout components to blockquote with classes
    processedContent = processedContent.replace(
      /<Callout type="(\w+)"[^>]*>([\s\S]*?)<\/Callout>/g,
      (match, type, content) => {
        console.log('Converting Callout:', match);
        const typeClass = type === 'info' ? 'info' : type === 'warning' ? 'warning' : type === 'success' ? 'success' : 'default';
        return `<blockquote class="callout callout-${typeClass}">${content.trim()}</blockquote>`;
      }
    );
    
    // Convert Counter components to a simple placeholder
    processedContent = processedContent.replace(
      /<Counter\s*\/>/g,
      (match) => {
        console.log('Converting Counter:', match);
        return '<div class="mdx-component mdx-counter">🔢 [Interactive Counter Component]</div>';
      }
    );
    
    // Convert ProgressBar components (handle both quoted and unquoted props)
    processedContent = processedContent.replace(
      /<ProgressBar\s+progress={(\d+)}\s+label={?["']([^"']+)["']?}?\s*\/>/g,
      (match, progress, label) => {
        console.log('Converting ProgressBar:', match, 'progress:', progress, 'label:', label);
        return `<div class="mdx-component mdx-progress">📊 <strong>${label}:</strong> ${progress}%</div>`;
      }
    );
    
    // Convert ThemeBox components
    processedContent = processedContent.replace(
      /<ThemeBox\s*\/>/g,
      (match) => {
        console.log('Converting ThemeBox:', match);
        return '<div class="mdx-component mdx-themebox">🎨 [Theme Box Component]</div>';
      }
    );
    
    // Convert Footer components
    processedContent = processedContent.replace(
      /<Footer\s*\/>/g,
      '<footer class="mdx-component mdx-footer">[Footer Component]</footer>'
    );
    
    // Remove export statements and convert inline component definitions
    processedContent = processedContent.replace(
      /export\s+const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\([\s\S]*?\);/g,
      ''
    );
    
    // Remove JSX comments
    processedContent = processedContent.replace(
      /\{\*[\s\S]*?\*\}/g,
      ''
    );
    
    // Now process the remaining markdown with marked
    const html = await markdownToHtml(processedContent);
    
    console.log('Final processed content before markdown conversion:', processedContent.substring(0, 300) + '...');
    console.log('MDX processed successfully:', html.substring(0, 300) + '...');
    return html;
    
  } catch (error) {
    console.warn('Failed to process MDX content:', error);
    // Fallback to regular markdown processing
    return await markdownToHtml(mdxContent);
  }
}

/**
 * Convert Markdown content to HTML (for rich text editor)
 */
export async function markdownToHtml(markdown: string): Promise<string> {
  if (!markdown || markdown.trim() === '') {
    return '';
  }
  
  try {
    // Configure marked for better MDX compatibility
    marked.setOptions({
      gfm: true,
      breaks: true,
      headerIds: false,
      mangle: false,
    });
    
    // Convert markdown to HTML
    const html = await marked.parse(markdown);
    return html;
  } catch (error) {
    console.warn('Failed to convert Markdown to HTML:', error);
    // Fallback to simple conversion
    return markdown
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }
}

/**
 * Detect if content is rendered HTML (not source markdown/MDX)
 */
export function isRenderedHtml(content: string): boolean {
  // More sophisticated detection for actual rendered HTML
  // This should distinguish between MDX source (with JSX) and rendered HTML output
  const htmlIndicators = [
    /<html\b/i,
    /<body\b/i,
    /<div\s+class=/i,
    /<p>.*<\/p>/i,
    /<h[1-6]>.*<\/h[1-6]>/i,
    /<strong>.*<\/strong>/i,
    /<em>.*<\/em>/i,
  ];
  
  // Check if content has multiple HTML indicators (likely rendered HTML)
  const matches = htmlIndicators.filter(pattern => pattern.test(content)).length;
  
  // Also check if it's a complete HTML document structure
  const hasHtmlStructure = /<html[^>]*>[\s\S]*<\/html>/i.test(content) || 
    (/<p>/i.test(content) && /<\/p>/i.test(content));
  
  return matches >= 2 || hasHtmlStructure;
}

/**
 * Detect if content is HTML or Markdown (legacy function for backward compatibility)
 */
export function isHtmlContent(content: string): boolean {
  return isRenderedHtml(content);
}

/**
 * Prepare content for rich text editor
 */
export async function prepareContentForRichEditor(content: string, mode: 'markdown' | 'mdx'): Promise<string> {
  // Simple approach: always convert for both markdown and MDX
  // Skip conversion only for obvious TipTap HTML output
  if (!content || content.trim() === '') {
    return content;
  }
  
  // Skip conversion only if content looks like TipTap editor output
  // TipTap wraps everything in <p> tags or specific HTML structure
  const isTipTapHtml = /^\s*<p[^>]*>[\s\S]*<\/p>\s*$/.test(content) || 
                      /^\s*<h[1-6][^>]*>[\s\S]*<\/h[1-6]>\s*$/.test(content);
  
  if (isTipTapHtml && !content.includes('export ')) {
    console.log(`${mode.toUpperCase()} content is already TipTap HTML:`, content.substring(0, 100) + '...');
    return content;
  }
  
  // Use different processors for MDX vs Markdown
  console.log(`Converting ${mode.toUpperCase()} to HTML:`, content.substring(0, 100) + '...');
  try {
    let html;
    if (mode === 'mdx') {
      // Use the specialized MDX processor
      html = await mdxToHtml(content);
    } else {
      // Use regular markdown processor
      html = await markdownToHtml(content);
    }
    console.log(`Converted ${mode.toUpperCase()} to HTML:`, html.substring(0, 100) + '...');
    return html;
  } catch (error) {
    console.warn(`Failed to convert ${mode.toUpperCase()} to HTML:`, error);
    return content;
  }
}

/**
 * Prepare content for code editor (convert from rich text if needed)
 */
export function prepareContentForCodeEditor(content: string, mode: 'markdown' | 'mdx'): string {
  // Simple check: if content looks like TipTap HTML, convert it back to markdown
  const isTipTapHtml = /^\s*<p[^>]*>[\s\S]*<\/p>\s*$/.test(content) || 
                      /^\s*<h[1-6][^>]*>[\s\S]*<\/h[1-6]>\s*$/.test(content) ||
                      (/<p[^>]*>/i.test(content) && /<\/p>/i.test(content));
  
  if (isTipTapHtml) {
    return htmlToMarkdown(content);
  }
  
  return content; // Already markdown/MDX
}
'use client';

import React, { useCallback, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { common, createLowlight } from 'lowlight';
import { 
  Box, 
  useTheme, 
  alpha, 
  Typography,
  Toolbar,
  IconButton,
  Divider,
  ButtonGroup,
  Tooltip
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  Code,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  Title,
  LooksOne,
  LooksTwo,
  Looks3
} from '@mui/icons-material';

const lowlight = createLowlight(common);

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  mode: 'markdown' | 'mdx';
  height?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  mode,
  height = '100%',
}) => {
  const theme = useTheme();
  const isUpdatingContent = React.useRef(false);
  const lastExternalContent = React.useRef(content);

  const extensions = useMemo(() => {
    try {
      return [
        StarterKit.configure({
          bulletList: {
            keepMarks: true,
            keepAttributes: false,
          },
          orderedList: {
            keepMarks: true,
            keepAttributes: false,
          },
        }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: 'rich-editor-link',
          },
        }),
        Image.configure({
          HTMLAttributes: {
            class: 'rich-editor-image',
          },
        }),
        CodeBlockLowlight.configure({
          lowlight,
          HTMLAttributes: {
            class: 'rich-editor-code-block',
          },
        }),
        TaskList,
        TaskItem.configure({
          nested: true,
        }),
      ];
    } catch (error) {
      console.error('Error configuring TipTap extensions:', error);
      // Fallback to basic extensions
      return [
        StarterKit,
      ];
    }
  }, []);

  const editor = useEditor({
    extensions,
    content,
    immediatelyRender: false, // Fix SSR hydration mismatch
    onUpdate: ({ editor }) => {
      // Only call onChange if this is a user-initiated change, not programmatic
      if (!isUpdatingContent.current) {
        const html = editor.getHTML();
        lastExternalContent.current = html; // Update our reference to prevent unnecessary resets
        onChange(html);
      }
    },
    editorProps: {
      attributes: {
        class: 'rich-editor-content',
      },
    },
  });

  // Update editor content when prop changes
  React.useEffect(() => {
    if (!editor) return;

    // Get current editor HTML content
    const currentEditorContent = editor.getHTML();
    
    // Only update if this is a real external content change, not from user typing
    // We compare both against last external content AND current editor content
    const isExternalChange = content !== lastExternalContent.current && 
                           content !== currentEditorContent && 
                           !isUpdatingContent.current;
    
    if (isExternalChange) {
      // Set flag to prevent triggering onChange during programmatic updates
      isUpdatingContent.current = true;
      
      // Store the new external content
      lastExternalContent.current = content;
      
      // Store current cursor position before updating content
      const { from } = editor.state.selection;
      const wasAtEnd = from === editor.state.doc.content.size;
      
      // Update content without emitting update event
      editor.commands.setContent(content, { emitUpdate: false });
      
      // Restore cursor position after content update
      setTimeout(() => {
        try {
          if (wasAtEnd) {
            // If cursor was at end, move to new end
            editor.commands.focus('end');
          } else {
            // Try to maintain relative position
            const newDocSize = editor.state.doc.content.size;
            const newPos = Math.min(from, newDocSize);
            editor.commands.setTextSelection(newPos);
          }
        } catch {
          // Fallback: just focus the editor
          editor.commands.focus();
        }
        
        // Reset updating flag
        isUpdatingContent.current = false;
      }, 0);
    }
  }, [editor, content]);

  const setLink = useCallback(() => {
    if (!editor) return;
    
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    
    const url = window.prompt('Image URL');

    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const insertTable = useCallback(() => {
    if (!editor) return;
    
    try {
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    } catch (error) {
      console.error('Error inserting table:', error);
      // Fallback notification
      alert('Table insertion is temporarily unavailable');
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

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
          {mode.toUpperCase()} Rich Text Editor
        </Typography>
      </Box>

      {/* Toolbar */}
      <Toolbar
        variant="dense"
        sx={{
          minHeight: '48px !important',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          backgroundColor: alpha(theme.palette.background.default, 0.3),
          gap: 1,
          flexWrap: 'wrap',
          justifyContent: 'flex-start',
        }}
      >
        {/* History */}
        <ButtonGroup size="small" variant="outlined">
          <Tooltip title="Undo">
            <IconButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().chain().focus().undo().run()}
              size="small"
            >
              <Undo fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Redo">
            <IconButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().chain().focus().redo().run()}
              size="small"
            >
              <Redo fontSize="small" />
            </IconButton>
          </Tooltip>
        </ButtonGroup>

        <Divider orientation="vertical" flexItem />

        {/* Headings */}
        <ButtonGroup size="small" variant="outlined">
          <Tooltip title="Heading 1">
            <IconButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              color={editor.isActive('heading', { level: 1 }) ? 'primary' : 'default'}
              size="small"
            >
              <LooksOne fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Heading 2">
            <IconButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              color={editor.isActive('heading', { level: 2 }) ? 'primary' : 'default'}
              size="small"
            >
              <LooksTwo fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Heading 3">
            <IconButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              color={editor.isActive('heading', { level: 3 }) ? 'primary' : 'default'}
              size="small"
            >
              <Looks3 fontSize="small" />
            </IconButton>
          </Tooltip>
        </ButtonGroup>

        <Divider orientation="vertical" flexItem />

        {/* Text Formatting */}
        <ButtonGroup size="small" variant="outlined">
          <Tooltip title="Bold">
            <IconButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              color={editor.isActive('bold') ? 'primary' : 'default'}
              size="small"
            >
              <FormatBold fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Italic">
            <IconButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              color={editor.isActive('italic') ? 'primary' : 'default'}
              size="small"
            >
              <FormatItalic fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Code">
            <IconButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              color={editor.isActive('code') ? 'primary' : 'default'}
              size="small"
            >
              <Code fontSize="small" />
            </IconButton>
          </Tooltip>
        </ButtonGroup>

        <Divider orientation="vertical" flexItem />

        {/* Lists */}
        <ButtonGroup size="small" variant="outlined">
          <Tooltip title="Bullet List">
            <IconButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              color={editor.isActive('bulletList') ? 'primary' : 'default'}
              size="small"
            >
              <FormatListBulleted fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Numbered List">
            <IconButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              color={editor.isActive('orderedList') ? 'primary' : 'default'}
              size="small"
            >
              <FormatListNumbered fontSize="small" />
            </IconButton>
          </Tooltip>
        </ButtonGroup>

        <Divider orientation="vertical" flexItem />

        {/* Quote */}
        <Tooltip title="Quote">
          <IconButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            color={editor.isActive('blockquote') ? 'primary' : 'default'}
            size="small"
          >
            <FormatQuote fontSize="small" />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem />

        {/* Media & Links */}
        <ButtonGroup size="small" variant="outlined">
          <Tooltip title="Add Link">
            <IconButton onClick={setLink} size="small">
              <LinkIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Add Image">
            <IconButton onClick={addImage} size="small">
              <ImageIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </ButtonGroup>
      </Toolbar>

      {/* Editor Content */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          position: 'relative',
          // Custom styles for TipTap editor
          '& .rich-editor-content': {
            outline: 'none',
            padding: 3,
            minHeight: '100%',
            fontFamily: theme.typography.body1.fontFamily,
            fontSize: theme.typography.body1.fontSize,
            lineHeight: 1.7,
            color: theme.palette.text.primary,
            '& h1': {
              fontSize: '2.5rem',
              fontWeight: 700,
              marginTop: '2rem',
              marginBottom: '1rem',
              borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              paddingBottom: '0.5rem',
              color: theme.palette.text.primary,
            },
            '& h2': {
              fontSize: '2rem',
              fontWeight: 600,
              marginTop: '1.5rem',
              marginBottom: '0.75rem',
              color: theme.palette.text.primary,
            },
            '& h3': {
              fontSize: '1.5rem',
              fontWeight: 600,
              marginTop: '1.25rem',
              marginBottom: '0.5rem',
              color: theme.palette.text.primary,
            },
            '& p': {
              marginBottom: '1rem',
              color: theme.palette.text.primary,
            },
            '& ul, & ol': {
              paddingLeft: '1.5rem',
              marginBottom: '1rem',
            },
            '& ul': {
              listStyleType: 'disc',
              listStylePosition: 'outside',
              '& ul': {
                listStyleType: 'circle',
                '& ul': {
                  listStyleType: 'square',
                },
              },
            },
            '& ol': {
              listStyleType: 'decimal',
              listStylePosition: 'outside',
              '& ol': {
                listStyleType: 'lower-alpha',
                '& ol': {
                  listStyleType: 'lower-roman',
                },
              },
            },
            '& li': {
              marginBottom: '0.25rem',
              display: 'list-item',
              color: theme.palette.text.primary,
            },
            '& blockquote': {
              borderLeft: `4px solid ${theme.palette.primary.main}`,
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
              padding: '1rem',
              margin: '1rem 0',
              borderRadius: '0 8px 8px 0',
              fontStyle: 'italic',
            },
            '& code': {
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '0.9em',
              fontFamily: '"Fira Code", "Monaco", "Consolas", monospace',
            },
            '& .rich-editor-code-block': {
              backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5',
              borderRadius: '8px',
              padding: '1rem',
              margin: '1rem 0',
              overflow: 'auto',
              fontFamily: '"Fira Code", "Monaco", "Consolas", monospace',
              fontSize: '0.9em',
              '& pre': {
                margin: 0,
                background: 'transparent',
              },
            },
            '& .rich-editor-link': {
              color: theme.palette.primary.main,
              textDecoration: 'underline',
              '&:hover': {
                color: theme.palette.primary.dark,
              },
            },
            '& .rich-editor-image': {
              maxWidth: '100%',
              height: 'auto',
              borderRadius: '8px',
              margin: '1rem 0',
            },
            '& table': {
              borderCollapse: 'collapse',
              width: '100%',
              margin: '1rem 0',
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              borderRadius: '8px',
              overflow: 'hidden',
            },
            '& th, & td': {
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              padding: '0.75rem',
              textAlign: 'left',
            },
            '& th': {
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              fontWeight: 600,
            },
            '& .task-list': {
              listStyle: 'none',
              paddingLeft: 0,
            },
            '& .task-item': {
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
              marginBottom: '0.5rem',
            },
            // MDX Component Styles
            '& .mdx-component': {
              margin: '1rem 0',
              padding: '0.75rem',
              borderRadius: '6px',
              fontSize: '0.9em',
              fontWeight: 500,
            },
            '& .mdx-counter': {
              backgroundColor: alpha(theme.palette.info.main, 0.1),
              color: theme.palette.info.main,
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              textAlign: 'center',
            },
            '& .mdx-progress': {
              backgroundColor: alpha(theme.palette.success.main, 0.1),
              color: theme.palette.success.main,
              border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
            },
            '& .mdx-themebox': {
              backgroundColor: alpha(theme.palette.secondary.main, 0.1),
              color: theme.palette.secondary.main,
              border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
              textAlign: 'center',
            },
            '& .mdx-footer': {
              backgroundColor: alpha(theme.palette.grey[500], 0.1),
              color: theme.palette.text.secondary,
              border: `1px solid ${alpha(theme.palette.grey[500], 0.2)}`,
              textAlign: 'center',
              fontStyle: 'italic',
            },
            // Callout Styles
            '& .callout': {
              margin: '1rem 0',
              padding: '1rem',
              borderRadius: '8px',
              borderLeft: '4px solid',
              '&.callout-info': {
                backgroundColor: alpha(theme.palette.info.main, 0.05),
                borderLeftColor: theme.palette.info.main,
                color: theme.palette.info.main,
              },
              '&.callout-warning': {
                backgroundColor: alpha(theme.palette.warning.main, 0.05),
                borderLeftColor: theme.palette.warning.main,
                color: theme.palette.warning.main,
              },
              '&.callout-success': {
                backgroundColor: alpha(theme.palette.success.main, 0.05),
                borderLeftColor: theme.palette.success.main,
                color: theme.palette.success.main,
              },
              '&.callout-default': {
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                borderLeftColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
              },
            },
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>
    </Box>
  );
};
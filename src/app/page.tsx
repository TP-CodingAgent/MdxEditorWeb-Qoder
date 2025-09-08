'use client';

import React from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Grid,
  Chip,
  useTheme,
  Fade,
  Slide,
  alpha,
} from '@mui/material';
import {
  Description,
  Code,
  ArrowForward,
  Preview,
  Psychology,
  Speed,
  Devices,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { ThemeSwitch } from '@/components/ThemeSwitch';
import { useResponsive } from '@/utils/responsive';

export default function HomePage() {
  const theme = useTheme();
  const router = useRouter();
  const { isMobile } = useResponsive();

  const handleStartEditing = (mode: 'markdown' | 'mdx') => {
    router.push(`/editor?mode=${mode}`);
  };

  const editorOptions = [
    {
      id: 'markdown',
      title: 'Markdown Editor',
      description: 'Pure Markdown editing with live preview. Perfect for documentation, blogs, and simple content creation.',
      icon: <Description sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
      features: ['Live Preview', 'Syntax Highlighting', 'Export Options', 'AI Assistance'],
      color: theme.palette.primary.main,
    },
    {
      id: 'mdx',
      title: 'MDX Editor',
      description: 'Enhanced Markdown with React components. Ideal for interactive documentation and rich content.',
      icon: <Code sx={{ fontSize: 48, color: theme.palette.secondary.main }} />,
      features: ['React Components', 'Live Preview', 'Advanced Formatting', 'AI Assistance'],
      color: theme.palette.secondary.main,
    },
  ];

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: theme.palette.mode === 'dark'
            ? 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)'
            : 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%)',
          pointerEvents: 'none',
        }
      }}
    >
      {/* Header */}
      <Box
        sx={{
          py: 3,
          px: 4,
          backdropFilter: 'blur(10px)',
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
            }}
          >
            <Code sx={{ color: 'white', fontSize: 20 }} />
          </Box>
          <Typography 
            variant="h5" 
            fontWeight="700" 
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            MDX Editor
          </Typography>
        </Box>
        <ThemeSwitch />
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 8, position: 'relative', zIndex: 1 }}>
        {/* Hero Section */}
        <Fade in timeout={1000}>
          <Box sx={{ textAlign: 'center', mb: 12 }}>
            <Typography
              variant={isMobile ? 'h2' : 'h1'}
              fontWeight="800"
              gutterBottom
              sx={{ 
                mb: 4,
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)'
                  : 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: isMobile ? '2.5rem' : '4rem',
                lineHeight: 1.1,
              }}
            >
              Create Beautiful
              <br />
              <Box component="span" sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                MDX Content
              </Box>
            </Typography>
            
            <Typography
              variant={isMobile ? 'h6' : 'h5'}
              color="text.secondary"
              sx={{ 
                mb: 6, 
                maxWidth: '700px', 
                mx: 'auto',
                fontWeight: 400,
                lineHeight: 1.6,
              }}
            >
              The most powerful editor for Markdown and MDX content with live preview,
              AI assistance, and modern editing features that developers love.
            </Typography>
            
            {/* Feature highlights */}
            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap', mb: 8 }}>
              {[
                { icon: <Preview />, label: 'Live Preview', color: '#10b981' },
                { icon: <Psychology />, label: 'AI Powered', color: '#8b5cf6' },
                { icon: <Speed />, label: 'Lightning Fast', color: '#f59e0b' },
                { icon: <Devices />, label: 'Responsive', color: '#ef4444' }
              ].map((feature, index) => (
                <Slide key={feature.label} direction="up" in timeout={1200 + index * 200}>
                  <Chip 
                    icon={React.cloneElement(feature.icon, { sx: { color: feature.color } })}
                    label={feature.label} 
                    variant="outlined"
                    sx={{
                      borderColor: feature.color,
                      color: feature.color,
                      backgroundColor: alpha(feature.color, 0.1),
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      height: 40,
                      '&:hover': {
                        backgroundColor: alpha(feature.color, 0.2),
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 25px ${alpha(feature.color, 0.3)}`,
                      },
                      transition: 'all 0.3s ease',
                    }}
                  />
                </Slide>
              ))}
            </Box>
          </Box>
        </Fade>

        {/* Editor Options */}
        <Fade in timeout={1500}>
          <Typography 
            variant="h3" 
            fontWeight="700" 
            textAlign="center" 
            sx={{ 
              mb: 8,
              color: theme.palette.text.primary,
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -16,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 80,
                height: 4,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 2,
              }
            }}
          >
            Choose Your Editor
          </Typography>
        </Fade>
        
        <Grid container spacing={6} justifyContent="center" alignItems="stretch" sx={{ 
          maxWidth: '1000px', 
          mx: 'auto',
          '& .MuiGrid-item': {
            display: 'flex !important',
            '& > *': {
              width: '100%',
              flex: 1
            }
          }
        }}>
          {editorOptions.map((option, index) => (
            <Grid size={{ xs: 12, md: 6, lg: 6 }} key={option.id} sx={{ display: 'flex', width: '100%', maxWidth: { md: '480px', lg: '480px' } }}>
              <Slide direction="up" in timeout={1800 + index * 300} style={{ width: '100%' }}>
                <Card
                  sx={{
                    width: '100%',
                    height: '100%',
                    minHeight: '420px',
                    maxWidth: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    background: theme.palette.mode === 'dark'
                      ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
                      : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                    borderRadius: 3,
                    overflow: 'hidden',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: `linear-gradient(135deg, ${option.color} 0%, ${alpha(option.color, 0.6)} 100%)`,
                    },
                    '&:hover': {
                      transform: 'translateY(-12px) scale(1.02)',
                      boxShadow: `0 25px 50px ${alpha(option.color, 0.25)}`,
                      '&::before': {
                        height: 6,
                      },
                    },
                  }}
                  onClick={() => handleStartEditing(option.id as 'markdown' | 'mdx')}
                >
                  <CardContent sx={{ flexGrow: 1, p: 5, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: '20px',
                          background: `linear-gradient(135deg, ${option.color} 0%, ${alpha(option.color, 0.7)} 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto',
                          boxShadow: `0 12px 40px ${alpha(option.color, 0.3)}`,
                          transform: 'perspective(1000px) rotateX(10deg)',
                        }}
                      >
                        {React.cloneElement(option.icon, { 
                          sx: { fontSize: 36, color: 'white' } 
                        })}
                      </Box>
                    </Box>
                    
                    <Typography 
                      variant="h4" 
                      fontWeight="700" 
                      gutterBottom 
                      textAlign="center"
                      sx={{ mb: 3 }}
                    >
                      {option.title}
                    </Typography>
                    
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ 
                        mb: 4, 
                        textAlign: 'center', 
                        minHeight: '80px',
                        fontSize: '1.1rem',
                        lineHeight: 1.6,
                        flex: '1 0 auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {option.description}
                    </Typography>
                    
                    {/* Features */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', mt: 'auto' }}>
                      {option.features.map((feature, featureIndex) => (
                        <Chip
                          key={feature}
                          label={feature}
                          size="medium"
                          sx={{
                            backgroundColor: alpha(option.color, 0.1),
                            color: option.color,
                            borderColor: alpha(option.color, 0.3),
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            '&:hover': {
                              backgroundColor: alpha(option.color, 0.2),
                              transform: 'translateY(-2px)',
                            },
                            transition: 'all 0.3s ease',
                            animationDelay: `${featureIndex * 100}ms`,
                          }}
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </CardContent>
                
                  <CardActions sx={{ p: 5, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      endIcon={<ArrowForward />}
                      sx={{
                        background: `linear-gradient(135deg, ${option.color} 0%, ${alpha(option.color, 0.8)} 100%)`,
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        height: 56,
                        borderRadius: 2,
                        textTransform: 'none',
                        boxShadow: `0 8px 25px ${alpha(option.color, 0.3)}`,
                        '&:hover': {
                          background: `linear-gradient(135deg, ${option.color} 0%, ${alpha(option.color, 0.9)} 100%)`,
                          transform: 'translateY(-2px)',
                          boxShadow: `0 12px 35px ${alpha(option.color, 0.4)}`,
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleStartEditing(option.id as 'markdown' | 'mdx');
                      }}
                    >
                      Start {option.title}
                    </Button>
                  </CardActions>
                </Card>
              </Slide>
            </Grid>
          ))}
        </Grid>

        {/* Additional Info */}
        <Fade in timeout={2500}>
          <Box sx={{ mt: 16, textAlign: 'center' }}>
            <Typography 
              variant="h4" 
              fontWeight="700" 
              gutterBottom
              sx={{ mb: 8, color: theme.palette.text.primary }}
            >
              Why Choose MDX Editor?
            </Typography>
            <Grid container spacing={6} sx={{ 
              mt: 2, 
              maxWidth: '1200px', 
              mx: 'auto',
              '& .MuiGrid-item': {
                display: 'flex !important',
                '& > *': {
                  width: '100%',
                  flex: 1
                }
              }
            }} justifyContent="center" alignItems="stretch">
              {[
                {
                  title: 'Real-time Preview',
                  description: 'See your content rendered as you type with instant feedback and live updates.',
                  icon: <Preview sx={{ fontSize: 40 }} />,
                  color: '#10b981'
                },
                {
                  title: 'AI Assistant',
                  description: 'Get intelligent suggestions and content improvements with cutting-edge AI.',
                  icon: <Psychology sx={{ fontSize: 40 }} />,
                  color: '#8b5cf6'
                },
                {
                  title: 'Responsive Design',
                  description: 'Works seamlessly on desktop, tablet, and mobile devices with adaptive layouts.',
                  icon: <Devices sx={{ fontSize: 40 }} />,
                  color: '#ef4444'
                }
              ].map((feature, index) => (
                <Grid size={{ xs: 12, sm: 4, md: 4, lg: 4 }} key={feature.title} sx={{ display: 'flex', maxWidth: { sm: '320px', md: '350px', lg: '380px' } }}>
                  <Slide direction="up" in timeout={2800 + index * 200}>
                    <Box
                      sx={{
                        p: 4,
                        borderRadius: 3,
                        background: theme.palette.mode === 'dark'
                          ? 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)'
                          : 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.3) 100%)',
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        transition: 'all 0.3s ease',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: '280px',
                        width: '100%',
                        maxWidth: '100%',
                        flex: 1,
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: `0 20px 40px ${alpha(feature.color, 0.2)}`,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 70,
                          height: 70,
                          borderRadius: '16px',
                          background: `linear-gradient(135deg, ${feature.color} 0%, ${alpha(feature.color, 0.7)} 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 24px',
                          boxShadow: `0 8px 25px ${alpha(feature.color, 0.3)}`,
                        }}
                      >
                        {React.cloneElement(feature.icon, { sx: { color: 'white' } })}
                      </Box>
                      <Typography variant="h5" fontWeight="700" gutterBottom textAlign="center">
                        {feature.title}
                      </Typography>
                      <Typography 
                        variant="body1" 
                        color="text.secondary"
                        sx={{ 
                          lineHeight: 1.6, 
                          fontSize: '1.05rem',
                          textAlign: 'center',
                          flex: '1 0 auto',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {feature.description}
                      </Typography>
                    </Box>
                  </Slide>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}

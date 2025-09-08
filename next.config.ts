import type { NextConfig } from "next";
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: true, // Automatically open the report in browser
});

const nextConfig: NextConfig = {
  /* config options here */
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
  // Optimize bundle splitting
  experimental: {
    optimizePackageImports: [
      '@mui/material',
      '@mui/icons-material',
      '@tiptap/core',
      '@tiptap/react',
      'react-syntax-highlighter'
    ],
  },
};

export default withBundleAnalyzer(nextConfig);

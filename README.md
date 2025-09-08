This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Bundle Analysis

This project includes `@next/bundle-analyzer` for analyzing bundle sizes and identifying optimization opportunities.

### Available Commands

```bash
# Analyze both client and server bundles
yarn analyze

# Analyze server-side bundle only
yarn analyze:server

# Analyze client-side bundle only  
yarn analyze:browser
```

### What to Look For

- **Large Dependencies**: Identify which packages are taking up the most space
- **Duplicate Code**: Find code that's being included multiple times
- **Unused Code**: Spot potential tree-shaking opportunities
- **Code Splitting**: Ensure proper chunking for optimal loading

### Key Dependencies to Monitor

This project uses several large dependencies that should be monitored:
- **Material UI** (`@mui/material`, `@mui/icons-material`)
- **Monaco Editor** (`@monaco-editor/react`, `monaco-editor`)
- **TipTap Editor** (`@tiptap/*` packages)
- **AI SDK** (`@ai-sdk/*` packages)
- **Syntax Highlighting** (`react-syntax-highlighter`, `highlight.js`)

### Optimization Tips

1. **Tree Shaking**: Import only specific components/functions needed
2. **Code Splitting**: Use dynamic imports for large components
3. **Bundle Splitting**: Configure Next.js to split bundles optimally
4. **Package Optimization**: The config includes `optimizePackageImports` for major packages

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

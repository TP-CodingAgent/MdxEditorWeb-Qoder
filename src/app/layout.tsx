import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeContextProvider } from '@/context/ThemeContext';
import { AIContextProvider } from '@/lib/ai';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MDX Editor",
  description: "A powerful MDX editor with live preview and AI assistance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeContextProvider>
          <AIContextProvider defaultProvider="gemini">
            {children}
          </AIContextProvider>
        </ThemeContextProvider>
      </body>
    </html>
  );
}

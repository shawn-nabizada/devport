import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { LanguageProvider } from '@/lib/i18n';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Navbar } from '@/components/navbar';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'DevPort - Professional Portfolio Platform',
    template: '%s | DevPort',
  },
  description: 'Build your professional portfolio with DevPort. Showcase your skills, projects, and experience in both English and French.',
  keywords: ['portfolio', 'developer', 'professional', 'resume', 'cv', 'bilingual', 'career'],
  authors: [{ name: 'DevPort' }],
  creator: 'DevPort',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'fr_CA',
    siteName: 'DevPort',
    title: 'DevPort - Professional Portfolio Platform',
    description: 'Build your professional portfolio with DevPort. Showcase your skills, projects, and experience.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DevPort - Professional Portfolio Platform',
    description: 'Build your professional portfolio with DevPort.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[1000] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none"
        >
          Skip to main content
        </a>
        <ThemeProvider defaultTheme="system" storageKey="devport-theme">
          <SessionProvider>
            <LanguageProvider>
              <Navbar />
              <main id="main-content" className="pt-24">{children}</main>
              <Toaster richColors position="bottom-right" />
            </LanguageProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}



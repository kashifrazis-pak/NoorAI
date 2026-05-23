import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { I18nProvider } from '@/components/layout/I18nProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: { default: 'NoorAI — Islamic Q&A', template: '%s | NoorAI' },
  description: 'AI-powered Islamic Q&A grounded in the Quran and authentic Sunnah. Every answer is citation-verified.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'NoorAI' },
  openGraph: {
    title: 'NoorAI — Islamic Q&A',
    description: 'AI-powered Islamic Q&A grounded in the Quran and authentic Sunnah.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#40915f',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="font-sans antialiased">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { I18nProvider } from '@/components/layout/I18nProvider';
import { Navbar } from '@/components/layout/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NoorAI — Islamic Q&A',
  description: 'AI-powered Islamic Q&A rooted in the Quran and authentic Sunnah',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'NoorAI',
  },
  openGraph: {
    title: 'NoorAI',
    description: 'Answers rooted in the Quran and authentic Sunnah',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#1A5C38',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <I18nProvider>
          <div className="min-h-screen bg-stone-50">
            <Navbar />
            <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
            <footer className="text-center py-6 text-sm text-stone-400 border-t border-stone-200 mt-12">
              <p>
                NoorAI — for educational purposes only. Not a fatwa.{' '}
                <a href="/about" className="text-green-700 hover:underline">
                  About our sources
                </a>
              </p>
            </footer>
          </div>
        </I18nProvider>
      </body>
    </html>
  );
}

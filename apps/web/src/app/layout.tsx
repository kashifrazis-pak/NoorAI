import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { I18nProvider } from '@/components/layout/I18nProvider';
import { Navbar } from '@/components/layout/Navbar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

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
  themeColor: '#40915f',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="font-sans antialiased bg-cream-50 text-sage-950">
        <I18nProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <footer className="border-t border-sage-100 bg-white/60 py-5 mt-16">
              <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-sage-400">
                <p>NoorAI — for educational purposes only. Not a fatwa.</p>
                <div className="flex items-center gap-4">
                  <a href="/about" className="hover:text-sage-600 transition-colors">About our sources</a>
                  <span>·</span>
                  <a href="/search" className="hover:text-sage-600 transition-colors">Search</a>
                </div>
              </div>
            </footer>
          </div>
        </I18nProvider>
      </body>
    </html>
  );
}

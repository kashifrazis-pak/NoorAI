import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { I18nProvider } from '@/components/layout/I18nProvider';
import { Sidebar } from '@/components/layout/Sidebar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'NoorAI — Islamic Q&A',
  description: 'AI-powered Islamic Q&A rooted in the Quran and authentic Sunnah',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'NoorAI' },
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
      <body className="font-sans antialiased bg-cream-50 text-sage-900 overflow-hidden h-screen">
        <I18nProvider>
          <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </I18nProvider>
      </body>
    </html>
  );
}

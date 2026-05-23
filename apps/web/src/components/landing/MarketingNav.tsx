'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Logo } from '@/components/ui/Logo';

const LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#sources', label: 'Sources' },
  { href: '#faq', label: 'FAQ' },
];

export function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-lg border-b border-sage-100 shadow-soft'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/home" className="flex items-center gap-2.5 group">
          <Logo size={32} />
          <span className="text-lg font-bold text-sage-900 tracking-tight">NoorAI</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="px-4 py-2 rounded-xl text-sm font-medium text-sage-600
                         hover:bg-sage-50 hover:text-sage-900 transition-colors"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/app/ask"
            className="text-sm font-medium text-sage-600 hover:text-sage-900 px-3 py-2 transition-colors">
            Sign in
          </Link>
          <Link href="/app/ask"
            className="bg-sage-600 hover:bg-sage-700 text-white text-sm font-semibold
                       px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all duration-150">
            Ask a question →
          </Link>
        </div>

        {/* Mobile burger */}
        <button
          className="md:hidden p-2 rounded-xl text-sage-600 hover:bg-sage-50 transition-colors"
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            {menuOpen
              ? <path fillRule="evenodd" clipRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
              : <path fillRule="evenodd" clipRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
            }
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-sage-100 px-5 py-4 space-y-1 animate-fade-in">
          {LINKS.map(({ href, label }) => (
            <a key={href} href={href} onClick={() => setMenuOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-sm font-medium text-sage-700 hover:bg-sage-50">
              {label}
            </a>
          ))}
          <div className="pt-2 border-t border-sage-100 mt-2 flex flex-col gap-2">
            <Link href="/app/ask" onClick={() => setMenuOpen(false)}
              className="block text-center bg-sage-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl">
              Ask a question →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

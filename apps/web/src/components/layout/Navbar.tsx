'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Logo } from '@/components/ui/Logo';

const NAV_LINKS = [
  { href: '/', label: 'Ask' },
  { href: '/search', label: 'Search' },
  { href: '/about', label: 'About' },
];

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-sage-100 shadow-soft">
      <div className="max-w-5xl mx-auto px-4 h-15 flex items-center justify-between" style={{ height: '60px' }}>

        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group" aria-label="NoorAI home">
          <Logo size={34} />
          <div className="flex flex-col leading-none">
            <span className="text-base font-bold text-sage-900 tracking-tight">NoorAI</span>
            <span className="text-[10px] text-sage-500 font-medium tracking-wide">نور الإسلام</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-150 ${
                pathname === href
                  ? 'bg-sage-50 text-sage-800'
                  : 'text-sage-600 hover:bg-sage-50 hover:text-sage-800'
              }`}
            >
              {label}
            </Link>
          ))}
          <div className="w-px h-5 bg-sage-200 mx-2" />
          <Link
            href="/login"
            className="btn-primary text-sm px-4 py-2"
          >
            Sign in
          </Link>
        </nav>

        {/* Mobile burger */}
        <button
          className="sm:hidden p-2 rounded-lg text-sage-600 hover:bg-sage-50 transition-colors"
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            {menuOpen ? (
              <path fillRule="evenodd" clipRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
            ) : (
              <path fillRule="evenodd" clipRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="sm:hidden border-t border-sage-100 bg-white/95 backdrop-blur-md px-4 py-3 space-y-1 animate-fade-in">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                pathname === href
                  ? 'bg-sage-50 text-sage-800'
                  : 'text-sage-600 hover:bg-sage-50'
              }`}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            className="block mt-2 btn-primary text-center"
          >
            Sign in
          </Link>
        </div>
      )}
    </header>
  );
}

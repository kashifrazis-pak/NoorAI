'use client';

import Link from 'next/link';
import { useState } from 'react';

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-green-900 text-white shadow-md">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold">نور</span>
          <span className="text-lg font-semibold text-green-300">NoorAI</span>
        </Link>

        <div className="hidden sm:flex items-center gap-6 text-sm">
          <Link href="/" className="hover:text-green-300 transition-colors">Ask</Link>
          <Link href="/search" className="hover:text-green-300 transition-colors">Search</Link>
          <Link href="/about" className="hover:text-green-300 transition-colors">About</Link>
          <Link
            href="/login"
            className="bg-green-700 hover:bg-green-600 px-4 py-1.5 rounded-full transition-colors"
          >
            Sign in
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="sm:hidden p-2"
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu"
        >
          <span className="block w-5 h-0.5 bg-white mb-1" />
          <span className="block w-5 h-0.5 bg-white mb-1" />
          <span className="block w-5 h-0.5 bg-white" />
        </button>
      </div>

      {menuOpen && (
        <div className="sm:hidden bg-green-800 px-4 py-3 space-y-3 text-sm">
          <Link href="/" className="block hover:text-green-300" onClick={() => setMenuOpen(false)}>Ask</Link>
          <Link href="/search" className="block hover:text-green-300" onClick={() => setMenuOpen(false)}>Search</Link>
          <Link href="/about" className="block hover:text-green-300" onClick={() => setMenuOpen(false)}>About</Link>
          <Link href="/login" className="block hover:text-green-300" onClick={() => setMenuOpen(false)}>Sign in</Link>
        </div>
      )}
    </nav>
  );
}

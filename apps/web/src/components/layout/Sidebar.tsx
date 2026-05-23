'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Logo } from '@/components/ui/Logo';

const RECENT_QUESTIONS = [
  'What does Islam say about patience?',
  'How to perform Wudu correctly?',
  'Importance of Tahajjud prayer',
];

function NavItem({
  href,
  icon,
  label,
  onClick,
}: {
  href?: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const active = href ? pathname === href : false;

  const cls = `flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium
    transition-colors duration-100 group
    ${active
      ? 'bg-sage-100 text-sage-900'
      : 'text-sage-600 hover:bg-sage-50 hover:text-sage-800'
    }`;

  if (href) {
    return (
      <Link href={href} className={cls}>
        <span className="w-4 h-4 flex items-center justify-center text-sage-400 group-hover:text-sage-600 transition-colors">
          {icon}
        </span>
        {label}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={cls}>
      <span className="w-4 h-4 flex items-center justify-center text-sage-400 group-hover:text-sage-600 transition-colors">
        {icon}
      </span>
      {label}
    </button>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <aside className="w-14 flex flex-col h-screen bg-white border-r border-sage-100 py-4 items-center gap-3">
        <button
          onClick={() => setCollapsed(false)}
          className="p-2 rounded-xl hover:bg-sage-50 text-sage-500"
          aria-label="Expand sidebar"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <rect x="2" y="3" width="12" height="1.5" rx="0.75"/>
            <rect x="2" y="7.25" width="12" height="1.5" rx="0.75"/>
            <rect x="2" y="11.5" width="12" height="1.5" rx="0.75"/>
          </svg>
        </button>
        <Logo size={28} />
      </aside>
    );
  }

  return (
    <aside className="w-64 shrink-0 flex flex-col h-screen bg-white border-r border-sage-100">

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-sage-50">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo size={28} />
          <span className="text-base font-bold text-sage-900 tracking-tight">NoorAI</span>
        </Link>
        <button
          onClick={() => setCollapsed(true)}
          className="p-1.5 rounded-lg hover:bg-sage-50 text-sage-400 hover:text-sage-600 transition-colors"
          aria-label="Collapse sidebar"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <rect x="2" y="3" width="12" height="1.5" rx="0.75"/>
            <rect x="2" y="7.25" width="12" height="1.5" rx="0.75"/>
            <rect x="2" y="11.5" width="12" height="1.5" rx="0.75"/>
          </svg>
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5">

        {/* Primary actions */}
        <div className="space-y-0.5">
          <NavItem
            href="/"
            label="New question"
            icon={
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M8 3v10M3 8h10"/>
              </svg>
            }
          />
          <NavItem
            href="/search"
            label="Search"
            icon={
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="6.5" cy="6.5" r="4"/>
                <path d="M11 11l2.5 2.5"/>
              </svg>
            }
          />
          <NavItem
            href="/saved"
            label="Saved answers"
            icon={
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M3 2h10v12l-5-3-5 3V2z"/>
              </svg>
            }
          />
          <NavItem
            href="/about"
            label="About sources"
            icon={
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="8" cy="8" r="6"/>
                <path d="M8 7v4M8 5.5v.5"/>
              </svg>
            }
          />
        </div>

        {/* Divider */}
        <div className="h-px bg-sage-100" />

        {/* Topics */}
        <div>
          <p className="text-[10px] font-semibold text-sage-400 uppercase tracking-widest px-3 mb-2">Topics</p>
          <div className="space-y-0.5">
            {[
              { label: 'Quran', emoji: '📖' },
              { label: 'Prayer & Salah', emoji: '🕌' },
              { label: 'Hadith', emoji: '📜' },
              { label: 'Family & Ethics', emoji: '👨‍👩‍👧' },
              { label: 'Finance (Halal)', emoji: '💰' },
            ].map(({ label, emoji }) => (
              <Link
                key={label}
                href={`/search?q=${encodeURIComponent(label)}`}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-sage-600
                           hover:bg-sage-50 hover:text-sage-800 transition-colors group"
              >
                <span className="text-base">{emoji}</span>
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-sage-100" />

        {/* Recent questions */}
        <div>
          <p className="text-[10px] font-semibold text-sage-400 uppercase tracking-widest px-3 mb-2">Recent</p>
          <div className="space-y-0.5">
            {RECENT_QUESTIONS.map(q => (
              <button
                key={q}
                className="w-full text-left px-3 py-2 rounded-xl text-sm text-sage-500
                           hover:bg-sage-50 hover:text-sage-700 transition-colors truncate"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom: disclaimer + user */}
      <div className="border-t border-sage-100 px-3 py-3 space-y-1">
        <div className="px-3 py-2 rounded-xl bg-sage-50 border border-sage-100">
          <p className="text-[10px] text-sage-400 leading-relaxed">
            Educational only · Not a fatwa · Always consult a qualified scholar
          </p>
        </div>
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-sage-50 transition-colors cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-sage-200 flex items-center justify-center text-sage-700 text-xs font-bold shrink-0">
            K
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-sage-800 truncate">Kashif Razi</p>
            <p className="text-[10px] text-sage-400 truncate">kashifrazis@gmail.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

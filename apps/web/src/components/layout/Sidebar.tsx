'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

/* ── tiny icon helpers ── */
function Icon({ d, viewBox = '0 0 20 20' }: { d: string; viewBox?: string }) {
  return (
    <svg width="16" height="16" viewBox={viewBox} fill="none"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const NAV = [
  {
    href: '/app/ask',
    label: 'New question',
    icon: <Icon d="M10 4v12M4 10h12" />,
  },
  {
    href: '/app/search',
    label: 'Search',
    icon: <Icon d="M9 17A8 8 0 109 1a8 8 0 000 16zM19 19l-4.35-4.35" />,
  },
  {
    href: '/app/saved',
    label: 'Saved',
    icon: <Icon d="M5 3h10v16l-5-3-5 3V3z" />,
  },
  {
    href: '/app/about',
    label: 'About sources',
    icon: <Icon d="M10 9v5m0-8.5v.5" viewBox="0 0 20 20" />,
  },
];

const TOPICS = [
  { label: 'Quran',         href: '/app/search?q=quran' },
  { label: 'Prayer & Salah', href: '/app/search?q=prayer' },
  { label: 'Hadith',        href: '/app/search?q=hadith' },
  { label: 'Family & Ethics', href: '/app/search?q=family' },
  { label: 'Halal Finance', href: '/app/search?q=finance' },
];

const RECENTS = [
  'What does Islam say about patience?',
  'How to perform Wudu correctly?',
  'Importance of Tahajjud prayer',
];

const TIPS = [
  { title: 'Cite-verified answers',   desc: 'Every reference cross-checked in real time' },
  { title: 'Sahih & Hasan only',      desc: 'Weak hadith never appear in responses' },
  { title: 'Scholar-reviewed flags',  desc: 'Report any answer for expert review' },
];

function NavLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-[7px] rounded-lg text-[13.5px] w-full
        transition-colors duration-100
        ${active
          ? 'bg-[#f0f0ef] text-[#1a1a1a] font-medium'
          : 'text-[#5c5c5c] hover:bg-[#f5f5f4] hover:text-[#1a1a1a]'
        }`}
    >
      <span className="opacity-60 shrink-0">{icon}</span>
      {label}
    </Link>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(true);

  if (!open) {
    return (
      <aside className="w-12 shrink-0 flex flex-col h-screen bg-[#f9f9f8] border-r border-[#e8e8e5] items-center pt-3 gap-2">
        <button onClick={() => setOpen(true)}
          className="p-2 rounded-lg hover:bg-[#f0f0ef] text-[#888] transition-colors"
          aria-label="Open sidebar">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
            <rect x="1" y="3" width="13" height="1.2" rx="0.6"/>
            <rect x="1" y="6.9" width="13" height="1.2" rx="0.6"/>
            <rect x="1" y="10.8" width="13" height="1.2" rx="0.6"/>
          </svg>
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-[240px] shrink-0 flex flex-col h-screen bg-[#f9f9f8] border-r border-[#e8e8e5]">

      {/* Brand row */}
      <div className="flex items-center justify-between px-3 pt-3 pb-1">
        <Link href="/home" className="flex items-center gap-2 px-1 py-1 rounded-lg hover:bg-[#f0f0ef] transition-colors">
          {/* Tiny crescent mark */}
          <svg width="18" height="18" viewBox="0 0 64 64" fill="none">
            <path d="M32 8 A24 24 0 1 1 32 56 A18 18 0 1 0 32 8Z" fill="#40915f"/>
            <g transform="translate(32,26)">
              <rect x="-5" y="-5" width="10" height="10" rx="1.5" fill="#96cca8"/>
              <rect x="-5" y="-5" width="10" height="10" rx="1.5" fill="#96cca8" transform="rotate(45)" opacity="0.8"/>
              <circle cx="0" cy="0" r="2.2" fill="white" opacity="0.9"/>
            </g>
          </svg>
          <span className="text-[15px] font-semibold text-[#1a1a1a] tracking-tight">NoorAI</span>
        </Link>

        <button onClick={() => setOpen(false)}
          className="p-1.5 rounded-lg hover:bg-[#ebebea] text-[#aaa] hover:text-[#666] transition-colors"
          aria-label="Close sidebar">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <rect x="0.5" y="2.5" width="13" height="1.1" rx="0.55"/>
            <rect x="0.5" y="6.45" width="13" height="1.1" rx="0.55"/>
            <rect x="0.5" y="10.4" width="13" height="1.1" rx="0.55"/>
          </svg>
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4">

        {/* Primary nav */}
        <div className="space-y-px">
          {NAV.map(n => <NavLink key={n.href} {...n} />)}
        </div>

        {/* Topics */}
        <div>
          <p className="px-3 mb-1 text-[11px] font-semibold text-[#aaa] uppercase tracking-wider">Topics</p>
          <div className="space-y-px">
            {TOPICS.map(({ label, href }) => (
              <Link key={label} href={href}
                className="flex items-center gap-3 px-3 py-[7px] rounded-lg text-[13px]
                           text-[#5c5c5c] hover:bg-[#f0f0ef] hover:text-[#1a1a1a] transition-colors truncate">
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Recents */}
        <div>
          <p className="px-3 mb-1 text-[11px] font-semibold text-[#aaa] uppercase tracking-wider">Recents</p>
          <div className="space-y-px">
            {RECENTS.map(q => (
              <button key={q}
                className="w-full text-left px-3 py-[7px] rounded-lg text-[13px]
                           text-[#5c5c5c] hover:bg-[#f0f0ef] hover:text-[#1a1a1a] transition-colors truncate">
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="rounded-xl bg-white border border-[#e8e8e5] p-3 space-y-3 mx-1">
          <p className="text-[11.5px] font-semibold text-[#1a1a1a]">How NoorAI works</p>
          {TIPS.map(({ title, desc }) => (
            <div key={title} className="flex items-start gap-2.5">
              <div className="mt-0.5 w-3.5 h-3.5 rounded-full border border-[#d0d0cc] shrink-0"/>
              <div>
                <p className="text-[12px] font-medium text-[#1a1a1a] leading-snug">{title}</p>
                <p className="text-[11px] text-[#888] leading-snug mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User row */}
      <div className="px-2 py-2 border-t border-[#e8e8e5]">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#f0f0ef] transition-colors cursor-pointer">
          <div className="w-6 h-6 rounded-full bg-sage-600 flex items-center justify-center
                          text-white text-[10px] font-bold shrink-0">
            K
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-[#1a1a1a] truncate leading-tight">Kashif Razi</p>
            <p className="text-[11px] text-[#888] leading-tight">Free plan</p>
          </div>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
            stroke="#aaa" strokeWidth="1.5" strokeLinecap="round">
            <path d="M2 5l5 4 5-4"/>
          </svg>
        </div>
      </div>
    </aside>
  );
}

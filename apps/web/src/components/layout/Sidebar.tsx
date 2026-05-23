'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const NAV = [
  {
    href: '/app/ask',
    label: 'New question',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <path d="M7.5 2v11M2 7.5h11"/>
      </svg>
    ),
  },
  {
    href: '/app/search',
    label: 'Search',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <circle cx="6.5" cy="6.5" r="4.5"/>
        <path d="M11 11l2.5 2.5"/>
      </svg>
    ),
  },
  {
    href: '/app/saved',
    label: 'Saved',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <path d="M3 2h9v11.5l-4.5-2.5L3 13.5V2z"/>
      </svg>
    ),
  },
  {
    href: '/app/about',
    label: 'About sources',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <circle cx="7.5" cy="7.5" r="5.5"/>
        <path d="M7.5 7v4M7.5 5.3v.2"/>
      </svg>
    ),
  },
];

const TOPICS = [
  'Quran & Tafsir',
  'Prayer & Worship',
  'Hadith',
  'Family & Ethics',
  'Halal Finance',
  'Islamic History',
];

const RECENTS = [
  'What does Islam say about patience?',
  'How to perform Wudu correctly?',
  'Importance of Tahajjud prayer',
];

const TIPS = [
  { title: 'Citation-verified',      desc: 'Every reference cross-checked live' },
  { title: 'Sahih & Hasan only',     desc: 'Weak hadith never surface in answers' },
  { title: 'Scholar-reviewed flags', desc: 'Flag any answer for expert review' },
];

function NavLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  const active = usePathname() === href;
  return (
    <Link href={href}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '6px 10px', borderRadius: '8px',
        fontSize: '13px', fontFamily: 'Lora, Georgia, serif',
        fontWeight: active ? 500 : 400,
        color: active ? 'var(--forest)' : 'var(--ink-soft)',
        background: active ? 'var(--forest-pale)' : 'transparent',
        transition: 'all 0.12s ease', textDecoration: 'none',
      }}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(180,165,135,0.18)'; }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
    >
      <span style={{ opacity: 0.55, flexShrink: 0 }}>{icon}</span>
      {label}
    </Link>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(true);

  if (!open) {
    return (
      <aside style={{
        width: 48, flexShrink: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        height: '100vh', background: 'var(--parchment-2)',
        borderRight: '1px solid var(--rule)', paddingTop: 14,
      }}>
        <button onClick={() => setOpen(true)} aria-label="Open sidebar" style={{
          padding: 7, borderRadius: 8, border: 'none',
          background: 'transparent', color: 'var(--ink-muted)',
          cursor: 'pointer',
        }}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
            <rect x="1" y="2.5" width="13" height="1" rx="0.5"/>
            <rect x="1" y="7" width="13" height="1" rx="0.5"/>
            <rect x="1" y="11.5" width="13" height="1" rx="0.5"/>
          </svg>
        </button>
        {/* Mini crescent */}
        <div style={{ marginTop: 12 }}>
          <svg width="20" height="20" viewBox="0 0 64 64" fill="none">
            <path d="M32 8 A24 24 0 1 1 32 56 A18 18 0 1 0 32 8Z" fill="var(--forest)"/>
            <circle cx="32" cy="26" r="4" fill="var(--gold-light)" opacity="0.85"/>
          </svg>
        </div>
      </aside>
    );
  }

  return (
    <aside style={{
      width: 238, flexShrink: 0,
      display: 'flex', flexDirection: 'column',
      height: '100vh', overflowY: 'hidden',
      background: 'var(--parchment-2)',
      borderRight: '1px solid var(--rule)',
    }}>

      {/* Brand */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '13px 12px 10px',
        borderBottom: '1px solid var(--rule)',
      }}>
        <Link href="/home" style={{
          display: 'flex', alignItems: 'center', gap: 9,
          textDecoration: 'none',
        }}>
          <svg width="22" height="22" viewBox="0 0 64 64" fill="none">
            <path d="M32 8 A24 24 0 1 1 32 56 A18 18 0 1 0 32 8Z" fill="var(--forest)"/>
            <g transform="translate(32,26)">
              <rect x="-5" y="-5" width="10" height="10" rx="1.5" fill="var(--gold-light)"/>
              <rect x="-5" y="-5" width="10" height="10" rx="1.5" fill="var(--gold)" transform="rotate(45)" opacity="0.7"/>
              <circle cx="0" cy="0" r="2.2" fill="white" opacity="0.9"/>
            </g>
          </svg>
          <span style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 17, fontWeight: 600,
            color: 'var(--ink)', letterSpacing: '-0.01em',
          }}>NoorAI</span>
        </Link>

        <button onClick={() => setOpen(false)} aria-label="Collapse sidebar" style={{
          padding: 5, borderRadius: 7, border: 'none',
          background: 'transparent', color: 'var(--ink-faint)',
          cursor: 'pointer', transition: 'color 0.1s',
        }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink-muted)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-faint)')}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <rect x="0.5" y="2.5" width="13" height="1" rx="0.5"/>
            <rect x="0.5" y="6.5" width="13" height="1" rx="0.5"/>
            <rect x="0.5" y="10.5" width="13" height="1" rx="0.5"/>
          </svg>
        </button>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* Nav */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {NAV.map(n => <NavLink key={n.href} {...n}/>)}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--rule)', margin: '0 2px' }}/>

        {/* Topics */}
        <div>
          <p style={{ fontSize: 10, fontFamily: 'Lora, serif', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-faint)', padding: '0 10px 6px' }}>
            Topics
          </p>
          {TOPICS.map(t => (
            <Link key={t} href={`/app/search?q=${encodeURIComponent(t)}`} style={{
              display: 'block', padding: '6px 10px', borderRadius: 8,
              fontSize: 12.5, fontFamily: 'Lora, serif',
              color: 'var(--ink-soft)', textDecoration: 'none',
              transition: 'all 0.12s',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(180,165,135,0.18)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >{t}</Link>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--rule)', margin: '0 2px' }}/>

        {/* Recents */}
        <div>
          <p style={{ fontSize: 10, fontFamily: 'Lora, serif', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-faint)', padding: '0 10px 6px' }}>
            Recent
          </p>
          {RECENTS.map(q => (
            <button key={q} style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '6px 10px', borderRadius: 8,
              fontSize: 12.5, fontFamily: 'Lora, serif',
              color: 'var(--ink-soft)', background: 'transparent',
              border: 'none', cursor: 'pointer',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              transition: 'all 0.12s',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(180,165,135,0.18)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >{q}</button>
          ))}
        </div>

        {/* Tips card */}
        <div style={{
          margin: '0 2px',
          borderRadius: 10,
          border: '1px solid var(--rule)',
          background: 'rgba(245,237,218,0.6)',
          padding: '12px 14px',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <p style={{ fontSize: 11.5, fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, color: 'var(--ink)', margin: 0 }}>
            How NoorAI works
          </p>
          {TIPS.map(({ title, desc }) => (
            <div key={title} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
              <div style={{
                marginTop: 3, width: 12, height: 12, borderRadius: '50%',
                border: '1.5px solid var(--ink-faint)', flexShrink: 0,
              }}/>
              <div>
                <p style={{ fontSize: 11.5, fontFamily: 'Lora, serif', fontWeight: 500, color: 'var(--ink)', margin: 0, lineHeight: 1.3 }}>{title}</p>
                <p style={{ fontSize: 11, fontFamily: 'Lora, serif', color: 'var(--ink-muted)', margin: '2px 0 0', lineHeight: 1.4 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User */}
      <div style={{ borderTop: '1px solid var(--rule)', padding: '8px 10px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 9,
          padding: '7px 8px', borderRadius: 8, cursor: 'pointer',
          transition: 'background 0.12s',
        }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(180,165,135,0.18)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          {/* Avatar with geometric ornament */}
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'var(--forest)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold-light)', fontFamily: "'Cormorant Garamond', serif" }}>KR</span>
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontSize: 13, fontFamily: 'Lora, serif', fontWeight: 500, color: 'var(--ink)', margin: 0, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Kashif Razi</p>
            <p style={{ fontSize: 10.5, fontFamily: 'Lora, serif', color: 'var(--ink-muted)', margin: 0, lineHeight: 1.3 }}>Free plan</p>
          </div>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="var(--ink-faint)" strokeWidth="1.4" strokeLinecap="round">
            <path d="M2 4.5l4 3 4-3"/>
          </svg>
        </div>
      </div>
    </aside>
  );
}

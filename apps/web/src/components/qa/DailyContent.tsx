'use client';

import { useEffect, useState } from 'react';
import { getDaily, type DailyContent as DailyContentType } from '@/lib/api';

export function DailyContent() {
  const [daily, setDaily] = useState<DailyContentType | null>(null);
  const [tab, setTab] = useState<'verse' | 'hadith'>('verse');

  useEffect(() => { getDaily().then(setDaily).catch(() => {}); }, []);

  if (!daily) return null;

  const item = tab === 'verse' ? daily.verse : daily.hadith;

  return (
    <div style={{
      background: 'var(--white)',
      border: '1px solid var(--rule)',
      borderRadius: 14,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '1px solid var(--rule)',
        background: 'rgba(245,237,218,0.5)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Tiny star ornament */}
          <svg width="10" height="10" viewBox="0 0 10 10">
            <polygon points="5,0.5 6.1,3.7 9.5,3.7 6.9,5.8 7.9,9 5,7 2.1,9 3.1,5.8 0.5,3.7 3.9,3.7"
              fill="var(--gold)" opacity="0.75"/>
          </svg>
          <span style={{ fontSize: 11.5, fontFamily: 'Lora, serif', fontWeight: 600, color: 'var(--ink-soft)', letterSpacing: '0.03em' }}>
            Today&apos;s Reminder
          </span>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4 }}>
          {(['verse', 'hadith'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              fontSize: 11.5, fontFamily: 'Lora, serif',
              padding: '4px 12px', borderRadius: 99,
              border: 'none', cursor: 'pointer',
              fontWeight: tab === t ? 500 : 400,
              background: tab === t ? 'var(--forest)' : 'transparent',
              color: tab === t ? 'var(--gold-light)' : 'var(--ink-muted)',
              transition: 'all 0.15s',
            }}>
              {t === 'verse' ? 'Quran' : 'Hadith'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '18px 18px 18px' }}>
        {item ? (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Large decorative opening quote */}
            <div style={{
              fontFamily: "'Cormorant Garamond', serif", fontSize: '3rem',
              color: 'var(--gold)', lineHeight: 0.6, opacity: 0.4,
              userSelect: 'none', marginBottom: -4,
            }}>&ldquo;</div>

            <p style={{
              fontFamily: 'Amiri, serif', fontSize: '1.25rem',
              direction: 'rtl', textAlign: 'right',
              color: 'var(--ink)', lineHeight: 2.6, margin: 0,
            }}>{item.arabic_text}</p>

            <p style={{
              fontSize: 13.5, fontFamily: 'Lora, serif',
              color: 'var(--ink-soft)', lineHeight: 1.8,
              fontStyle: 'italic', margin: 0,
            }}>{item.translation}</p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--rule)' }}>
              <p style={{ fontSize: 12, fontFamily: 'Lora, serif', fontWeight: 600, color: 'var(--gold)', margin: 0 }}>
                {item.reference}
              </p>
              {'grade' in item && item.grade && (
                <span style={{
                  fontSize: 11, fontFamily: 'Lora, serif',
                  color: 'var(--ink-muted)', background: 'var(--parchment-2)',
                  border: '1px solid var(--rule)', padding: '2px 10px', borderRadius: 99,
                }}>{String(item.grade)}</span>
              )}
            </div>
          </div>
        ) : (
          <p style={{ fontSize: 13, fontFamily: 'Lora, serif', color: 'var(--ink-faint)', padding: '8px 0' }}>
            No content scheduled for today.
          </p>
        )}
      </div>
    </div>
  );
}

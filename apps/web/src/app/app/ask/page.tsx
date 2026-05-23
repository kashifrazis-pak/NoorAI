'use client';

import { useState, useRef, useEffect, CSSProperties } from 'react';
import { AnswerCard } from '@/components/qa/AnswerCard';
import { DailyContent } from '@/components/qa/DailyContent';
import { askQuestion, type AskResponse } from '@/lib/api';

/* ─── tiny helpers ─── */
const s = (obj: CSSProperties): CSSProperties => obj;

const PILLS = [
  { label: 'Quran',    q: 'What does the Quran say about…' },
  { label: 'Prayer',   q: 'How should I perform…' },
  { label: 'Hadith',   q: 'What is the hadith about…' },
  { label: 'Family',   q: 'What does Islam say about family…' },
  { label: 'Finance',  q: 'Is it halal to…' },
];

/* ─── ornamental horizontal rule ─── */
function OrnamentRule() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '0 auto', width: '100%', maxWidth: 480 }}>
      <div style={{ flex: 1, height: 1, background: 'var(--rule)' }}/>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 1L9.8 6.2H15L10.6 9.4L12.4 14.6L8 11.4L3.6 14.6L5.4 9.4L1 6.2H6.2L8 1Z"
          fill="var(--gold)" opacity="0.55"/>
      </svg>
      <div style={{ flex: 1, height: 1, background: 'var(--rule)' }}/>
    </div>
  );
}

/* ─── input component ─── */
function AskInput({
  onAnswer, onLoading, onError, compact,
}: {
  onAnswer: (a: AskResponse) => void;
  onLoading: (b: boolean) => void;
  onError: (s: string | null) => void;
  compact?: boolean;
}) {
  const [question, setQuestion] = useState('');
  const [language, setLanguage] = useState('en');
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
  }, [question]);

  const submit = async (q: string) => {
    if (!q.trim()) return;
    onError(null);
    onLoading(true);
    setQuestion('');
    try {
      onAnswer(await askQuestion(q.trim(), language));
    } catch (err: unknown) {
      onError(
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
        ?? 'Something went wrong. Please try again.'
      );
    } finally {
      onLoading(false);
    }
  };

  const canSubmit = question.trim().length > 0;

  return (
    <div style={s({
      background: 'var(--white)',
      borderRadius: 14,
      border: focused ? '1px solid var(--gold)' : '1px solid var(--parchment-3)',
      boxShadow: focused
        ? '0 0 0 3px rgba(184,134,42,0.12), 0 4px 24px rgba(28,56,41,0.08)'
        : '0 2px 16px rgba(28,56,41,0.06)',
      transition: 'all 0.2s ease',
      overflow: 'hidden',
    })}>
      <textarea
        ref={ref}
        value={question}
        onChange={e => setQuestion(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(question); }
        }}
        placeholder={compact ? 'Ask a follow-up question…' : 'Ask an Islamic question…'}
        rows={compact ? 2 : 3}
        maxLength={2000}
        style={s({
          width: '100%', padding: '18px 20px 10px',
          fontSize: 15, fontFamily: 'Lora, Georgia, serif',
          lineHeight: 1.7, color: 'var(--ink)',
          background: 'transparent', resize: 'none',
          border: 'none', outline: 'none',
          boxSizing: 'border-box',
        })}
      />
      <div style={s({
        display: 'flex', alignItems: 'center',
        padding: '6px 14px 12px', gap: 8,
      })}>
        {/* Language */}
        <select value={language} onChange={e => setLanguage(e.target.value)} style={s({
          fontSize: 11.5, fontFamily: 'Lora, serif',
          color: 'var(--ink-muted)', background: 'transparent',
          border: 'none', outline: 'none', cursor: 'pointer',
        })}>
          <option value="en">English</option>
          <option value="ar">العربية</option>
          <option value="ur">اردو</option>
          <option value="fr">Français</option>
          <option value="tr">Türkçe</option>
        </select>

        <div style={{ flex: 1 }}/>

        {question.length > 80 && (
          <span style={{ fontSize: 11, color: 'var(--ink-faint)', fontFamily: 'Lora, serif' }}>
            {question.length}/2000
          </span>
        )}

        {/* Send button */}
        <button
          onClick={() => submit(question)}
          disabled={!canSubmit}
          style={s({
            width: 32, height: 32, borderRadius: 9,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: canSubmit ? 'var(--forest)' : 'var(--parchment-3)',
            border: 'none', cursor: canSubmit ? 'pointer' : 'default',
            transition: 'all 0.15s ease',
            boxShadow: canSubmit ? '0 2px 8px rgba(28,56,41,0.25)' : 'none',
          })}
          aria-label="Send question"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill={canSubmit ? 'var(--gold-light)' : 'var(--ink-faint)'}>
            <path d="M1 1l11 5.5L1 12V8l8-1.5-8-1.5V1z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ─── main page ─── */
export default function AskPage() {
  const [answer, setAnswer]   = useState<AskResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const reset = () => { setAnswer(null); setError(null); };

  /* conversation view */
  if (answer || loading) {
    return (
      <div style={s({ minHeight: '100vh', background: 'var(--parchment)', display: 'flex', flexDirection: 'column' })} className="geo-bg parchment-noise">
        <div style={s({ maxWidth: 680, margin: '0 auto', width: '100%', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 24 })}>

          <button onClick={reset} style={s({
            display: 'inline-flex', alignItems: 'center', gap: 7,
            fontSize: 12.5, fontFamily: 'Lora, serif',
            color: 'var(--ink-muted)', background: 'transparent',
            border: 'none', cursor: 'pointer', padding: 0,
            transition: 'color 0.15s',
          })}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-muted)')}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M9 2.5L4 7l5 4.5"/>
            </svg>
            New question
          </button>

          {loading && (
            <div style={s({ textAlign: 'center', padding: '60px 0' })} className="animate-fade-in">
              <div style={s({
                display: 'inline-flex', alignItems: 'center', gap: 12,
                fontSize: 13.5, fontFamily: 'Lora, serif', color: 'var(--ink-muted)',
              })}>
                <div style={s({
                  width: 18, height: 18, borderRadius: '50%',
                  border: '2px solid var(--parchment-3)',
                  borderTopColor: 'var(--forest)', flexShrink: 0,
                })} className="animate-spin-slow"/>
                Searching the Quran &amp; Hadith…
              </div>
            </div>
          )}

          {error && (
            <div style={s({
              fontSize: 13, fontFamily: 'Lora, serif',
              color: '#9b3a2a', background: '#fdf2ee',
              border: '1px solid #f5c6b8', borderRadius: 10, padding: '12px 16px',
            })} className="animate-fade-in">
              {error}
            </div>
          )}

          {answer && !loading && (
            <div className="animate-fade-up">
              <AnswerCard answer={answer}/>
            </div>
          )}

          <div style={{ position: 'sticky', bottom: 20, paddingTop: 8 }}>
            <AskInput onAnswer={setAnswer} onLoading={setLoading} onError={setError} compact/>
          </div>
        </div>
      </div>
    );
  }

  /* landing view */
  return (
    <div style={s({ minHeight: '100vh', background: 'var(--parchment)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' })}
      className="geo-bg parchment-noise">

      <div style={s({ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 640, padding: '40px 24px 80px', gap: 0 })}>

        {/* Mark + greeting */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }} className="animate-fade-up">
          <svg width="30" height="30" viewBox="0 0 64 64" fill="none">
            <path d="M32 8 A24 24 0 1 1 32 56 A18 18 0 1 0 32 8Z" fill="var(--forest)"/>
            <g transform="translate(32,26)">
              <rect x="-5" y="-5" width="10" height="10" rx="1.5" fill="var(--gold-light)"/>
              <rect x="-5" y="-5" width="10" height="10" rx="1.5" fill="var(--gold)" transform="rotate(45)" opacity="0.7"/>
              <circle cx="0" cy="0" r="2.2" fill="white" opacity="0.9"/>
            </g>
          </svg>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '2.1rem', fontWeight: 500,
            color: 'var(--ink)', margin: 0,
            letterSpacing: '-0.015em', lineHeight: 1,
          }}>
            Assalamu Alaikum
          </h1>
        </div>

        {/* Arabic subtitle */}
        <p style={{
          fontFamily: 'Amiri, serif', fontSize: '1.1rem',
          color: 'var(--gold)', marginBottom: 28, marginTop: 4,
          opacity: 0.85, direction: 'rtl',
        }} className="animate-fade-in">
          اطلب العلم من المهد إلى اللحد
        </p>

        {/* Input */}
        <div style={{ width: '100%', marginBottom: 14 }} className="animate-fade-up">
          <AskInput onAnswer={setAnswer} onLoading={setLoading} onError={setError}/>
        </div>

        {/* Hint */}
        <p style={{ fontSize: 11, fontFamily: 'Lora, serif', color: 'var(--ink-faint)', marginBottom: 18 }}
          className="animate-fade-in">
          Enter to send · Shift+Enter for new line · Every citation verified
        </p>

        {/* Category pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 32 }}
          className="animate-fade-in">
          {PILLS.map(({ label }) => (
            <button key={label} style={s({
              padding: '7px 16px', borderRadius: 99,
              fontSize: 12.5, fontFamily: 'Lora, serif', fontWeight: 500,
              color: 'var(--ink-soft)',
              background: 'var(--white)',
              border: '1px solid var(--parchment-3)',
              cursor: 'pointer',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              transition: 'all 0.15s ease',
            })}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--forest)';
                e.currentTarget.style.color = 'var(--gold-light)';
                e.currentTarget.style.borderColor = 'var(--forest)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--white)';
                e.currentTarget.style.color = 'var(--ink-soft)';
                e.currentTarget.style.borderColor = 'var(--parchment-3)';
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Ornament */}
        <div style={{ width: '100%', marginBottom: 24 }}>
          <OrnamentRule/>
        </div>

        {/* Daily content */}
        <div style={{ width: '100%' }} className="animate-fade-up">
          <DailyContent/>
        </div>
      </div>
    </div>
  );
}

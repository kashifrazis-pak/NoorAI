'use client';

import { useState } from 'react';
import { flagAnswer, saveAnswer, type AskResponse, type Citation } from '@/lib/api';

function CitationBlock({ citation, index }: { citation: Citation; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{
      border: '1px solid var(--rule)',
      borderRadius: 10,
      overflow: 'hidden',
      background: 'var(--white)',
      transition: 'border-color 0.15s',
    }}>
      <button onClick={() => setOpen(v => !v)} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
        padding: '11px 14px', textAlign: 'left',
        background: 'transparent', border: 'none', cursor: 'pointer',
        transition: 'background 0.12s',
      }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(245,237,218,0.6)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        {/* Number badge */}
        <span style={{
          width: 22, height: 22, borderRadius: '50%',
          background: 'var(--forest)', color: 'var(--gold-light)',
          fontSize: 10, fontWeight: 700,
          fontFamily: "'Cormorant Garamond', serif",
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>{index + 1}</span>

        <span style={{
          flex: 1, fontSize: 13.5, fontFamily: 'Lora, serif',
          fontWeight: 500, color: 'var(--ink)', lineHeight: 1.35,
        }}>{citation.label}</span>

        <svg style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
          width="13" height="13" viewBox="0 0 12 12" fill="none"
          stroke="var(--ink-faint)" strokeWidth="1.5" strokeLinecap="round">
          <path d="M2 4l4 4 4-4"/>
        </svg>
      </button>

      {open && (
        <div style={{
          padding: '0 14px 14px',
          borderTop: '1px solid var(--rule)',
          background: 'rgba(245,237,218,0.4)',
        }} className="animate-fade-in">
          {citation.arabic_text && (
            <p style={{
              fontFamily: 'Amiri, serif', fontSize: '1.2rem',
              direction: 'rtl', textAlign: 'right',
              color: 'var(--ink)', lineHeight: 2.5,
              marginBottom: 8, paddingTop: 10,
              borderBottom: '1px solid var(--rule)', paddingBottom: 10,
            }}>{citation.arabic_text}</p>
          )}
          <p style={{
            fontSize: 13.5, fontFamily: 'Lora, serif',
            color: 'var(--ink-soft)', lineHeight: 1.75,
            margin: '10px 0 0', fontStyle: 'italic',
          }}>{citation.translation}</p>
          {citation.grade && (
            <span style={{
              display: 'inline-block', marginTop: 10,
              fontSize: 11, fontFamily: 'Lora, serif',
              color: 'var(--gold)', background: 'var(--gold-pale)',
              border: '1px solid rgba(184,134,42,0.25)',
              padding: '2px 10px', borderRadius: 99,
            }}>
              Grade: {citation.grade}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function AnswerCard({ answer }: { answer: AskResponse }) {
  const [flagging, setFlagging] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [flagSent, setFlagSent] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const CONF_STYLE: Record<string, { color: string; bg: string }> = {
    high:   { color: 'var(--forest)', bg: 'var(--forest-pale)' },
    medium: { color: '#7a5c00',       bg: '#fdf4d4' },
    low:    { color: '#8b2c1c',       bg: '#fdf0ed' },
  };
  const conf = CONF_STYLE[answer.confidence] ?? CONF_STYLE.medium;

  const handleSave = async () => {
    try { await saveAnswer(answer.answer_id); setSaved(true); } catch { /* ignore */ }
  };
  const handleCopy = () => {
    navigator.clipboard?.writeText(answer.answer_text);
    setCopied(true); setTimeout(() => setCopied(false), 1800);
  };
  const handleFlag = async () => {
    if (!flagReason.trim()) return;
    await flagAnswer(answer.answer_id, flagReason);
    setFlagSent(true); setFlagging(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Confidence pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          fontSize: 11.5, fontFamily: 'Lora, serif', fontWeight: 500,
          color: conf.color, background: conf.bg,
          padding: '3px 12px', borderRadius: 99,
        }}>
          {answer.confidence} confidence
        </span>
        {answer.from_cache && (
          <span style={{ fontSize: 11.5, fontFamily: 'Lora, serif', color: 'var(--ink-faint)' }}>· Cached</span>
        )}
      </div>

      {/* Answer text */}
      <p style={{
        fontSize: 15, fontFamily: 'Lora, Georgia, serif',
        color: 'var(--ink)', lineHeight: 1.85,
        whiteSpace: 'pre-wrap', margin: 0,
      }}>{answer.answer_text}</p>

      {/* Citations */}
      {answer.citations.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{
            fontSize: 10, fontFamily: 'Lora, serif', fontWeight: 600,
            color: 'var(--ink-faint)', letterSpacing: '0.1em',
            textTransform: 'uppercase', margin: 0,
          }}>Sources · {answer.citations.length}</p>
          {answer.citations.map((c, i) => <CitationBlock key={i} citation={c} index={i}/>)}
        </div>
      )}

      {/* Actions */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 2,
        paddingTop: 12,
        borderTop: '1px solid var(--rule)',
      }}>
        {[
          { label: saved ? 'Saved' : 'Save', onClick: handleSave, disabled: saved },
          { label: copied ? 'Copied!' : 'Copy', onClick: handleCopy },
        ].map(({ label, onClick, disabled }) => (
          <button key={label} onClick={onClick} disabled={disabled} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '5px 10px', borderRadius: 7,
            fontSize: 12.5, fontFamily: 'Lora, serif',
            color: disabled ? 'var(--forest)' : 'var(--ink-muted)',
            background: 'transparent', border: 'none', cursor: disabled ? 'default' : 'pointer',
            transition: 'all 0.12s',
          }}
            onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLElement).style.background = 'rgba(180,165,135,0.2)'; }}
            onMouseLeave={e => { if (!disabled) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >{label}</button>
        ))}

        <button onClick={() => setFlagging(v => !v)} style={{
          marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5,
          padding: '5px 10px', borderRadius: 7,
          fontSize: 12.5, fontFamily: 'Lora, serif',
          color: 'var(--ink-faint)', background: 'transparent', border: 'none', cursor: 'pointer',
          transition: 'all 0.12s',
        }}
          onMouseEnter={e => { (e.currentTarget.style.background = '#fdf2ee'); (e.currentTarget.style.color = '#9b3a2a'); }}
          onMouseLeave={e => { (e.currentTarget.style.background = 'transparent'); (e.currentTarget.style.color = 'var(--ink-faint)'); }}
        >Flag</button>
      </div>

      {flagging && !flagSent && (
        <div style={{
          borderRadius: 10, border: '1px solid #f5c6b8',
          background: '#fdf2ee', padding: '14px 16px',
          display: 'flex', flexDirection: 'column', gap: 10,
        }} className="animate-fade-in">
          <p style={{ fontSize: 11.5, fontFamily: 'Lora, serif', fontWeight: 600, color: '#8b2c1c', margin: 0, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Report an issue</p>
          <textarea value={flagReason} onChange={e => setFlagReason(e.target.value)}
            placeholder="Describe the issue…" rows={3}
            style={{
              width: '100%', border: '1px solid #f5c6b8', borderRadius: 8,
              padding: '10px 12px', fontSize: 13, fontFamily: 'Lora, serif',
              background: 'white', color: '#5c1a0e', resize: 'none',
              outline: 'none', boxSizing: 'border-box',
            }}/>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleFlag} disabled={!flagReason.trim()} style={{
              fontSize: 12.5, fontFamily: 'Lora, serif',
              background: '#9b3a2a', color: 'white',
              border: 'none', borderRadius: 7, padding: '6px 16px', cursor: 'pointer',
              opacity: flagReason.trim() ? 1 : 0.4,
            }}>Submit</button>
            <button onClick={() => setFlagging(false)} style={{
              fontSize: 12.5, fontFamily: 'Lora, serif',
              background: 'transparent', color: 'var(--ink-muted)',
              border: 'none', cursor: 'pointer', padding: '6px 12px',
            }}>Cancel</button>
          </div>
        </div>
      )}

      {flagSent && (
        <div style={{
          fontSize: 13, fontFamily: 'Lora, serif', color: 'var(--forest)',
          background: 'var(--forest-pale)', border: '1px solid rgba(61,122,94,0.25)',
          borderRadius: 10, padding: '12px 16px',
        }} className="animate-fade-in">
          Flagged for scholar review — thank you.
        </div>
      )}
    </div>
  );
}

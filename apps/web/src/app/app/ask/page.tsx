'use client';

import { useState, useRef, useEffect } from 'react';
import { AnswerCard } from '@/components/qa/AnswerCard';
import { DailyContent } from '@/components/qa/DailyContent';
import { askQuestion, type AskResponse } from '@/lib/api';

const CATEGORIES = [
  { label: 'Quran',   icon: '📖' },
  { label: 'Prayer',  icon: '🕌' },
  { label: 'Hadith',  icon: '📜' },
  { label: 'Family',  icon: '🤝' },
  { label: 'Finance', icon: '⚖️' },
];

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

  return (
    <div className="w-full bg-white rounded-2xl border border-[#e5e5e3]
                    shadow-[0_1px_6px_rgba(0,0,0,0.06)]
                    focus-within:border-[#c0c0bc] focus-within:shadow-[0_2px_14px_rgba(0,0,0,0.09)]
                    transition-all duration-200">
      <textarea
        ref={ref}
        value={question}
        onChange={e => setQuestion(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(question); }
        }}
        placeholder={compact ? 'Ask a follow-up…' : 'Ask an Islamic question…'}
        rows={compact ? 2 : 3}
        maxLength={2000}
        className="w-full px-5 pt-4 pb-2 text-[15px] leading-relaxed text-[#1a1a1a]
                   placeholder-[#bbb] bg-transparent resize-none focus:outline-none"
      />
      <div className="flex items-center px-4 pb-3 pt-1 gap-2">
        <button className="p-1.5 rounded-lg text-[#bbb] hover:text-[#777] hover:bg-[#f5f5f4] transition-colors"
          aria-label="Attach">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M3 7.5V5a4 4 0 018 0v5a2.5 2.5 0 01-5 0V5.5a1 1 0 012 0V10"/>
          </svg>
        </button>

        <select value={language} onChange={e => setLanguage(e.target.value)}
          className="text-[12px] text-[#999] bg-transparent border-none focus:outline-none cursor-pointer hover:text-[#555] transition-colors">
          <option value="en">English</option>
          <option value="ar">العربية</option>
          <option value="ur">اردو</option>
          <option value="fr">Français</option>
          <option value="tr">Türkçe</option>
        </select>

        <div className="ml-auto flex items-center gap-2">
          {question.length > 80 && (
            <span className="text-[11px] text-[#ccc] tabular-nums">{question.length}/2000</span>
          )}
          <button
            onClick={() => submit(question)}
            disabled={!question.trim()}
            aria-label="Send"
            className="w-7 h-7 rounded-lg flex items-center justify-center
                       bg-[#40915f] hover:bg-[#347a50] disabled:bg-[#e0e0dd] disabled:cursor-not-allowed
                       text-white transition-colors">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M1 1l10 5L1 11V7l7-1-7-1V1z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AskPage() {
  const [answer, setAnswer]   = useState<AskResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const reset = () => { setAnswer(null); setError(null); };

  if (answer || loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <div className="max-w-[680px] mx-auto w-full px-6 py-8 space-y-5">
          <button onClick={reset}
            className="flex items-center gap-1.5 text-[13px] text-[#999] hover:text-[#333] transition-colors">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M8.5 2.5L3 7l5.5 4.5"/>
            </svg>
            New question
          </button>

          {loading && (
            <div className="text-center py-16">
              <div className="inline-flex items-center gap-3 text-[13px] text-[#999]">
                <div className="w-4 h-4 border-2 border-[#40915f] border-t-transparent rounded-full animate-spin"/>
                Searching Quran &amp; Hadith sources…
              </div>
            </div>
          )}

          {error && (
            <div className="text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {answer && !loading && <AnswerCard answer={answer}/>}

          <div className="sticky bottom-6 pt-2">
            <AskInput onAnswer={setAnswer} onLoading={setLoading} onError={setError} compact/>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-16">

        {/* Greeting — small inline mark + large text, like Claude */}
        <div className="flex items-center gap-2.5 mb-7">
          <svg width="26" height="26" viewBox="0 0 64 64" fill="none">
            <path d="M32 8 A24 24 0 1 1 32 56 A18 18 0 1 0 32 8Z" fill="#40915f"/>
            <g transform="translate(32,26)">
              <rect x="-5" y="-5" width="10" height="10" rx="1.5" fill="#96cca8"/>
              <rect x="-5" y="-5" width="10" height="10" rx="1.5" fill="#c3e2cd" transform="rotate(45)" opacity="0.75"/>
              <circle cx="0" cy="0" r="2.2" fill="white" opacity="0.95"/>
            </g>
          </svg>
          <h1 className="text-[1.85rem] font-[650] text-[#1a1a1a] tracking-[-0.02em] leading-none">
            Assalamu Alaikum
          </h1>
        </div>

        {/* Input box */}
        <div className="w-full max-w-[680px]">
          <AskInput onAnswer={setAnswer} onLoading={setLoading} onError={setError}/>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-[680px]">
          {CATEGORIES.map(({ label, icon }) => (
            <button key={label}
              className="flex items-center gap-1.5 text-[13px] font-medium text-[#555]
                         bg-white border border-[#e8e8e5] hover:bg-[#f5f5f4] hover:border-[#d0d0cc]
                         px-4 py-[7px] rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.05)]
                         transition-all duration-150">
              <span className="text-sm leading-none">{icon}</span>
              {label}
            </button>
          ))}
        </div>

        {/* Daily content */}
        <div className="w-full max-w-[680px] mt-8">
          <DailyContent/>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { askQuestion, type AskResponse } from '@/lib/api';

interface Props {
  onAnswer: (a: AskResponse) => void;
  onLoading: (l: boolean) => void;
  onError: (e: string | null) => void;
  compact?: boolean;
}

const SUGGESTED = [
  'What does Islam say about patience (sabr)?',
  'What does the Quran say about kindness to parents?',
  'How should I perform Wudu?',
  'What is the ruling on backbiting?',
];

export function AskPanel({ onAnswer, onLoading, onError, compact }: Props) {
  const [question, setQuestion] = useState('');
  const [language, setLanguage] = useState('en');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 220) + 'px';
  }, [question]);

  const submit = async (q: string) => {
    if (!q.trim()) return;
    onError(null);
    onLoading(true);
    setQuestion('');
    try {
      const result = await askQuestion(q.trim(), language);
      onAnswer(result);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Something went wrong. Please try again.';
      onError(msg);
    } finally {
      onLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit(question);
    }
  };

  return (
    <div className="space-y-3">
      {/* Input card — matches Claude.ai's rounded box */}
      <div
        className="bg-white rounded-2xl border border-sage-200 shadow-card
                   focus-within:border-sage-400 focus-within:shadow-glow
                   transition-all duration-200"
      >
        <textarea
          ref={textareaRef}
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={compact ? 'Ask a follow-up question…' : 'Ask an Islamic question…'}
          rows={compact ? 2 : 4}
          maxLength={2000}
          className="w-full px-5 pt-5 pb-2 text-sage-900 placeholder-sage-300 text-[15px]
                     leading-relaxed bg-transparent resize-none focus:outline-none"
        />

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between px-4 pb-3 pt-1 gap-3">
          {/* Left: attach / language */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sage-400
                         hover:bg-sage-50 hover:text-sage-600 transition-colors"
              aria-label="Attach"
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M3 8V5a5 5 0 0110 0v5a3 3 0 01-6 0V6a1 1 0 012 0v4"/>
              </svg>
            </button>

            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="text-xs text-sage-500 bg-transparent border-none focus:outline-none
                         cursor-pointer hover:text-sage-700 transition-colors pr-1"
            >
              <option value="en">English</option>
              <option value="ar">العربية</option>
              <option value="ur">اردو</option>
              <option value="fr">Français</option>
              <option value="tr">Türkçe</option>
            </select>
          </div>

          {/* Right: char count + send */}
          <div className="flex items-center gap-2">
            {question.length > 100 && (
              <span className="text-[10px] text-sage-300 tabular-nums">
                {question.length}/2000
              </span>
            )}
            <button
              type="button"
              onClick={() => submit(question)}
              disabled={!question.trim()}
              aria-label="Send question"
              className="w-8 h-8 rounded-lg flex items-center justify-center
                         bg-sage-600 hover:bg-sage-700 disabled:bg-sage-200
                         text-white transition-colors focus:outline-none
                         focus-visible:ring-2 focus-visible:ring-sage-400"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M1.5 1.5l13 6.5-13 6.5V9.5l9-3-9-3V1.5z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Hint */}
      {!compact && (
        <p className="text-center text-[11px] text-sage-300">
          Press Enter to send · Shift+Enter for new line · Every answer is citation-verified
        </p>
      )}

      {/* Suggested questions — only on landing */}
      {!compact && (
        <div className="hidden sm:flex flex-wrap gap-2 justify-center pt-1">
          {SUGGESTED.map(q => (
            <button
              key={q}
              onClick={() => submit(q)}
              className="text-xs bg-white border border-sage-200 text-sage-500
                         hover:bg-sage-50 hover:border-sage-300 hover:text-sage-700
                         rounded-full px-3.5 py-1.5 transition-all shadow-soft"
            >
              {q}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { askQuestion, type AskResponse } from '@/lib/api';

const SUGGESTED_QUESTIONS = [
  'What does Islam say about patience?',
  'How should I treat my parents?',
  'What is the importance of Zakat?',
  'What does the Quran say about forgiveness?',
];

interface Props {
  onAnswer: (a: AskResponse) => void;
  onLoading: (l: boolean) => void;
  onError: (e: string | null) => void;
  compact?: boolean;
}

export function QuestionForm({ onAnswer, onLoading, onError, compact }: Props) {
  const [question, setQuestion] = useState('');
  const [language, setLanguage] = useState('en');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
  }, [question]);

  const submit = async (q: string) => {
    if (!q.trim()) return;
    onError(null);
    onLoading(true);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit(question);
  };

  return (
    <div className="space-y-3">
      {/* Main input card */}
      <div className="card p-1 focus-within:ring-2 focus-within:ring-sage-400 focus-within:ring-offset-1 transition-shadow">
        <form onSubmit={handleSubmit}>
          <textarea
            ref={textareaRef}
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="Ask an Islamic question…"
            rows={compact ? 2 : 3}
            maxLength={2000}
            className="w-full px-4 pt-4 pb-2 text-sage-900 placeholder-sage-300 text-sm
                       leading-relaxed bg-transparent resize-none focus:outline-none"
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(e as never);
            }}
          />

          {/* Toolbar row */}
          <div className="flex items-center justify-between px-3 pb-3 pt-1 gap-2">
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="text-xs text-sage-600 bg-sage-50 border border-sage-200 rounded-lg
                         px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-sage-400 cursor-pointer"
            >
              <option value="en">🌐 English</option>
              <option value="ar">🇸🇦 العربية</option>
              <option value="ur">🇵🇰 اردو</option>
              <option value="fr">🇫🇷 Français</option>
              <option value="tr">🇹🇷 Türkçe</option>
            </select>

            <div className="flex items-center gap-2">
              {question && (
                <span className="text-[10px] text-sage-300 tabular-nums">
                  {question.length}/2000
                </span>
              )}
              <button
                type="submit"
                disabled={!question.trim()}
                aria-label="Submit question"
                className="w-8 h-8 rounded-lg bg-sage-600 hover:bg-sage-700 disabled:bg-sage-200
                           text-white flex items-center justify-center transition-colors
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-sage-400"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M1.5 1.5l13 6.5-13 6.5V9.5l9-3-9-3V1.5z" />
                </svg>
              </button>
            </div>
          </div>
        </form>
      </div>

      <p className="text-[10px] text-sage-400 text-center">
        ⌘↵ to send &nbsp;·&nbsp; Answers cited from Quran &amp; authentic Hadith only
      </p>

      {/* Suggested questions — only when not compact */}
      {!compact && (
        <div className="flex flex-wrap gap-2 justify-center pt-1">
          {SUGGESTED_QUESTIONS.map(q => (
            <button
              key={q}
              onClick={() => { setQuestion(q); submit(q); }}
              className="text-xs bg-white border border-sage-200 text-sage-600
                         hover:bg-sage-50 hover:border-sage-300 hover:text-sage-800
                         rounded-full px-3.5 py-1.5 transition-all duration-150 shadow-soft"
            >
              {q}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

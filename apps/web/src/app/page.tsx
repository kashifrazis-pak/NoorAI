'use client';

import { useState } from 'react';
import { AskPanel } from '@/components/qa/AskPanel';
import { AnswerCard } from '@/components/qa/AnswerCard';
import { DailyContent } from '@/components/qa/DailyContent';
import { Logo } from '@/components/ui/Logo';
import type { AskResponse } from '@/lib/api';

export default function HomePage() {
  const [answer, setAnswer] = useState<AskResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => { setAnswer(null); setError(null); };

  return (
    <div className="flex flex-col min-h-screen">
      {answer || loading ? (
        /* ── Conversation view ── */
        <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 space-y-6">
          <button
            onClick={reset}
            className="flex items-center gap-1.5 text-sm text-sage-500 hover:text-sage-700 transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd"
                d="M7.707 3.293a1 1 0 010 1.414L5.414 7H13a1 1 0 110 2H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" />
            </svg>
            New question
          </button>

          {loading && (
            <div className="card p-8 text-center animate-fade-in">
              <div className="flex justify-center mb-4">
                <div className="relative w-9 h-9">
                  <div className="absolute inset-0 rounded-full border-2 border-sage-100" />
                  <div className="absolute inset-0 rounded-full border-2 border-sage-500 border-t-transparent animate-spin" />
                </div>
              </div>
              <p className="text-sage-700 text-sm font-medium">Searching Quran &amp; Hadith…</p>
              <p className="text-sage-400 text-xs mt-1">Verifying every citation before responding</p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" clipRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" />
              </svg>
              {error}
            </div>
          )}

          {answer && !loading && <AnswerCard answer={answer} />}

          {/* Sticky follow-up input */}
          <div className="sticky bottom-6">
            <AskPanel
              onAnswer={setAnswer}
              onLoading={setLoading}
              onError={setError}
              compact
            />
          </div>
        </div>
      ) : (
        /* ── Landing / home view ── */
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-10">

          {/* Greeting */}
          <div className="flex items-center gap-3 mb-8 animate-fade-in">
            <Logo size={44} />
            <h1 className="text-[2rem] font-bold text-sage-900 tracking-tight leading-none">
              Assalamu Alaikum
            </h1>
          </div>

          {/* Input box */}
          <div className="w-full max-w-2xl animate-slide-up">
            <AskPanel
              onAnswer={setAnswer}
              onLoading={setLoading}
              onError={setError}
            />
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-5 max-w-2xl animate-slide-up">
            {[
              { label: 'Quran',       icon: '📖' },
              { label: 'Prayer',      icon: '🕌' },
              { label: 'Hadith',      icon: '📜' },
              { label: 'Family',      icon: '👨‍👩‍👧' },
              { label: 'Finance',     icon: '💰' },
              { label: 'Daily life',  icon: '🌙' },
            ].map(({ label, icon }) => (
              <button
                key={label}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium
                           bg-white border border-sage-200 text-sage-600 shadow-soft
                           hover:bg-sage-50 hover:border-sage-300 hover:text-sage-800
                           transition-all duration-150"
              >
                <span>{icon}</span>
                {label}
              </button>
            ))}
          </div>

          {/* Daily content below */}
          <div className="w-full max-w-2xl mt-10 animate-slide-up">
            <DailyContent />
          </div>
        </div>
      )}
    </div>
  );
}

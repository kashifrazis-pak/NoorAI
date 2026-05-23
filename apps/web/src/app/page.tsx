'use client';

import { useState } from 'react';
import { QuestionForm } from '@/components/qa/QuestionForm';
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
    <div className="max-w-2xl mx-auto px-4 pb-20 space-y-6">

      {/* Hero — only shown before an answer */}
      {!answer && !loading && (
        <div className="text-center pt-12 pb-4 animate-fade-in">
          <div className="flex justify-center mb-5">
            <div className="p-4 rounded-2xl bg-sage-50 border border-sage-100 shadow-soft">
              <Logo size={52} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-sage-900 tracking-tight mb-2">
            Ask NoorAI
          </h1>
          <p className="text-sage-600 text-base leading-relaxed max-w-sm mx-auto">
            Islamic answers grounded in the Quran and authentic Sunnah — every claim cited and verified.
          </p>
        </div>
      )}

      {/* Back button when answer is shown */}
      {(answer || error) && !loading && (
        <button
          onClick={reset}
          className="flex items-center gap-1.5 text-sm text-sage-600 hover:text-sage-800 transition-colors mt-6"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path fillRule="evenodd" clipRule="evenodd"
              d="M7.707 3.293a1 1 0 010 1.414L5.414 7H13a1 1 0 110 2H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" />
          </svg>
          Ask another question
        </button>
      )}

      {/* Question form */}
      <div className="animate-slide-up">
        <QuestionForm
          onAnswer={setAnswer}
          onLoading={setLoading}
          onError={setError}
          compact={!!(answer || loading)}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700 animate-fade-in">
          <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" clipRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" />
          </svg>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="card p-8 text-center animate-fade-in">
          <div className="flex justify-center mb-4">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-full border-2 border-sage-200" />
              <div className="absolute inset-0 rounded-full border-2 border-sage-500 border-t-transparent animate-spin" />
            </div>
          </div>
          <p className="text-sage-700 font-medium text-sm">Searching Quran &amp; Hadith sources…</p>
          <p className="text-sage-400 text-xs mt-1">Verifying citations before responding</p>
        </div>
      )}

      {/* Answer */}
      {answer && !loading && (
        <div className="animate-slide-up">
          <AnswerCard answer={answer} />
        </div>
      )}

      {/* Daily content */}
      {!answer && !loading && (
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <DailyContent />
        </div>
      )}
    </div>
  );
}

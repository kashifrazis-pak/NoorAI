'use client';

import { useState } from 'react';
import { QuestionForm } from '@/components/qa/QuestionForm';
import { AnswerCard } from '@/components/qa/AnswerCard';
import { DailyContent } from '@/components/qa/DailyContent';
import type { AskResponse } from '@/lib/api';

export default function HomePage() {
  const [answer, setAnswer] = useState<AskResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-green-900 mb-2">نور AI</h1>
        <p className="text-xl text-green-700 mb-1">NoorAI</p>
        <p className="text-stone-500 italic">
          &ldquo;Answers rooted in the Quran and authentic Sunnah&rdquo;
        </p>
      </div>

      {/* Question Form */}
      <QuestionForm
        onAnswer={setAnswer}
        onLoading={setLoading}
        onError={setError}
      />

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-green-700 border-t-transparent
                          rounded-full animate-spin mb-4" />
          <p className="text-stone-500">Searching Quran and Hadith sources&hellip;</p>
        </div>
      )}

      {/* Answer */}
      {answer && !loading && <AnswerCard answer={answer} />}

      {/* Daily Content */}
      {!answer && !loading && <DailyContent />}
    </div>
  );
}

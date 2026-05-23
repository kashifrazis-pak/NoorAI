'use client';

import { useState, useRef } from 'react';
import { askQuestion, type AskResponse } from '@/lib/api';

const SUGGESTED_QUESTIONS = [
  'What does Islam say about patience (sabr)?',
  'How many times should I pray each day?',
  'What is the importance of Zakat?',
  'What does the Quran say about kindness to parents?',
];

interface Props {
  onAnswer: (a: AskResponse) => void;
  onLoading: (l: boolean) => void;
  onError: (e: string | null) => void;
}

export function QuestionForm({ onAnswer, onLoading, onError }: Props) {
  const [question, setQuestion] = useState('');
  const [language, setLanguage] = useState('en');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-medium text-stone-600 mb-1">
          Ask an Islamic question
        </label>

        <textarea
          ref={textareaRef}
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="e.g. What does the Quran say about forgiving others?"
          rows={3}
          maxLength={2000}
          className="w-full border border-stone-300 rounded-xl px-4 py-3 text-stone-800
                     placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-green-600
                     focus:border-transparent resize-none"
          onKeyDown={e => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(e as never);
          }}
        />

        <div className="flex items-center justify-between gap-4">
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-700
                       focus:outline-none focus:ring-2 focus:ring-green-600"
          >
            <option value="en">English</option>
            <option value="ar">العربية</option>
            <option value="ur">اردو</option>
            <option value="fr">Français</option>
            <option value="tr">Türkçe</option>
          </select>

          <button
            type="submit"
            disabled={!question.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex-1"
          >
            Ask NoorAI
          </button>
        </div>
      </form>

      {/* Suggested questions */}
      <div className="mt-5 pt-4 border-t border-stone-100">
        <p className="text-xs text-stone-400 mb-2">Suggested questions</p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map(q => (
            <button
              key={q}
              onClick={() => { setQuestion(q); submit(q); }}
              className="text-xs bg-green-50 text-green-700 hover:bg-green-100 border
                         border-green-200 rounded-full px-3 py-1 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

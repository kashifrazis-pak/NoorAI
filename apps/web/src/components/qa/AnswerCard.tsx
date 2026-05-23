'use client';

import { useState } from 'react';
import { flagAnswer, saveAnswer, type AskResponse, type Citation } from '@/lib/api';

interface Props {
  answer: AskResponse;
}

function CitationBlock({ citation, index }: { citation: Citation; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="citation-card group">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full text-left flex items-start justify-between gap-3"
      >
        <div className="flex items-start gap-2.5 min-w-0">
          <span className="shrink-0 w-5 h-5 rounded-full bg-sage-100 text-sage-600 text-[10px] font-bold
                           flex items-center justify-center mt-0.5">
            {index + 1}
          </span>
          <span className="text-sm font-medium text-sage-800 leading-snug">{citation.label}</span>
        </div>
        <svg
          className={`w-4 h-4 text-sage-400 shrink-0 mt-0.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="currentColor" viewBox="0 0 20 20"
        >
          <path fillRule="evenodd" clipRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </button>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-sage-100 space-y-2.5 animate-fade-in">
          {citation.arabic_text && (
            <p className="arabic-text text-sage-900">{citation.arabic_text}</p>
          )}
          <p className="text-sm text-sage-700 leading-relaxed">{citation.translation}</p>
          {citation.grade && (
            <span className="inline-block text-xs bg-amber-50 text-amber-700 border border-amber-200
                             px-2.5 py-0.5 rounded-full font-medium">
              Grade: {citation.grade}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

const BADGE = {
  high:   { cls: 'badge-high',   label: 'High confidence' },
  medium: { cls: 'badge-medium', label: 'Medium confidence' },
  low:    { cls: 'badge-low',    label: 'Low confidence' },
} as const;

export function AnswerCard({ answer }: Props) {
  const [flagging, setFlagging] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [flagSent, setFlagSent] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const badge = BADGE[answer.confidence as keyof typeof BADGE] ?? BADGE.medium;

  const handleFlag = async () => {
    if (!flagReason.trim()) return;
    await flagAnswer(answer.answer_id, flagReason);
    setFlagSent(true);
    setFlagging(false);
  };

  const handleSave = async () => {
    try {
      await saveAnswer(answer.answer_id);
      setSaved(true);
    } catch { /* not logged in */ }
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(answer.answer_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="card p-6 space-y-5 animate-slide-up">

      {/* Header row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${badge.cls}`}>
          {badge.label}
        </span>
        {answer.from_cache && (
          <span className="flex items-center gap-1 text-xs text-sage-400">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" clipRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
            </svg>
            Verified cached response
          </span>
        )}
      </div>

      {/* Answer text */}
      <div className="text-sage-800 text-sm leading-7 whitespace-pre-wrap">
        {answer.answer_text}
      </div>

      {/* Citations */}
      {answer.citations.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-sage-400 uppercase tracking-widest mb-3">
            Sources · {answer.citations.length}
          </h3>
          <div className="space-y-2">
            {answer.citations.map((c, i) => (
              <CitationBlock key={i} citation={c} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center gap-1 pt-3 border-t border-sage-50 flex-wrap">
        <button
          onClick={handleSave}
          disabled={saved}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
            ${saved
              ? 'text-sage-500 bg-sage-50 cursor-default'
              : 'text-sage-600 hover:bg-sage-50 hover:text-sage-800'
            }`}
        >
          <svg className="w-3.5 h-3.5" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {saved ? 'Saved' : 'Save'}
        </button>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                     text-sage-600 hover:bg-sage-50 hover:text-sage-800 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {copied ? 'Copied!' : 'Copy'}
        </button>

        <button
          onClick={() => setFlagging(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                     text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors ml-auto"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M3 21V4l18 6-18 6v5z" />
          </svg>
          Flag issue
        </button>
      </div>

      {/* Flag form */}
      {flagging && !flagSent && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3 animate-fade-in">
          <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Report an issue</p>
          <textarea
            value={flagReason}
            onChange={e => setFlagReason(e.target.value)}
            placeholder="Describe the issue (e.g. incorrect citation, wrong information)…"
            rows={3}
            className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm resize-none bg-white
                       text-red-900 placeholder-red-300 focus:outline-none focus:ring-2 focus:ring-red-300"
          />
          <div className="flex gap-2">
            <button
              onClick={handleFlag}
              disabled={!flagReason.trim()}
              className="text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 transition-colors"
            >
              Submit
            </button>
            <button
              onClick={() => setFlagging(false)}
              className="text-sm text-sage-500 hover:text-sage-700 px-4 py-2 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {flagSent && (
        <div className="flex items-center gap-2 text-sm text-sage-700 bg-sage-50 border border-sage-200 rounded-xl px-4 py-3 animate-fade-in">
          <svg className="w-4 h-4 text-sage-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" clipRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
          </svg>
          Thank you — this answer has been flagged for scholar review.
        </div>
      )}
    </div>
  );
}

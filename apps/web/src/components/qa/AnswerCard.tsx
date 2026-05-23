'use client';

import { useState } from 'react';
import { flagAnswer, saveAnswer, type AskResponse, type Citation } from '@/lib/api';
import clsx from 'clsx';

interface Props {
  answer: AskResponse;
}

function CitationBlock({ citation }: { citation: Citation }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="citation-card">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full text-left flex items-center justify-between"
      >
        <span className="text-sm font-semibold text-green-800">{citation.label}</span>
        <span className="text-green-600 text-xs ml-2">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="mt-3 space-y-2">
          {citation.arabic_text && (
            <p className="arabic-text text-green-900">{citation.arabic_text}</p>
          )}
          <p className="text-sm text-stone-700 leading-relaxed">{citation.translation}</p>
          {citation.grade && (
            <span className="inline-block text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              Grade: {citation.grade}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function AnswerCard({ answer }: Props) {
  const [flagging, setFlagging] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [flagSent, setFlagSent] = useState(false);
  const [saved, setSaved] = useState(false);

  const confidenceClass = {
    high: 'confidence-high',
    medium: 'confidence-medium',
    low: 'confidence-low',
  }[answer.confidence] ?? 'confidence-medium';

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
    } catch {
      // Not logged in — silently ignore
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className={clsx('text-xs font-medium px-2 py-1 rounded-full', confidenceClass)}>
          Confidence: {answer.confidence}
        </span>
        {answer.from_cache && (
          <span className="text-xs text-stone-400">Verified cached response</span>
        )}
      </div>

      {/* Answer text */}
      <div className="prose prose-stone max-w-none text-stone-800 leading-relaxed whitespace-pre-wrap">
        {answer.answer_text}
      </div>

      {/* Citations */}
      {answer.citations.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-2">
            Sources ({answer.citations.length})
          </h3>
          <div className="space-y-2">
            {answer.citations.map((c, i) => (
              <CitationBlock key={i} citation={c} />
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2 border-t border-stone-100">
        <button
          onClick={handleSave}
          disabled={saved}
          className="text-sm text-green-700 hover:text-green-900 disabled:text-stone-400"
        >
          {saved ? '✓ Saved' : '♡ Save'}
        </button>

        <button
          onClick={() => navigator.clipboard?.writeText(answer.answer_text)}
          className="text-sm text-stone-500 hover:text-stone-700"
        >
          Copy
        </button>

        <button
          onClick={() => setFlagging(v => !v)}
          className="text-sm text-red-500 hover:text-red-700 ml-auto"
        >
          Flag issue
        </button>
      </div>

      {/* Flag form */}
      {flagging && !flagSent && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
          <p className="text-sm text-red-700 font-medium">Report an issue with this answer</p>
          <textarea
            value={flagReason}
            onChange={e => setFlagReason(e.target.value)}
            placeholder="Describe the issue (e.g. incorrect citation, wrong information)..."
            rows={3}
            className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm resize-none
                       focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <div className="flex gap-2">
            <button
              onClick={handleFlag}
              disabled={!flagReason.trim()}
              className="text-sm bg-red-600 text-white px-4 py-2 rounded-lg
                         disabled:opacity-50"
            >
              Submit Flag
            </button>
            <button
              onClick={() => setFlagging(false)}
              className="text-sm text-stone-500 px-4 py-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {flagSent && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          Thank you. This answer has been flagged for scholar review.
        </p>
      )}
    </div>
  );
}

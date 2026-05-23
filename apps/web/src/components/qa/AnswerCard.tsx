'use client';

import { useState } from 'react';
import { flagAnswer, saveAnswer, type AskResponse, type Citation } from '@/lib/api';

function CitationBlock({ citation, index }: { citation: Citation; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-[#e8e8e5] rounded-xl overflow-hidden">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#fafaf8] transition-colors">
        <span className="w-5 h-5 rounded-full bg-[#e8f5ee] text-[#40915f] text-[10px] font-bold
                         flex items-center justify-center shrink-0">
          {index + 1}
        </span>
        <span className="text-[13.5px] font-medium text-[#333] flex-1 leading-snug">{citation.label}</span>
        <svg className={`w-3.5 h-3.5 text-[#bbb] shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 12 12">
          <path d="M2 4l4 4 4-4" strokeLinecap="round"/>
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-[#f0f0ed] space-y-2.5 bg-[#fafaf8]">
          {citation.arabic_text && (
            <p className="arabic-text text-[#1a1a1a] text-lg">{citation.arabic_text}</p>
          )}
          <p className="text-[13px] text-[#555] leading-relaxed">{citation.translation}</p>
          {citation.grade && (
            <span className="inline-block text-[11px] text-[#888] bg-white border border-[#e8e8e5]
                             px-2.5 py-0.5 rounded-full">
              Grade: {citation.grade}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

const CONFIDENCE_BADGE: Record<string, string> = {
  high:   'text-[#40915f] bg-[#e8f5ee]',
  medium: 'text-amber-700 bg-amber-50',
  low:    'text-red-600 bg-red-50',
};

export function AnswerCard({ answer }: { answer: AskResponse }) {
  const [flagging, setFlagging] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [flagSent, setFlagSent] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const badgeCls = CONFIDENCE_BADGE[answer.confidence] ?? CONFIDENCE_BADGE.medium;

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
    <div className="space-y-5">
      {/* Confidence + cache */}
      <div className="flex items-center gap-2.5">
        <span className={`text-[11.5px] font-medium px-2.5 py-0.5 rounded-full ${badgeCls}`}>
          {answer.confidence} confidence
        </span>
        {answer.from_cache && (
          <span className="text-[11.5px] text-[#aaa]">· Cached</span>
        )}
      </div>

      {/* Answer text */}
      <p className="text-[14.5px] text-[#1a1a1a] leading-[1.75] whitespace-pre-wrap">
        {answer.answer_text}
      </p>

      {/* Citations */}
      {answer.citations.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-[#aaa] uppercase tracking-widest">
            Sources · {answer.citations.length}
          </p>
          {answer.citations.map((c, i) => (
            <CitationBlock key={i} citation={c} index={i}/>
          ))}
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center gap-1 pt-2 border-t border-[#f0f0ed]">
        <button onClick={handleSave} disabled={saved}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors
            ${saved ? 'text-[#40915f] cursor-default' : 'text-[#888] hover:bg-[#f5f5f4] hover:text-[#333]'}`}>
          <svg className="w-3.5 h-3.5" fill={saved ? 'currentColor' : 'none'}
            stroke="currentColor" strokeWidth="1.8" viewBox="0 0 20 20">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
          {saved ? 'Saved' : 'Save'}
        </button>

        <button onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-medium
                     text-[#888] hover:bg-[#f5f5f4] hover:text-[#333] transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 20 20">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
          </svg>
          {copied ? 'Copied!' : 'Copy'}
        </button>

        <button onClick={() => setFlagging(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-medium
                     text-[#bbb] hover:bg-red-50 hover:text-red-500 transition-colors ml-auto">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 20 20">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 21V4l18 6-18 6v5z"/>
          </svg>
          Flag
        </button>
      </div>

      {flagging && !flagSent && (
        <div className="border border-red-100 rounded-xl p-4 space-y-3 bg-red-50">
          <p className="text-[12px] font-semibold text-red-700 uppercase tracking-wide">Report an issue</p>
          <textarea value={flagReason} onChange={e => setFlagReason(e.target.value)}
            placeholder="Describe the issue…" rows={3}
            className="w-full border border-red-200 rounded-lg px-3 py-2 text-[13px] resize-none bg-white
                       text-red-900 placeholder-red-300 focus:outline-none focus:ring-1 focus:ring-red-300"/>
          <div className="flex gap-2">
            <button onClick={handleFlag} disabled={!flagReason.trim()}
              className="text-[13px] bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg disabled:opacity-50 transition-colors">
              Submit
            </button>
            <button onClick={() => setFlagging(false)}
              className="text-[13px] text-[#888] hover:text-[#333] px-4 py-1.5 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {flagSent && (
        <div className="flex items-center gap-2 text-[13px] text-[#40915f] bg-[#e8f5ee]
                        border border-[#c3e2cd] rounded-xl px-4 py-3">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" clipRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
          </svg>
          Flagged for scholar review — thank you.
        </div>
      )}
    </div>
  );
}

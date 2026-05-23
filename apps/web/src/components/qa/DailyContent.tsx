'use client';

import { useEffect, useState } from 'react';
import { getDaily, type DailyContent as DailyContentType } from '@/lib/api';

export function DailyContent() {
  const [daily, setDaily] = useState<DailyContentType | null>(null);
  const [activeTab, setActiveTab] = useState<'verse' | 'hadith'>('verse');

  useEffect(() => {
    getDaily().then(setDaily).catch(() => {});
  }, []);

  if (!daily) return null;

  const item = activeTab === 'verse' ? daily.verse : daily.hadith;

  return (
    <div className="card overflow-hidden">
      {/* Card header */}
      <div className="px-5 pt-5 pb-4 border-b border-sage-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-sage-400 animate-pulse-soft" />
          <h2 className="text-sm font-semibold text-sage-700">Today&apos;s Reminder</h2>
        </div>
        <span className="text-xs text-sage-300 tabular-nums">{daily.date}</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-5 pt-4">
        {(['verse', 'hadith'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition-all duration-150 ${
              activeTab === tab ? 'tab-active' : 'tab-inactive'
            }`}
          >
            {tab === 'verse' ? 'Quran Verse' : 'Hadith'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-5 pb-5 pt-4">
        {item ? (
          <div className="space-y-3 animate-fade-in">
            {/* Decorative quote mark */}
            <div className="text-4xl text-sage-100 font-serif leading-none select-none">&ldquo;</div>

            <p className="arabic-text text-sage-900 -mt-3">{item.arabic_text}</p>

            <p className="text-sm text-sage-700 leading-relaxed">{item.translation}</p>

            <div className="flex items-center justify-between pt-1">
              <p className="text-xs font-semibold text-sage-500">{item.reference}</p>
              {'grade' in item && item.grade && (
                <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200
                                 px-2 py-0.5 rounded-full font-medium">
                  {String(item.grade)}
                </span>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sage-400 text-sm py-4">No content scheduled for today.</p>
        )}
      </div>
    </div>
  );
}

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
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-stone-700">Today&apos;s Reminder</h2>
        <span className="text-xs text-stone-400">{daily.date}</span>
      </div>

      <div className="flex gap-2 mb-4">
        {(['verse', 'hadith'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-sm px-4 py-1.5 rounded-full border transition-colors ${
              activeTab === tab
                ? 'bg-green-700 text-white border-green-700'
                : 'border-stone-300 text-stone-600 hover:bg-stone-50'
            }`}
          >
            {tab === 'verse' ? 'Quran Verse' : 'Hadith'}
          </button>
        ))}
      </div>

      {item ? (
        <div className="space-y-3">
          <p className="arabic-text text-green-900 text-lg">{item.arabic_text}</p>
          <p className="text-stone-700 leading-relaxed">{item.translation}</p>
          <p className="text-xs font-medium text-green-700">{item.reference}</p>
          {'grade' in item && item.grade && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              {item.grade}
            </span>
          )}
        </div>
      ) : (
        <p className="text-stone-400 text-sm">No content scheduled for today.</p>
      )}
    </div>
  );
}

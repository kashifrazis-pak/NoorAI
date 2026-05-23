'use client';

import { useEffect, useState } from 'react';
import { getDaily, type DailyContent as DailyContentType } from '@/lib/api';

export function DailyContent() {
  const [daily, setDaily] = useState<DailyContentType | null>(null);
  const [activeTab, setActiveTab] = useState<'verse' | 'hadith'>('verse');

  useEffect(() => { getDaily().then(setDaily).catch(() => {}); }, []);

  if (!daily) return null;

  const item = activeTab === 'verse' ? daily.verse : daily.hadith;

  return (
    <div className="border border-[#e8e8e5] rounded-xl bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f0ed]">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#40915f]"/>
          <span className="text-[12.5px] font-semibold text-[#555]">Today&apos;s Reminder</span>
        </div>
        <div className="flex gap-1">
          {(['verse', 'hadith'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`text-[12px] px-3 py-1 rounded-full font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-[#40915f] text-white'
                  : 'text-[#888] hover:bg-[#f5f5f4]'
              }`}>
              {tab === 'verse' ? 'Quran' : 'Hadith'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {item ? (
          <div className="space-y-3">
            <p className="arabic-text text-[#1a1a1a]">{item.arabic_text}</p>
            <p className="text-[13.5px] text-[#444] leading-relaxed">{item.translation}</p>
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-medium text-[#40915f]">{item.reference}</p>
              {'grade' in item && item.grade && (
                <span className="text-[11px] text-[#888] bg-[#f5f5f4] px-2 py-0.5 rounded-full">
                  {String(item.grade)}
                </span>
              )}
            </div>
          </div>
        ) : (
          <p className="text-[13px] text-[#aaa] py-2">No content scheduled for today.</p>
        )}
      </div>
    </div>
  );
}

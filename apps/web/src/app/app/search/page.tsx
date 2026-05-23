'use client';

import { useState } from 'react';
import { search, type SearchResult } from '@/lib/api';

export default function SearchPage() {
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [type, setType]       = useState('all');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await search(query, 'en', type);
      setResults(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-2xl font-bold text-sage-900">Search Quran &amp; Hadith</h1>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Search by keyword…"
          className="flex-1 bg-white border border-sage-200 rounded-xl px-4 py-2.5 text-sm
                     text-sage-900 placeholder-sage-300 focus:outline-none focus:ring-2
                     focus:ring-sage-400 shadow-soft"/>
        <select value={type} onChange={e => setType(e.target.value)}
          className="bg-white border border-sage-200 rounded-xl px-3 py-2.5 text-sm
                     text-sage-600 focus:outline-none focus:ring-2 focus:ring-sage-400 shadow-soft">
          <option value="all">All</option>
          <option value="verse">Quran</option>
          <option value="hadith">Hadith</option>
        </select>
        <button type="submit"
          className="bg-sage-600 hover:bg-sage-700 text-white text-sm font-medium
                     px-5 py-2.5 rounded-xl transition-colors shadow-soft">
          Search
        </button>
      </form>

      {loading && (
        <div className="text-center py-10">
          <div className="inline-block w-6 h-6 border-2 border-sage-500 border-t-transparent rounded-full animate-spin"/>
        </div>
      )}

      <div className="space-y-3">
        {results.map(r => (
          <div key={r.id} className="card p-5">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                r.type === 'verse'
                  ? 'bg-sage-50 text-sage-700 border-sage-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {r.type === 'verse' ? '📖 Quran' : '📜 Hadith'}
              </span>
              <span className="text-sm font-semibold text-sage-800">{r.label}</span>
              {r.grade && <span className="text-xs text-sage-400 ml-auto">{r.grade}</span>}
            </div>
            {r.arabic_text && <p className="arabic-text text-sage-900 mb-3">{r.arabic_text}</p>}
            <p className="text-sage-600 text-sm leading-relaxed">{r.translation}</p>
          </div>
        ))}
        {!loading && results.length === 0 && query && (
          <p className="text-center text-sage-400 py-10 text-sm">
            No results found for &ldquo;{query}&rdquo;
          </p>
        )}
      </div>
    </div>
  );
}

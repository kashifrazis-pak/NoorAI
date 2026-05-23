'use client';

import { useState } from 'react';
import { search, type SearchResult } from '@/lib/api';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('all');

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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-green-900">Search Quran & Hadith</h1>

      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by keyword..."
          className="flex-1 border border-stone-300 rounded-xl px-4 py-3 focus:outline-none
                     focus:ring-2 focus:ring-green-600"
        />
        <select
          value={type}
          onChange={e => setType(e.target.value)}
          className="border border-stone-300 rounded-xl px-3 py-3 text-sm focus:outline-none
                     focus:ring-2 focus:ring-green-600"
        >
          <option value="all">All</option>
          <option value="verse">Quran</option>
          <option value="hadith">Hadith</option>
        </select>
        <button type="submit" className="btn-primary">Search</button>
      </form>

      {loading && (
        <div className="text-center py-8 text-stone-400">Searching...</div>
      )}

      <div className="space-y-3">
        {results.map(r => (
          <div key={r.id} className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                r.type === 'verse'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {r.type === 'verse' ? 'Quran' : 'Hadith'}
              </span>
              <span className="text-sm font-semibold text-stone-700">{r.label}</span>
              {r.grade && (
                <span className="text-xs text-stone-400 ml-auto">{r.grade}</span>
              )}
            </div>
            {r.arabic_text && (
              <p className="arabic-text text-green-900 text-base mb-2">{r.arabic_text}</p>
            )}
            <p className="text-stone-600 text-sm leading-relaxed">{r.translation}</p>
          </div>
        ))}
        {!loading && results.length === 0 && query && (
          <p className="text-center text-stone-400 py-8">No results found for &ldquo;{query}&rdquo;</p>
        )}
      </div>
    </div>
  );
}

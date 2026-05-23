/**
 * Quran Ingestion Script
 *
 * Fetches all 114 surahs × all ayahs from the Al-Quran Cloud API (quran.com),
 * stores them in the quran_verses table, then generates and stores embeddings.
 *
 * Run: yarn ingest:quran
 *
 * API used: https://api.quran.com/api/v4
 * No API key required for public endpoints.
 */
import axios from 'axios';
import pLimit from 'p-limit';
import pRetry from 'p-retry';
import { pool, query } from './db';
import { embedText, buildVerseEmbedText } from './embedder';
import dotenv from 'dotenv';

dotenv.config({ path: require('path').resolve(__dirname, '../../../.env') });

const API_BASE = 'https://api.quran.com/api/v4';
const TRANSLATIONS = {
  en: 131,   // Dr. Mustafa Khattab — The Clear Quran
  ur: 97,    // Maulana Fateh Muhammad Jalandhari
  fr: 136,   // Muhammad Hamidullah
  tr: 77,    // Diyanet İşleri
};

const limit = pLimit(3); // be gentle with external API

interface QuranSurah {
  id: number;
  name_arabic: string;
  name_simple: string;
  name_complex: string;
  translated_name: { name: string };
  verses_count: number;
}

interface QuranVerse {
  id: number;
  verse_number: number;
  verse_key: string;
  text_uthmani: string;
  translations?: Array<{ text: string; resource_id: number }>;
  juz_number?: number;
}

async function fetchSurahs(): Promise<QuranSurah[]> {
  const resp = await pRetry(
    () => axios.get(`${API_BASE}/chapters`, { params: { language: 'en' } }),
    { retries: 5 }
  );
  return resp.data.chapters;
}

async function fetchVerses(surahId: number): Promise<QuranVerse[]> {
  const translationIds = Object.values(TRANSLATIONS).join(',');
  let page = 1;
  const verses: QuranVerse[] = [];

  while (true) {
    const resp = await pRetry(
      () =>
        axios.get(`${API_BASE}/verses/by_chapter/${surahId}`, {
          params: {
            language: 'en',
            translations: translationIds,
            fields: 'text_uthmani,juz_number',
            per_page: 50,
            page,
          },
        }),
      { retries: 5, minTimeout: 500 }
    );
    verses.push(...resp.data.verses);
    if (!resp.data.pagination?.next_page) break;
    page++;
  }

  return verses;
}

function extractTranslation(
  verse: QuranVerse,
  resourceId: number
): string {
  const t = verse.translations?.find(t => t.resource_id === resourceId);
  return t?.text?.replace(/<[^>]+>/g, '') ?? ''; // strip HTML tags
}

async function ingestSurah(surah: QuranSurah) {
  console.log(`  Ingesting Surah ${surah.id}: ${surah.name_simple} (${surah.verses_count} ayat)`);
  const verses = await fetchVerses(surah.id);

  for (const verse of verses) {
    const [, ayahStr] = verse.verse_key.split(':');
    const ayahNumber = parseInt(ayahStr, 10);

    const translations: Record<string, string> = {};
    for (const [lang, resourceId] of Object.entries(TRANSLATIONS)) {
      translations[lang] = extractTranslation(verse, resourceId);
    }

    const enText = translations['en'] || '';

    // Build embedding text (Arabic + English for multilingual retrieval)
    const embedText_ = buildVerseEmbedText({
      surahNameEn: surah.translated_name.name,
      surahNumber: surah.id,
      ayahNumber,
      arabicText: verse.text_uthmani,
      englishText: enText,
    });

    const embedding = await embedText(embedText_);
    const embeddingStr = `[${embedding.join(',')}]`;

    await query(
      `INSERT INTO quran_verses
         (surah_number, surah_name_ar, surah_name_en, surah_name_transliteration,
          ayah_number, arabic_text, translations, juz_number, embedding_vector)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::vector)
       ON CONFLICT (surah_number, ayah_number) DO UPDATE SET
         arabic_text = EXCLUDED.arabic_text,
         translations = EXCLUDED.translations,
         embedding_vector = EXCLUDED.embedding_vector,
         updated_at = NOW()`,
      [
        surah.id,
        surah.name_arabic,
        surah.translated_name.name,
        surah.name_simple,
        ayahNumber,
        verse.text_uthmani,
        JSON.stringify(translations),
        verse.juz_number ?? null,
        embeddingStr,
      ]
    );
  }

  console.log(`  ✓ Surah ${surah.id} complete (${verses.length} verses stored + embedded)`);
}

async function main() {
  console.log('=== NoorAI Quran Ingestion ===');
  console.log('Fetching surah list...');
  const surahs = await fetchSurahs();
  console.log(`Found ${surahs.length} surahs.\n`);

  // Process surahs with limited concurrency
  await Promise.all(surahs.map(s => limit(() => ingestSurah(s))));

  const result = await query('SELECT COUNT(*) FROM quran_verses');
  console.log(`\n✅ Quran ingestion complete. Total verses stored: ${result.rows[0].count}`);

  await pool.end();
}

main().catch(err => {
  console.error('Ingestion failed:', err);
  process.exit(1);
});

/**
 * Tafsir Ibn Kathir Ingestion Script
 *
 * Fetches Tafsir Ibn Kathir for every ayah via the quran.com API (tafsir resource 169).
 * Run: npx ts-node --project tsconfig.json src/ingest_tafsir.ts
 */
import axios from 'axios';
import pLimit from 'p-limit';
import pRetry from 'p-retry';
import { pool, query } from './db';
import { embedText } from './embedder';
import dotenv from 'dotenv';

dotenv.config({ path: require('path').resolve(__dirname, '../../../.env') });

const API_BASE = 'https://api.quran.com/api/v4';
const TAFSIR_ID = 169;        // Ibn Kathir — English (quranenc.com)
const TAFSIR_SLUG = 'ibn-kathir';
const TAFSIR_NAME = 'Tafsir Ibn Kathir';
const SCHOLAR = 'Ismail ibn Umar ibn Kathir';

const limit = pLimit(3);

async function fetchTafsirForSurah(surahId: number): Promise<Array<{
  ayah: number;
  text: string;
}>> {
  let page = 1;
  const results: Array<{ ayah: number; text: string }> = [];

  while (true) {
    const resp = await pRetry(
      () => axios.get(`${API_BASE}/verses/by_chapter/${surahId}`, {
        params: { tafsirs: TAFSIR_ID, per_page: 50, page },
      }),
      { retries: 5, minTimeout: 1000 }
    );

    for (const verse of resp.data.verses) {
      const raw: string = verse.tafsirs?.[0]?.text ?? '';
      // Strip HTML tags
      const text = raw.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      if (text) {
        const [, ayahStr] = verse.verse_key.split(':');
        results.push({ ayah: parseInt(ayahStr, 10), text });
      }
    }

    if (!resp.data.pagination?.next_page) break;
    page++;
  }

  return results;
}

async function ingestSurah(surahId: number) {
  const verses = await fetchTafsirForSurah(surahId);
  let stored = 0;

  for (const { ayah, text } of verses) {
    const embedding = await embedText(`Tafsir Ibn Kathir — Surah ${surahId} Ayah ${ayah}: ${text.slice(0, 2000)}`);
    const embeddingStr = `[${embedding.join(',')}]`;

    await query(
      `INSERT INTO tafsir
         (surah_number, ayah_number, tafsir_slug, tafsir_name_en, scholar_name, text, language, embedding_vector)
       VALUES ($1,$2,$3,$4,$5,$6,'en',$7::vector)
       ON CONFLICT (surah_number, ayah_number, tafsir_slug, language) DO UPDATE SET
         text = EXCLUDED.text,
         embedding_vector = EXCLUDED.embedding_vector,
         updated_at = NOW()`,
      [surahId, ayah, TAFSIR_SLUG, TAFSIR_NAME, SCHOLAR, text, embeddingStr]
    );
    stored++;
  }

  console.log(`  ✓ Surah ${surahId}: ${stored} tafsir entries stored`);
}

async function main() {
  console.log('=== NoorAI Tafsir Ibn Kathir Ingestion ===\n');

  await Promise.all(
    Array.from({ length: 114 }, (_, i) => i + 1).map(id => limit(() => ingestSurah(id)))
  );

  const result = await query('SELECT COUNT(*) FROM tafsir');
  console.log(`\n✅ Done. ${result.rows[0].count} tafsir entries stored.`);

  await pool.end();
}

main().catch(err => { console.error('Ingestion failed:', err); process.exit(1); });

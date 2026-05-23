/**
 * Patches missing English translations for all Quran verses.
 * Uses quran.com API translation resource 20 (Sahih International).
 * Run: npx ts-node --project tsconfig.json src/patch_quran_en.ts
 */
import axios from 'axios';
import pRetry from 'p-retry';
import pLimit from 'p-limit';
import { pool, query } from './db';
import dotenv from 'dotenv';

dotenv.config({ path: require('path').resolve(__dirname, '../../../.env') });

const API_BASE = 'https://api.quran.com/api/v4';
const TRANSLATION_ID = 20; // Sahih International
const limit = pLimit(3);

async function fetchVerseTranslations(surahId: number): Promise<Array<{ verse_key: string; text: string }>> {
  let page = 1;
  const results: Array<{ verse_key: string; text: string }> = [];

  while (true) {
    const resp = await pRetry(
      () => axios.get(`${API_BASE}/verses/by_chapter/${surahId}`, {
        params: { translations: TRANSLATION_ID, per_page: 50, page },
      }),
      { retries: 5, minTimeout: 1000 }
    );

    for (const verse of resp.data.verses) {
      const text = verse.translations?.[0]?.text?.replace(/<[^>]+>/g, '') ?? '';
      results.push({ verse_key: verse.verse_key, text });
    }

    if (!resp.data.pagination?.next_page) break;
    page++;
  }

  return results;
}

async function patchSurah(surahId: number) {
  const verses = await fetchVerseTranslations(surahId);
  let updated = 0;

  for (const { verse_key, text } of verses) {
    if (!text) continue;
    const [, ayahStr] = verse_key.split(':');
    const ayahNumber = parseInt(ayahStr, 10);

    await query(
      `UPDATE quran_verses
       SET translations = jsonb_set(translations, '{en}', $1::jsonb, true),
           updated_at = NOW()
       WHERE surah_number = $2 AND ayah_number = $3`,
      [JSON.stringify(text), surahId, ayahNumber]
    );
    updated++;
  }

  console.log(`  ✓ Surah ${surahId}: ${updated} verses updated`);
}

async function main() {
  console.log('=== Patching English Quran translations (Sahih International) ===\n');

  const tasks = Array.from({ length: 114 }, (_, i) => i + 1).map(id =>
    limit(() => patchSurah(id))
  );
  await Promise.all(tasks);

  const check = await query(
    `SELECT COUNT(*) FROM quran_verses WHERE translations->>'en' != '' AND translations->>'en' IS NOT NULL`
  );
  console.log(`\n✅ Done. ${check.rows[0].count} verses now have English translations.`);

  await pool.end();
}

main().catch(err => {
  console.error('Patch failed:', err);
  process.exit(1);
});

/**
 * Hadith Ingestion Script
 *
 * Fetches hadith from the sunnah.com API for all 8 collections,
 * filters to sahih/hasan grades only for answer generation,
 * stores all grades but marks daif/mawdu clearly.
 *
 * Run: yarn ingest:hadith
 *
 * API: https://sunnah.com/developers  (API key required)
 * Fallback: hadith-json GitHub dataset (no key needed, see FALLBACK_MODE)
 */
import axios from 'axios';
import pLimit from 'p-limit';
import pRetry from 'p-retry';
import { pool, query } from './db';
import { embedText, buildHadithEmbedText } from './embedder';
import dotenv from 'dotenv';

dotenv.config({ path: require('path').resolve(__dirname, '../../../.env') });

const SUNNAH_API_BASE = 'https://api.sunnah.com/v1';
const SUNNAH_API_KEY = process.env.SUNNAH_COM_API_KEY ?? '';

// GitHub fallback dataset (hadith-json by mustafacagri)
const GITHUB_HADITH_BASE =
  'https://raw.githubusercontent.com/fawazahmed0/hadith-api/1/editions';

const COLLECTIONS = [
  { slug: 'bukhari',  sunnahSlug: 'bukhari',   githubId: 'eng-bukhari' },
  { slug: 'muslim',   sunnahSlug: 'muslim',    githubId: 'eng-muslim' },
  { slug: 'abudawud', sunnahSlug: 'abudawud',  githubId: 'eng-abudawud' },
  { slug: 'tirmidhi', sunnahSlug: 'tirmidhi',  githubId: 'eng-tirmidhi' },
  { slug: 'nasai',    sunnahSlug: 'nasai',     githubId: 'eng-nasai' },
  { slug: 'ibnmajah', sunnahSlug: 'ibnmajah',  githubId: 'eng-ibnmajah' },
  { slug: 'malik',    sunnahSlug: 'malik',     githubId: 'eng-malik' },
  { slug: 'ahmad',    sunnahSlug: 'ahmad',     githubId: 'eng-ahmad' },
];

const limit = pLimit(2);

type HadithGrade = 'sahih' | 'hasan' | 'daif' | 'mawdu' | 'unknown';

function parseGrade(gradeStr: string | undefined): HadithGrade {
  if (!gradeStr) return 'unknown';
  const g = gradeStr.toLowerCase();
  if (g.includes('sahih') || g.includes('صحيح')) return 'sahih';
  if (g.includes('hasan') || g.includes('حسن')) return 'hasan';
  if (g.includes('da\'if') || g.includes('daif') || g.includes('ضعيف')) return 'daif';
  if (g.includes('mawdu') || g.includes('موضوع')) return 'mawdu';
  return 'unknown';
}

// ── Sunnah.com API path ────────────────────────────────────────────────────

async function fetchFromSunnahAPI(
  collectionSlug: string,
  bookNumber: number,
  page: number
): Promise<{ hadiths: unknown[]; hasMore: boolean }> {
  const resp = await pRetry(
    () =>
      axios.get(`${SUNNAH_API_BASE}/collections/${collectionSlug}/books/${bookNumber}/hadiths`, {
        headers: { 'X-API-Key': SUNNAH_API_KEY },
        params: { limit: 50, page },
      }),
    { retries: 3, minTimeout: 500 }
  );
  return {
    hadiths: resp.data.data ?? [],
    hasMore: resp.data.data?.length === 50,
  };
}

async function ingestCollectionViaSunnahAPI(slug: string, sunnahSlug: string) {
  console.log(`  [sunnah.com API] Fetching books for ${slug}...`);

  const booksResp = await pRetry(
    () =>
      axios.get(`${SUNNAH_API_BASE}/collections/${sunnahSlug}/books`, {
        headers: { 'X-API-Key': SUNNAH_API_KEY },
        params: { limit: 200 },
      }),
    { retries: 3 }
  );

  const books = booksResp.data.data ?? [];
  let totalInserted = 0;

  for (const book of books) {
    let page = 1;
    while (true) {
      const { hadiths, hasMore } = await fetchFromSunnahAPI(sunnahSlug, book.bookNumber, page);

      for (const h of hadiths as Record<string, unknown>[]) {
        const grade = parseGrade(h.grades as string ?? h.grade as string);
        const hadithArr = h.hadith as Array<{ lang: string; body: string }> | undefined;
        const arabicText = hadithArr?.find((x) => x.lang === 'ar')?.body ?? '';
        const englishText = hadithArr?.find((x) => x.lang === 'en')?.body ?? '';
        const hadithNumber = typeof h.hadithNumber === 'number' ? h.hadithNumber : parseInt(h.hadithNumber as string, 10);

        const embedText_ = buildHadithEmbedText({
          collectionName: slug,
          hadithNumber,
          arabicText,
          englishText,
          narratorChain: h.chain as string | undefined,
        });

        const embedding = await embedText(embedText_);
        const embeddingStr = `[${embedding.join(',')}]`;

        await query(
          `INSERT INTO hadith
             (collection_slug, book_number, book_name_en, hadith_number, grade,
              grade_source, arabic_text, narrator_chain, translations, embedding_vector)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::vector)
           ON CONFLICT (collection_slug, hadith_number) DO UPDATE SET
             grade = EXCLUDED.grade,
             arabic_text = EXCLUDED.arabic_text,
             translations = EXCLUDED.translations,
             embedding_vector = EXCLUDED.embedding_vector,
             updated_at = NOW()`,
          [
            slug,
            book.bookNumber,
            book.nameEn ?? '',
            hadithNumber,
            grade,
            h.gradeSource ?? null,
            arabicText,
            h.chain ?? null,
            JSON.stringify({ en: englishText }),
            embeddingStr,
          ]
        );
        totalInserted++;
      }

      if (!hasMore) break;
      page++;
    }
  }

  console.log(`  ✓ ${slug}: ${totalInserted} hadith stored (via sunnah.com API)`);
}

// ── GitHub fallback path ────────────────────────────────────────────────────

async function ingestCollectionViaGitHub(slug: string, githubId: string) {
  console.log(`  [GitHub fallback] Fetching ${slug} from fawazahmed0/hadith-api...`);

  const url = `${GITHUB_HADITH_BASE}/${githubId}.min.json`;
  const resp = await pRetry(
    () => axios.get(url, { timeout: 120_000 }),
    { retries: 5, minTimeout: 2000 }
  );

  const hadiths: Record<string, { text?: string; arabic?: string; grade?: string }> =
    resp.data.hadiths ?? resp.data;
  let totalInserted = 0;

  for (const [number, data] of Object.entries(hadiths)) {
    const hadithNumber = parseInt(number, 10);
    if (isNaN(hadithNumber)) continue;

    const englishText = data.text ?? '';
    const arabicText = data.arabic ?? '';
    const grade = parseGrade(data.grade);

    const embedText_ = buildHadithEmbedText({
      collectionName: slug,
      hadithNumber,
      arabicText,
      englishText,
    });

    const embedding = await embedText(embedText_);
    const embeddingStr = `[${embedding.join(',')}]`;

    await query(
      `INSERT INTO hadith
         (collection_slug, book_number, hadith_number, grade, arabic_text,
          translations, embedding_vector)
       VALUES ($1, 1, $2, $3, $4, $5, $6::vector)
       ON CONFLICT (collection_slug, hadith_number) DO UPDATE SET
         grade = EXCLUDED.grade,
         arabic_text = EXCLUDED.arabic_text,
         translations = EXCLUDED.translations,
         embedding_vector = EXCLUDED.embedding_vector,
         updated_at = NOW()`,
      [
        slug,
        hadithNumber,
        grade,
        arabicText,
        JSON.stringify({ en: englishText }),
        embeddingStr,
      ]
    );
    totalInserted++;
  }

  console.log(`  ✓ ${slug}: ${totalInserted} hadith stored (via GitHub fallback)`);
}

async function ingestCollection(col: {
  slug: string;
  sunnahSlug: string;
  githubId: string;
}) {
  if (SUNNAH_API_KEY) {
    await ingestCollectionViaSunnahAPI(col.slug, col.sunnahSlug);
  } else {
    console.warn(`  ⚠ No SUNNAH_COM_API_KEY found — using GitHub fallback for ${col.slug}`);
    await ingestCollectionViaGitHub(col.slug, col.githubId);
  }
}

async function main() {
  console.log('=== NoorAI Hadith Ingestion ===');
  console.log(`Mode: ${SUNNAH_API_KEY ? 'sunnah.com API' : 'GitHub fallback'}\n`);

  await Promise.all(COLLECTIONS.map(col => limit(() => ingestCollection(col))));

  const result = await query('SELECT grade, COUNT(*) FROM hadith GROUP BY grade ORDER BY grade');
  console.log('\n=== Hadith counts by grade ===');
  for (const row of result.rows) {
    console.log(`  ${row.grade}: ${row.count}`);
  }

  const sahihHasan = await query(
    "SELECT COUNT(*) FROM hadith WHERE grade IN ('sahih','hasan')"
  );
  console.log(
    `\n✅ Hadith ingestion complete. ${sahihHasan.rows[0].count} sahih/hasan hadith available for AI answers.`
  );

  await pool.end();
}

main().catch(err => {
  console.error('Ingestion failed:', err);
  process.exit(1);
});

import OpenAI from 'openai';
import pLimit from 'p-limit';
import pRetry from 'p-retry';
import dotenv from 'dotenv';

dotenv.config({ path: require('path').resolve(__dirname, '../../../.env') });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL ?? 'text-embedding-3-small';
const DIMENSIONS = parseInt(process.env.EMBEDDING_DIMENSIONS ?? '1536', 10);

// Rate-limit to 20 concurrent embedding calls to stay within OpenAI limits
const limit = pLimit(20);

export async function embedText(text: string): Promise<number[]> {
  return pRetry(
    async () => {
      const response = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: text.slice(0, 8192), // max token safety
        dimensions: DIMENSIONS,
      });
      return response.data[0].embedding;
    },
    { retries: 5, minTimeout: 1000, factor: 2 }
  );
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  const tasks = texts.map(t => limit(() => embedText(t)));
  return Promise.all(tasks);
}

/**
 * Build a rich embedding text from Quran verse data.
 * Combining Arabic + English gives better multilingual retrieval.
 */
export function buildVerseEmbedText(params: {
  surahNameEn: string;
  surahNumber: number;
  ayahNumber: number;
  arabicText: string;
  englishText: string;
}): string {
  return [
    `Quran ${params.surahNumber}:${params.ayahNumber} — Surah ${params.surahNameEn}`,
    params.arabicText,
    params.englishText,
  ].join('\n');
}

/**
 * Build a rich embedding text for a hadith record.
 */
export function buildHadithEmbedText(params: {
  collectionName: string;
  hadithNumber: number;
  arabicText: string;
  englishText: string;
  narratorChain?: string;
}): string {
  const parts = [
    `Hadith from ${params.collectionName}, number ${params.hadithNumber}`,
    params.arabicText,
    params.englishText,
  ];
  if (params.narratorChain) parts.push(`Narrator chain: ${params.narratorChain}`);
  return parts.join('\n');
}

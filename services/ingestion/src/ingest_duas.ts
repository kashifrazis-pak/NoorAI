/**
 * Hisnul Muslim (Fortress of the Muslim) Duas Ingestion
 *
 * Fetches the duas dataset from the open-source islamic-api GitHub dataset.
 * Run: npx ts-node --project tsconfig.json src/ingest_duas.ts
 */
import axios from 'axios';
import pRetry from 'p-retry';
import { pool, query } from './db';
import { embedText } from './embedder';
import dotenv from 'dotenv';

dotenv.config({ path: require('path').resolve(__dirname, '../../../.env') });

// Open-source Hisnul Muslim dataset (structured JSON)
const DATASET_URL =
  'https://raw.githubusercontent.com/AnAnonymousFriend/Dhikr-API/main/data/en.json';

interface DuaEntry {
  id?: number;
  category: string;
  arabic: string;
  transliteration?: string;
  translation: string;
  source?: string;
  reference?: string;
}

async function fetchDuas(): Promise<DuaEntry[]> {
  const resp = await pRetry(
    () => axios.get(DATASET_URL, { timeout: 30_000 }),
    { retries: 5, minTimeout: 2000 }
  );

  const raw = resp.data;
  const duas: DuaEntry[] = [];

  // Handle both array and object-keyed formats
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (item.arabic && item.translation) duas.push(item);
    }
  } else {
    for (const [category, entries] of Object.entries(raw)) {
      const arr = Array.isArray(entries) ? entries : [entries];
      for (const e of arr as Record<string, string>[]) {
        if (e.arabic && e.translation) {
          duas.push({ category, ...e } as DuaEntry);
        }
      }
    }
  }

  return duas;
}

async function main() {
  console.log('=== NoorAI Hisnul Muslim Duas Ingestion ===\n');

  let duas: DuaEntry[] = [];
  try {
    duas = await fetchDuas();
    console.log(`Fetched ${duas.length} duas from dataset.`);
  } catch {
    console.warn('Primary dataset unavailable — using built-in seed duas.');
    duas = SEED_DUAS;
  }

  let stored = 0;
  for (const dua of duas) {
    const embedInput = `${dua.category}: ${dua.translation.slice(0, 1500)}`;
    const embedding = await embedText(embedInput);
    const embeddingStr = `[${embedding.join(',')}]`;

    await query(
      `INSERT INTO duas
         (category, title, arabic_text, transliteration, translations, source, reference, embedding_vector)
       VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7,$8::vector)
       ON CONFLICT DO NOTHING`,
      [
        dua.category,
        dua.category,
        dua.arabic,
        dua.transliteration ?? null,
        JSON.stringify({ en: dua.translation }),
        dua.source ?? 'Hisnul Muslim',
        dua.reference ?? null,
        embeddingStr,
      ]
    );
    stored++;
    if (stored % 10 === 0) process.stdout.write(`  ${stored} duas stored...\r`);
  }

  console.log(`\n✅ Done. ${stored} duas stored.`);
  await pool.end();
}

// Seed duas in case the GitHub dataset is unreachable
const SEED_DUAS: DuaEntry[] = [
  {
    category: 'Morning',
    arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ',
    transliteration: "Asbahna wa asbahal mulku lillah walhamdu lillah, la ilaha illallah wahdahu la shareeka lah",
    translation: "We have reached the morning and at this very time unto Allah belongs all sovereignty, and all praise is for Allah. None has the right to be worshipped except Allah, alone, without partner.",
    source: 'Abu Dawud 4: 317',
    reference: 'Hisnul Muslim 1',
  },
  {
    category: 'Evening',
    arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ',
    transliteration: "Amsayna wa amsal mulku lillah walhamdu lillah, la ilaha illallah wahdahu la shareeka lah",
    translation: "We have reached the evening and at this very time unto Allah belongs all sovereignty, and all praise is for Allah. None has the right to be worshipped except Allah, alone, without partner.",
    source: 'Abu Dawud 4: 317',
    reference: 'Hisnul Muslim 2',
  },
  {
    category: 'Before Sleep',
    arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    transliteration: 'Bismika Allahumma amootu wa ahya',
    translation: 'In Your name O Allah, I die and I live.',
    source: 'Al-Bukhari 11: 113',
    reference: 'Hisnul Muslim 100',
  },
  {
    category: 'Upon Waking',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    transliteration: 'Alhamdu lillahil-lathee ahyana ba\'da ma amatana wa ilayhin-nushoor',
    translation: 'All praise is for Allah who gave us life after having taken it from us and unto Him is the resurrection.',
    source: 'Al-Bukhari 11: 113',
    reference: 'Hisnul Muslim 108',
  },
  {
    category: 'Before Eating',
    arabic: 'بِسْمِ اللَّهِ',
    transliteration: 'Bismillah',
    translation: 'In the name of Allah.',
    source: 'Abu Dawud 3: 347',
    reference: 'Hisnul Muslim 193',
  },
  {
    category: 'After Eating',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ',
    transliteration: "Alhamdu lillahil-lathee at'amana wasaqana waja'alana muslimeen",
    translation: 'All praise is for Allah who fed us and gave us drink and who made us Muslims.',
    source: 'Abu Dawud 3: 347',
    reference: 'Hisnul Muslim 197',
  },
  {
    category: 'Entering the Mosque',
    arabic: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
    transliteration: 'Allahumma iftah lee abwaba rahmatik',
    translation: 'O Allah, open the gates of Your mercy for me.',
    source: 'Muslim 1: 494',
    reference: 'Hisnul Muslim 67',
  },
  {
    category: 'Leaving the Mosque',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ',
    transliteration: 'Allahumma innee as\'aluka min fadlik',
    translation: 'O Allah, I ask You from Your favour.',
    source: 'Muslim 1: 494',
    reference: 'Hisnul Muslim 68',
  },
  {
    category: 'Anxiety and Sorrow',
    arabic: 'اللَّهُمَّ إِنِّي عَبْدُكَ وَابْنُ عَبْدِكَ وَابْنُ أَمَتِكَ، نَاصِيَتِي بِيَدِكَ، مَاضٍ فِيَّ حُكْمُكَ، عَدْلٌ فِيَّ قَضَاؤُكَ',
    transliteration: "Allahumma innee 'abduka wabnu 'abdika wabnu amatika, nasiyatee biyadika, madin fiyya hukmuka, 'adlun fiyya qada'uk",
    translation: 'O Allah, I am Your servant, son of Your servant, son of Your maidservant. My forelock is in Your hand, Your command over me is forever executed and Your decree over me is just.',
    source: 'Ahmad 1: 391',
    reference: 'Hisnul Muslim 120',
  },
  {
    category: 'Seeking Forgiveness',
    arabic: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيَّ الْقَيُّومَ وَأَتُوبُ إِلَيْهِ',
    transliteration: "Astaghfirullaha al-'atheema al-lathee la ilaha illa huwal-hayyul-qayyoom wa atoobu ilayh",
    translation: 'I seek forgiveness from Allah the Magnificent, whom there is none worthy of worship except Him, the Ever-Living, the Sustainer of existence, and I repent to Him.',
    source: 'Abu Dawud, At-Tirmidhi',
    reference: 'Hisnul Muslim 131',
  },
  {
    category: 'Travel',
    arabic: 'اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ',
    transliteration: "Allahu akbar, Allahu akbar, Allahu akbar, subhanal-lathee sakhkhara lana hatha wama kunna lahu muqrineen",
    translation: 'Allah is the greatest, Allah is the greatest, Allah is the greatest. How perfect He is, the One Who has placed this (transport) at our service, and we ourselves would not have been capable of that.',
    source: 'Abu Dawud 2: 78, At-Tirmidhi 5: 501',
    reference: 'Hisnul Muslim 173',
  },
  {
    category: 'Rain',
    arabic: 'اللَّهُمَّ صَيِّباً نَافِعاً',
    transliteration: 'Allahumma sayyiban nafi\'a',
    translation: 'O Allah, may it be a beneficial rain.',
    source: 'Al-Bukhari, Fath al-Bari 2: 518',
    reference: 'Hisnul Muslim 60',
  },
  {
    category: 'Protection',
    arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    transliteration: "Bismillahil-lathee la yadurru ma'asmihi shay'un fil-ardi wala fis-sama'i wahuwa as-samee'ul 'aleem",
    translation: 'In the name of Allah with whose name nothing is harmed on earth nor in the heavens and He is the All-Seeing, the All-Knowing.',
    source: 'Abu Dawud 4: 323, At-Tirmidhi 5: 465',
    reference: 'Hisnul Muslim 27',
  },
];

main().catch(err => { console.error('Ingestion failed:', err); process.exit(1); });

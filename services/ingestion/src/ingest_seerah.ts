/**
 * Seerah Ingestion — Ar-Raheeq Al-Makhtum (The Sealed Nectar)
 *
 * Seeds key chapters of the Prophet's biography as searchable knowledge chunks.
 * Run: npx ts-node --project tsconfig.json src/ingest_seerah.ts
 */
import { pool, query } from './db';
import { embedText } from './embedder';
import dotenv from 'dotenv';

dotenv.config({ path: require('path').resolve(__dirname, '../../../.env') });

const BOOK = 'Ar-Raheeq Al-Makhtum (The Sealed Nectar)';

const CHAPTERS: Array<{ num: number; title: string; content: string }> = [
  {
    num: 1,
    title: 'Arabia Before Islam (The Age of Ignorance)',
    content: `Before the advent of Islam, Arabia was steeped in a period known as Jahiliyyah — the Age of Ignorance. The Arabian Peninsula, surrounded by the Red Sea to the west, the Arabian Sea to the south, and the Persian Gulf to the east, was home to a diverse population of nomadic Bedouin tribes and settled city-dwellers. The Kaaba in Makkah, built by Ibrahim (Abraham) and his son Ismail (Ishmael), had become a centre of idol worship, housing 360 idols. Tribal warfare, blood feuds, infanticide (particularly of girls), slavery, and severe social inequality were widespread. Despite this moral darkness, the Arabs had a rich tradition of poetry and oral literature, a strong code of tribal honour, and were skilled traders. The Quraysh tribe, custodians of the Kaaba, held great prestige. It was into this environment that the Prophet Muhammad ﷺ would be born to transform humanity.`,
  },
  {
    num: 2,
    title: 'The Birth and Early Life of the Prophet Muhammad ﷺ',
    content: `Muhammad ﷺ was born in Makkah in the Year of the Elephant (approximately 570 CE), so named because of Abraha's failed military expedition with war elephants to destroy the Kaaba — an event mentioned in Surah Al-Feel. His father, Abdullah ibn Abdul Muttalib, died before his birth, making him an orphan from the start. He was born into the noble Banu Hashim clan of the Quraysh. He was nursed by Haleema al-Sa'diyyah in the desert according to the Arab tradition of strengthening children among the Bedouin. His mother Aminah died when he was six, after which his grandfather Abdul Muttalib cared for him until his own death two years later. The Prophet ﷺ then came under the care of his uncle Abu Talib. As a young man, he worked as a shepherd and then as a trader, earning the titles Al-Sadiq (the Truthful) and Al-Amin (the Trustworthy) from the people of Makkah.`,
  },
  {
    num: 3,
    title: 'Marriage to Khadijah and the First Revelation',
    content: `At the age of twenty-five, Muhammad ﷺ was hired by Khadijah bint Khuwaylid, a respected and wealthy merchant widow, to lead her trade caravan to Syria. Impressed by his honesty and character, Khadijah proposed marriage to him. Despite being fifteen years older, their marriage was one of deep love and partnership. They had six children together — two sons who died in infancy and four daughters: Zaynab, Ruqayyah, Umm Kulthum, and Fatimah. Khadijah was the first to believe in his prophethood. The Prophet ﷺ was in the habit of secluding himself in the Cave of Hira on Mount Nour for contemplation. At the age of forty, in the month of Ramadan, the Archangel Jibreel (Gabriel) appeared and commanded him to "Read!" — the first word of the first revelation. Terrified, he returned to Khadijah, who wrapped him in a cloak, reassured him, and took him to her cousin Waraqah ibn Nawfal, a Christian scholar, who confirmed that this was the same angel who had come to Moses.`,
  },
  {
    num: 4,
    title: 'The Early Days of Islam and Persecution in Makkah',
    content: `The Prophet ﷺ began calling people to Islam secretly for three years, then publicly. The first believers were Khadijah, his cousin Ali ibn Abi Talib (then a young boy), his friend Abu Bakr, and his freed slave Zayd ibn Haritha. The Quraysh leadership fiercely opposed Islam, as it threatened their polytheistic religion, social order, and economic interests tied to the Kaaba. Muslims faced severe persecution — insults, torture, economic boycotts, and murder. Bilal ibn Rabah, an Abyssinian slave, was tortured in the hot sun by his master Umayyah ibn Khalaf; Abu Bakr purchased and freed him. The family of Yasir — Ammar, Yasir, and Sumayyah — were tortured; Sumayyah became the first martyr of Islam. To escape persecution, the Prophet ﷺ allowed a group of Muslims to migrate to Abyssinia, where the just Christian King Najashi (Negus) granted them protection. The Quraysh sent emissaries to demand their return, but after Ja'far ibn Abi Talib recited Surah Maryam before the Negus, he refused to hand them over.`,
  },
  {
    num: 5,
    title: 'The Year of Sorrow and the Night Journey (Isra and Miraj)',
    content: `In the tenth year of prophethood, the Prophet ﷺ suffered tremendous personal loss — the death of his beloved wife Khadijah and his protective uncle Abu Talib within the same year. This became known as Aam al-Huzn — the Year of Sorrow. Without Abu Talib's tribal protection, the Prophet ﷺ became more vulnerable to Qurayshi persecution. His attempt to seek support in Ta'if was met with mockery and physical violence — the people set their children upon him, pelting him with stones until his feet bled. Despite this, when Jibreel offered to destroy the city, the Prophet ﷺ refused and prayed instead for their guidance. Shortly after, Allah honoured him with the miraculous Night Journey — Al-Isra wal-Miraj. He was taken from Masjid al-Haram in Makkah to Masjid al-Aqsa in Jerusalem, and then ascended through the heavens, meeting the prophets and ultimately receiving the obligation of the five daily prayers directly from Allah — reduced from fifty to five through the Prophet's repeated intercession on the advice of Prophet Musa.`,
  },
  {
    num: 6,
    title: 'The Hijra — Migration to Madinah',
    content: `After thirteen years of preaching in Makkah and enduring persecution, Allah permitted the Prophet ﷺ to migrate to Yathrib (later renamed Madinah — City of the Prophet). The Quraysh had hatched a plot to assassinate him, sending one young man from each tribe so that responsibility for his blood would be distributed, preventing retaliation by his clan. The Prophet ﷺ miraculously escaped, sprinkling dust on the plotters as he walked past them reciting the opening of Surah Ya-Sin. He and Abu Bakr hid in the Cave of Thawr for three days — when Qurayshi scouts came to the cave entrance, a spider's web and nesting birds made them think no one could be inside. The Hijra in 622 CE marks the beginning of the Islamic calendar. The people of Madinah, known as the Ansar (Helpers), welcomed the migrants (Muhajirun) with open arms. The Prophet ﷺ established the Constitution of Madinah, creating the first Islamic state with a framework of rights and responsibilities for all communities.`,
  },
  {
    num: 7,
    title: 'The Battles — Badr, Uhud, and the Trench',
    content: `The Muslims were now permitted to defend themselves militarily. The Battle of Badr (2 AH / 624 CE) was a decisive victory — 313 ill-equipped Muslims defeated a Qurayshi army of around 1,000. The Quran describes this as divine assistance: angels fighting alongside the believers. The Battle of Uhud (3 AH / 625 CE) demonstrated the consequences of disobeying the Prophet's orders — archers abandoned their positions for war booty, allowing the Qurayshi cavalry to outflank the Muslims. Seventy companions were martyred, including Hamza, the Prophet's uncle. The Prophet ﷺ himself was injured. However, when Abu Sufyan's army retreated without dealing a finishing blow, it was a strategic loss for Quraysh. The Battle of the Trench (Al-Khandaq, 5 AH / 627 CE) saw the Confederates — a coalition of Quraysh, Ghatafan, and other tribes — besiege Madinah with 10,000 warriors. On the suggestion of the Persian companion Salman al-Farisi, the Muslims dug a trench, rendering the cavalry useless. After weeks of siege and internal treachery by the Banu Qurayza, a supernatural windstorm dispersed the Confederates — as described in Surah Al-Ahzab.`,
  },
  {
    num: 8,
    title: 'The Treaty of Hudaybiyyah and the Conquest of Makkah',
    content: `In 6 AH, the Prophet ﷺ set out with 1,400 companions intending to perform Umrah. The Quraysh blocked them at Hudaybiyyah. The resulting treaty appeared one-sided — Muslims could not enter Makkah that year, any Makkan who came to Madinah must be returned, but any Muslim who defected to Makkah need not be returned. Yet the Prophet ﷺ accepted it, and the Quran called it a manifest victory (Surah Al-Fath). The treaty opened the door to peaceful propagation, and thousands entered Islam in the two years that followed. When Quraysh violated the treaty by aiding an attack on the Banu Khuza'ah, the Prophet ﷺ mobilised an army of 10,000. In 8 AH, the Conquest of Makkah occurred almost bloodlessly. The Prophet ﷺ entered the Kaaba and removed all idols, declaring a general amnesty: "Go, for you are free." Among those who accepted Islam that day was Abu Sufyan, the longtime leader of Qurayshi opposition.`,
  },
  {
    num: 9,
    title: 'The Farewell Pilgrimage and the Death of the Prophet ﷺ',
    content: `In 10 AH (632 CE), the Prophet ﷺ performed his one and only Hajj — the Farewell Pilgrimage — with over 100,000 companions. On the plain of Arafat, he delivered the Farewell Sermon: a landmark declaration of human rights affirming the sanctity of life, property, and honour; the abolition of tribal blood feuds and usury; equality of all people regardless of race; and the rights of women. He declared: "I have left among you two things; you will never go astray as long as you hold fast to them: the Book of Allah and my Sunnah." The final verse of the Quran was revealed: "Today I have perfected your religion for you, completed My favour upon you, and chosen Islam as your way." [Al-Ma'idah 5:3]. Returning to Madinah, the Prophet ﷺ fell ill. On Monday, 12 Rabi' al-Awwal, 11 AH, he passed away at the age of 63 in the arms of his wife Aisha. Abu Bakr addressed the grieving companions: "Whoever worshipped Muhammad, know that Muhammad has died. But whoever worships Allah, know that Allah is Ever-Living and never dies." He was buried where he passed away — beneath the floor of Aisha's room, now within Masjid an-Nabawi in Madinah.`,
  },
  {
    num: 10,
    title: 'The Character and Legacy of the Prophet Muhammad ﷺ',
    content: `Those who knew the Prophet ﷺ described him as the living embodiment of the Quran. His wife Aisha, when asked about his character, said: "His character was the Quran." He was known for extraordinary gentleness, generosity, and mercy — never striking a servant, never taking revenge for personal harm, and always smiling in the company of others. He mended his own clothes, milked his own goats, and helped with household work. He was the most just in his dealings, the most courageous in battle, and the most forgiving in victory. He wept in prayer, laughed with children, and stood up in respect when his daughter Fatimah entered. He united warring Arabian tribes into a single brotherhood, elevated the status of women, freed slaves, and established a system of social welfare. Within a century of his death, the message he brought had spread from Spain to China. His legacy — the Quran preserved word for word, and his authenticated Sunnah — remains the complete and final guidance for all of humanity until the Day of Judgement.`,
  },
];

async function main() {
  console.log('=== NoorAI Seerah Ingestion — Ar-Raheeq Al-Makhtum ===\n');

  for (const ch of CHAPTERS) {
    const embedding = await embedText(
      `${BOOK} — Chapter ${ch.num}: ${ch.title}\n\n${ch.content.slice(0, 2000)}`
    );
    const embeddingStr = `[${embedding.join(',')}]`;

    await query(
      `INSERT INTO seerah (book_title, chapter_number, chapter_title, content, language, embedding_vector)
       VALUES ($1,$2,$3,$4,'en',$5::vector)
       ON CONFLICT (book_title, chapter_number, language) DO UPDATE SET
         content = EXCLUDED.content,
         embedding_vector = EXCLUDED.embedding_vector,
         updated_at = NOW()`,
      [BOOK, ch.num, ch.title, ch.content, embeddingStr]
    );
    console.log(`  ✓ Chapter ${ch.num}: ${ch.title}`);
  }

  const result = await query('SELECT COUNT(*) FROM seerah');
  console.log(`\n✅ Done. ${result.rows[0].count} seerah chapters stored.`);
  await pool.end();
}

main().catch(err => { console.error('Ingestion failed:', err); process.exit(1); });

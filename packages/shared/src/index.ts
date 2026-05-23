// ── Shared types used by both web and mobile apps ─────────────────────────

export type HadithGrade = 'sahih' | 'hasan' | 'daif' | 'mawdu' | 'unknown';
export type UserRole = 'user' | 'scholar' | 'admin';
export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type ContentType = 'verse' | 'hadith';

export interface Citation {
  type: ContentType;
  label: string;
  arabic_text: string;
  translation: string;
  surah_number?: number;
  ayah_number?: number;
  collection_slug?: string;
  hadith_number?: number;
  grade?: HadithGrade;
}

export interface AskResponse {
  answer_id: string;
  answer_text: string;
  citations: Citation[];
  confidence: ConfidenceLevel;
  language: string;
  from_cache: boolean;
}

export interface QuranVerse {
  id: string;
  surah_number: number;
  surah_name_en: string;
  surah_name_ar: string;
  ayah_number: number;
  arabic_text: string;
  translations: Record<string, string>;
  juz_number?: number;
}

export interface Hadith {
  id: string;
  collection_slug: string;
  book_number: number;
  book_name_en: string;
  hadith_number: number;
  grade: HadithGrade;
  arabic_text: string;
  translations: Record<string, string>;
  narrator_chain?: string;
}

export interface DailyContent {
  date: string;
  verse?: {
    id: string;
    reference: string;
    arabic_text: string;
    translation: string;
  };
  hadith?: {
    id: string;
    reference: string;
    arabic_text: string;
    translation: string;
    grade: HadithGrade;
  };
}

export interface SearchResult {
  type: ContentType;
  id: string;
  label: string;
  arabic_text: string;
  translation: string;
  grade?: HadithGrade;
}

export interface User {
  id: string;
  email: string;
  display_name: string;
  preferred_language: string;
  role: UserRole;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
}

// ── Supported languages ────────────────────────────────────────────────────

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', rtl: false },
  { code: 'ar', label: 'العربية', rtl: true },
  { code: 'ur', label: 'اردو', rtl: true },
  { code: 'fr', label: 'Français', rtl: false },
  { code: 'tr', label: 'Türkçe', rtl: false },
  { code: 'id', label: 'Bahasa Indonesia', rtl: false },
  { code: 'bn', label: 'বাংলা', rtl: false },
  { code: 'ms', label: 'Bahasa Melayu', rtl: false },
] as const;

export type SupportedLanguageCode = typeof SUPPORTED_LANGUAGES[number]['code'];

// ── Hadith collection metadata ─────────────────────────────────────────────

export const HADITH_COLLECTIONS: Record<string, { name: string; nameAr: string }> = {
  bukhari:  { name: 'Sahih al-Bukhari',       nameAr: 'صحيح البخاري' },
  muslim:   { name: 'Sahih Muslim',           nameAr: 'صحيح مسلم' },
  abudawud: { name: 'Sunan Abu Dawud',        nameAr: 'سنن أبي داود' },
  tirmidhi: { name: "Jami' al-Tirmidhi",      nameAr: 'جامع الترمذي' },
  nasai:    { name: "Sunan al-Nasa'i",        nameAr: 'سنن النسائي' },
  ibnmajah: { name: 'Sunan Ibn Majah',        nameAr: 'سنن ابن ماجه' },
  malik:    { name: 'Muwatta Imam Malik',     nameAr: 'موطأ الإمام مالك' },
  ahmad:    { name: 'Musnad Ahmad ibn Hanbal', nameAr: 'مسند أحمد' },
};

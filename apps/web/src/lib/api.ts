import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  timeout: 30_000,
});

// Attach JWT if present
api.interceptors.request.use(config => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('noorai_token') : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Types ──────────────────────────────────────────────────────────────────

export interface Citation {
  type: 'verse' | 'hadith';
  label: string;
  arabic_text: string;
  translation: string;
  surah_number?: number;
  ayah_number?: number;
  collection_slug?: string;
  hadith_number?: number;
  grade?: string;
}

export interface AskResponse {
  answer_id: string;
  answer_text: string;
  citations: Citation[];
  confidence: 'high' | 'medium' | 'low';
  language: string;
  from_cache: boolean;
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
    grade: string;
  };
}

export interface SearchResult {
  type: string;
  id: string;
  label: string;
  arabic_text: string;
  translation: string;
  grade?: string;
}

// ── API calls ──────────────────────────────────────────────────────────────

export async function askQuestion(question: string, language = 'en'): Promise<AskResponse> {
  const { data } = await api.post<AskResponse>('/ask', { question, language });
  return data;
}

export async function getDaily(language = 'en'): Promise<DailyContent> {
  const { data } = await api.get<DailyContent>('/daily', { params: { language } });
  return data;
}

export async function search(q: string, language = 'en', type = 'all'): Promise<SearchResult[]> {
  const { data } = await api.get<SearchResult[]>('/search', { params: { q, language, type } });
  return data;
}

export async function getAnswer(answerId: string) {
  const { data } = await api.get(`/answers/${answerId}`);
  return data;
}

export async function flagAnswer(answerId: string, reason: string) {
  const { data } = await api.post(`/answers/${answerId}/flag`, { reason });
  return data;
}

export async function getVerse(surah: number, ayah: number) {
  const { data } = await api.get(`/quran/${surah}/${ayah}`);
  return data;
}

export async function login(email: string, password: string) {
  const { data } = await api.post('/users/login', { email, password });
  return data;
}

export async function register(
  email: string,
  password: string,
  displayName: string,
  language = 'en'
) {
  const { data } = await api.post('/users/register', {
    email,
    password,
    display_name: displayName,
    preferred_language: language,
  });
  return data;
}

export async function getSavedItems() {
  const { data } = await api.get('/users/me/saved');
  return data;
}

export async function saveAnswer(answerId: string) {
  const { data } = await api.post('/users/me/saved', { answer_id: answerId });
  return data;
}

export default api;

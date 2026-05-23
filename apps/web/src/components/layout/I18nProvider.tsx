'use client';

import { useEffect } from 'react';
import i18n from 'i18next';
import { initReactI18next, I18nextProvider } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Minimal inline translations — expand per locale file in production
const resources = {
  en: {
    translation: {
      ask: 'Ask NoorAI',
      placeholder: 'Ask an Islamic question...',
      disclaimer: 'Educational purposes only. Not a fatwa.',
    },
  },
  ar: {
    translation: {
      ask: 'اسأل نور AI',
      placeholder: 'اطرح سؤالاً إسلامياً...',
      disclaimer: 'لأغراض تعليمية فقط. ليست فتوى.',
    },
  },
  ur: {
    translation: {
      ask: 'نور AI سے پوچھیں',
      placeholder: 'اسلامی سوال پوچھیں...',
      disclaimer: 'صرف تعلیمی مقاصد کے لیے۔ فتویٰ نہیں۔',
    },
  },
};

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'en',
      interpolation: { escapeValue: false },
    });
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

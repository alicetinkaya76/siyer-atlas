import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// TR
import trCommon from './tr/common.json';
import trNav from './tr/nav.json';
import trMuseum from './tr/museum.json';
import trPages from './tr/pages.json';

// EN
import enCommon from './en/common.json';
import enNav from './en/nav.json';
import enMuseum from './en/museum.json';
import enPages from './en/pages.json';

// AR
import arCommon from './ar/common.json';
import arNav from './ar/nav.json';
import arMuseum from './ar/museum.json';
import arPages from './ar/pages.json';

export const defaultNS = 'common';
export const namespaces = ['common', 'nav', 'museum', 'pages'] as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      tr: { common: trCommon, nav: trNav, museum: trMuseum, pages: trPages },
      en: { common: enCommon, nav: enNav, museum: enMuseum, pages: enPages },
      ar: { common: arCommon, nav: arNav, museum: arMuseum, pages: arPages },
    },
    defaultNS,
    fallbackLng: 'tr',
    supportedLngs: ['tr', 'en', 'ar'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'siyer-atlas-lang',
    },
    react: {
      useSuspense: true,
    },
  });

/** Update document dir and lang on language change */
i18n.on('languageChanged', (lng) => {
  const dir = lng === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('dir', dir);
  document.documentElement.setAttribute('lang', lng);
});

export default i18n;

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import pt from './locales/pt.json';

const INITIAL_LANG = 'pt';

try {
  if (typeof window !== 'undefined') {
    localStorage.setItem('lang', INITIAL_LANG);
  }
} catch (e) {
  // Ignore storage errors and keep the default language.
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      pt: { translation: pt }
    },
    lng: INITIAL_LANG,
    fallbackLng: 'pt',
    interpolation: { escapeValue: false }
  });

export default i18n;

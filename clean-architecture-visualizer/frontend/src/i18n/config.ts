import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enChecker from './locales/en/checker.json';
import enHome from './locales/en/home.json';
import enCodeViewer from './locales/en/codeViewer.json';
import enUseCaseInteractionCode from './locales/en/useCaseInteractionCode.json';
import enLearning from './locales/en/learning.json';

const isTestMode = 
  import.meta.env.VITE_TEST_MODE === 'true' || 
  new URLSearchParams(window.location.search).get('lng') === 'cimode';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      checker: enChecker,
      home: enHome,
      useCaseInteractionCode: enUseCaseInteractionCode,
      codeViewer: enCodeViewer,
      learning: enLearning,
    },
  },
  lng: 'en',
  fallbackLng: 'en',
  resources: { en: { checker: enChecker, home: enHome, useCaseInteractionCode: enUseCaseInteractionCode, codeViewer: enCodeViewer} },
  lng: isTestMode ? 'cimode' : 'en', 
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  // fallbackLng: 'en',
});

export default i18n;
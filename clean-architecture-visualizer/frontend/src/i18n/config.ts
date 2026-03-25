import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enChecker from './locales/en/checker.json';
import enHome from './locales/en/home.json';
import enCodeViewer from './locales/en/codeViewer.json';
import enUseCaseInteractionCode from './locales/en/useCaseInteractionCode.json';

i18n.use(initReactI18next).init({
  resources: { en: { checker: enChecker, home: enHome, useCaseInteractionCode: enUseCaseInteractionCode, codeViewer: enCodeViewer} },
  lng: 'en',
  fallbackLng: 'en',
});

export default i18n;
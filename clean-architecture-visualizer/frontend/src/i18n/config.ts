import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enChecker from './locales/en/checker.json';
import codeViewer from './locales/en/codeViewer.json';
import useCaseInteractionCode from './locales/en/useCaseInteractionCode.json';

i18n.use(initReactI18next).init({
  resources: { en: { checker: enChecker, useCaseInteractionCode: useCaseInteractionCode, codeViewer: codeViewer} },
  lng: 'en',
  fallbackLng: 'en',
});

export default i18n;
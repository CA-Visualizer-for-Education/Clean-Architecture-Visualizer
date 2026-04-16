import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enChecker from './locales/en/checker.json';
import enHome from './locales/en/home.json';
import enCommon from './locales/en/common.json';
import enLegend from './locales/en/legend.json';
import enCodeViewer from './locales/en/codeViewer.json';
import enViolationsSideBarContent from './locales/en/violationsSideBarContent.json';
import enUseCaseInteractionCode from './locales/en/useCaseInteractionCode.json';
import enUseCaseInteractionDiagram from './locales/en/useCaseInteractionDiagram.json';
import enProjectStarter from './locales/en/projectStarter.json';
import enLearning from './locales/en/learning.json';

const isTestMode = 
  import.meta.env.VITE_TEST_MODE === 'true' || 
  new URLSearchParams(window.location.search).get('lng') === 'cimode';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      checker: enChecker,
      home: enHome,
      common: enCommon,
      violationsSideBarContent: enViolationsSideBarContent,
      legend: enLegend,
      useCaseInteractionCode: enUseCaseInteractionCode,
      useCaseInteractionDiagram: enUseCaseInteractionDiagram,
      codeViewer: enCodeViewer,
      projectStarter: enProjectStarter,
      learning: enLearning,
    },
  },
  lng: isTestMode ? 'cimode' : 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

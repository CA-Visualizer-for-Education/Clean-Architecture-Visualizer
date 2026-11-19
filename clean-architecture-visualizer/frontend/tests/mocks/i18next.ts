import type { ReactNode } from 'react';
import { vi } from 'vitest';

vi.mock('react-i18next', () => ({
  // biome-ignore lint/style/useNamingConvention: react-i18next exports the Trans component
  Trans: ({ children }: { children: ReactNode }) => children,

  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: () => Promise.resolve(),
      language: 'en',
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: () => {},
  },
}));

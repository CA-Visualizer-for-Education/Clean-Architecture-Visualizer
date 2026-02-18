import type { Theme } from '../lib/theme.ts';
import { defaultTheme } from '../lib/theme.ts';

export const useTheme = (): Theme => {
  return defaultTheme;
};

import type { Theme } from "../lib/theme";
import { defaultTheme } from "../lib/theme";

export const useTheme = (): Theme => {
  return defaultTheme;
};

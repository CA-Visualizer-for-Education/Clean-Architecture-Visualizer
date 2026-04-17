import { useCallback, useState } from 'react';

export function usePersistentBoolean(key: string, defaultValue: boolean) {
  const [value, setValue] = useState(() => {
    if (typeof window === 'undefined') {
      return defaultValue;
    }

    const saved = window.localStorage.getItem(key);
    return saved === null ? defaultValue : saved === 'true';
  });

  const setPersistentValue = useCallback((nextValue: boolean) => {
    setValue(nextValue);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, String(nextValue));
    }
  }, [key]);

  return [value, setPersistentValue] as const;
}
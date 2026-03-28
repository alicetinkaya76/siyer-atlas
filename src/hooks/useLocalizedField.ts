import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { LocalizedText, Language } from '@/types';

/** Extract the active language string from a LocalizedText object */
export function useLocalizedField() {
  const { i18n } = useTranslation();
  const lang = i18n.language as Language;

  const localize = useCallback(
    (field: LocalizedText | undefined | null, fallback = ''): string => {
      if (!field) return fallback;
      return field[lang] || field.tr || field.en || fallback;
    },
    [lang],
  );

  return { localize, lang };
}

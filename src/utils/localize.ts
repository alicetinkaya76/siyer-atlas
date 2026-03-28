import type { LocalizedText, Language } from '@/types';

/**
 * Extract a string from a LocalizedText object by language key.
 * Falls back to Turkish → English → first available.
 */
export function localize(field: LocalizedText | undefined | null, lang: Language, fallback = ''): string {
  if (!field) return fallback;
  return field[lang] || field.tr || field.en || fallback;
}

/**
 * Slugify a localized name for URL usage.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[çÇ]/g, 'c')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[ıİ]/g, 'i')
    .replace(/[öÖ]/g, 'o')
    .replace(/[şŞ]/g, 's')
    .replace(/[üÜ]/g, 'u')
    .replace(/[âÂ]/g, 'a')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/**
 * Format a Hijri–CE date string.
 */
export function formatDateRange(startCE?: number, endCE?: number): string {
  if (!startCE) return '';
  if (!endCE || startCE === endCE) return `${startCE} CE`;
  return `${startCE}–${endCE} CE`;
}

/* ─── COMMON TYPES — Siyer Atlas v3.0 ─── */

/** Trilingual text field */
export interface LocalizedText {
  tr: string;
  en: string;
  ar: string;
}

/** Geographic coordinate */
export interface Coordinate {
  lat: number;
  lng: number;
}

/** Historical period */
export type Period = 'mekke' | 'medine' | 'hulefa';

/** Date range in CE */
export interface DateRange {
  start: number;
  end?: number;
}

/** Museum visual type */
export type VisualType =
  | 'svg_technical'
  | 'svg_illustration'
  | 'reconstruction'
  | 'map_overlay'
  | 'photo_wikimedia'
  | 'none';

/** Museum category key */
export type MuseumCategoryKey =
  | 'weapons'
  | 'architecture'
  | 'daily_life'
  | 'geography'
  | 'medical'
  | 'manuscripts'
  | 'flags';

/** View mode for list displays */
export type ViewMode = 'grid' | 'list' | 'map' | 'gallery';

/** Sort direction */
export type SortOrder = 'asc' | 'desc';

/** Search result wrapper */
export interface SearchResult<T = unknown> {
  item: T;
  score: number;
  type: 'companion' | 'battle' | 'location' | 'hadith' | 'esbab' | 'museum' | 'tribe' | 'audio';
  label: LocalizedText;
  url: string;
}

/** Supported languages */
export type Language = 'tr' | 'en' | 'ar';

/** Theme mode */
export type ThemeMode = 'light' | 'dark' | 'system';

/** Cross-reference link */
export interface CrossRef {
  type: string;
  id: string;
  label: LocalizedText;
}

/** Source reference */
export interface SourceRef {
  author: string;
  title: string;
  volume?: string;
  page?: string;
}

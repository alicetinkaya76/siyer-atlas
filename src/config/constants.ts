import type { Language } from '@/types';

/* ─── APP METADATA ─── */
export const APP_NAME = 'Siyer Atlası';
export const APP_VERSION = '3.9.0';
export const APP_URL = 'https://siyeratlas.org';
export const SISTER_PROJECT_URL = 'https://islamicatlas.org';

/* ─── MAP DEFAULTS ─── */
export const MAP_CENTER = { lat: 24.4672, lng: 39.6112 }; // Medina
export const MAP_DEFAULT_ZOOM = 6;
export const MAP_BOUNDS = {
  sw: { lat: 12.0, lng: 25.0 },
  ne: { lat: 42.0, lng: 65.0 },
};
export const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>';

/* ─── TIMELINE ─── */
export const TIMELINE_START = 570;
export const TIMELINE_END = 661;
export const ERA_RANGES = {
  mekke: { start: 570, end: 622, label: { tr: 'Mekke Dönemi', en: 'Meccan Period', ar: 'العهد المكي' } },
  medine: { start: 622, end: 632, label: { tr: 'Medine Dönemi', en: 'Medinan Period', ar: 'العهد المدني' } },
  hulefa: { start: 632, end: 661, label: { tr: 'Hulefâ-i Râşidîn', en: 'Rashidun Caliphs', ar: 'الخلفاء الراشدون' } },
} as const;

/* ─── DATA COUNTS ─── */
export const DATA_COUNTS = {
  companions: 436,
  battles: 97,
  locations: 185,
  hadith: 387,
  esbab: 355,
  tribes: 124,
  tabieen: 350,
  teacherStudentEdges: 674,
  museumItems: 260,
  audioEpisodes: 160,
  svgAssets: 31,
  reconstructions: 89,
} as const;

/* ─── LANGUAGES ─── */
export const LANGUAGES: { code: Language; label: string; dir: 'ltr' | 'rtl'; flag: string }[] = [
  { code: 'tr', label: 'Türkçe', dir: 'ltr', flag: '🇹🇷' },
  { code: 'en', label: 'English', dir: 'ltr', flag: '🇬🇧' },
  { code: 'ar', label: 'العربية', dir: 'rtl', flag: '🇸🇦' },
];

/* ─── BREAKPOINTS ─── */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

/* ─── ANIMATION ─── */
export const SPRING_CONFIG = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 25,
};

export const FADE_IN = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
};

export const STAGGER_CHILDREN = {
  animate: { transition: { staggerChildren: 0.05 } },
};

import type { MuseumCategoryMeta } from '@/types';

export const MUSEUM_CATEGORIES: MuseumCategoryMeta[] = [
  {
    key: 'weapons',
    icon: '⚔️',
    color: '#8B4513',
    label: { tr: 'Silahlar', en: 'Weapons', ar: 'الأسلحة' },
    count: 47,
    subcategories: ['swords', 'spears_lances', 'armor', 'bows_arrows', 'shields', 'siege_equipment', 'helmets', 'daggers'],
    visualTypes: ['svg_technical'],
    hasMap: false,
  },
  {
    key: 'architecture',
    icon: '🕌',
    color: '#1a6b4a',
    label: { tr: 'Mimari', en: 'Architecture', ar: 'العمارة' },
    count: 52,
    subcategories: ['houses', 'markets_buildings', 'mosques', 'sacred_structures', 'camps_tents', 'fortifications'],
    visualTypes: ['reconstruction'],
    hasMap: true,
  },
  {
    key: 'daily_life',
    icon: '🏺',
    color: '#b8860b',
    label: { tr: 'Günlük Hayat', en: 'Daily Life', ar: 'الحياة اليومية' },
    count: 62,
    subcategories: ['cooking_utensils', 'pottery_vessels', 'food_agriculture', 'textiles_clothing', 'coins_currency', 'weights_measures', 'writing_tools', 'trade_goods', 'household_misc'],
    visualTypes: ['svg_illustration'],
    hasMap: false,
  },
  {
    key: 'geography',
    icon: '🗺️',
    color: '#2e5984',
    label: { tr: 'Coğrafya', en: 'Geography', ar: 'الجغرافيا' },
    count: 45,
    subcategories: ['sacred_sites', 'valleys_plains', 'caves_mountains', 'wells_springs', 'battlefields', 'deserts_landmarks', 'routes_roads', 'ports_coasts'],
    visualTypes: ['map_overlay', 'reconstruction'],
    hasMap: true,
  },
  {
    key: 'medical',
    icon: '🌿',
    color: '#2d6a4f',
    label: { tr: 'Tıbb-ı Nebevî', en: 'Prophetic Medicine', ar: 'الطب النبوي' },
    count: 24,
    subcategories: ['herbal', 'nebevi_tedavi', 'therapeutic', 'nebevi_gida', 'hygiene', 'surgical', 'alet'],
    visualTypes: ['none', 'svg_illustration'],
    hasMap: false,
  },
  {
    key: 'manuscripts',
    icon: '📜',
    color: '#6b3a2a',
    label: { tr: 'Yazma & Vesîka', en: 'Manuscripts', ar: 'المخطوطات والوثائق' },
    count: 17,
    subcategories: ['mushaf', 'sahife', 'hadith_collection', 'mektup', 'treaty', 'vesika'],
    visualTypes: ['none', 'photo_wikimedia'],
    hasMap: false,
  },
  {
    key: 'flags',
    icon: '🏴',
    color: '#1a1a2e',
    label: { tr: 'Sancak & Bayrak', en: 'Banners', ar: 'الرايات والأعلام' },
    count: 13,
    subcategories: ['rayah', 'liwaa', 'sefer_sancagi', 'kabile_sancagi'],
    visualTypes: ['none', 'svg_illustration'],
    hasMap: false,
  },
];

export const getCategoryByKey = (key: string) =>
  MUSEUM_CATEGORIES.find((c) => c.key === key);

export const getCategoryColor = (key: string) =>
  getCategoryByKey(key)?.color ?? '#6b6b6b';

export const getCategoryIcon = (key: string) =>
  getCategoryByKey(key)?.icon ?? '🏛️';

/* ─── BATTLE → SVG MAPPING — Siyer Atlas v4.0 ─── */

const BASE = import.meta.env.BASE_URL || '/';
const SVG_DIR = `${BASE}assets/museum/svg`;

export interface BattleSvgEntry {
  /** Primary formation/map SVG */
  primary: string;
  /** Optional secondary SVG (e.g. cross-section) */
  secondary?: string;
  /** Caption for the SVG */
  caption: { tr: string; en: string; ar: string };
  /** Secondary caption */
  captionSecondary?: { tr: string; en: string; ar: string };
}

/**
 * Maps battle IDs → SVG file paths.
 * Keys match battles.json `id` field.
 */
export const BATTLE_SVG_MAP: Record<string, BattleSvgEntry> = {
  gazve_bedir: {
    primary: `${SVG_DIR}/bedir_battle_formation.svg`,
    caption: {
      tr: 'Bedir Gazvesi — Savaş Düzeni (17 Ramazan 2 H. / 624 CE)',
      en: 'Battle of Badr — Battle Formation (17 Ramadan 2 AH / 624 CE)',
      ar: 'غزوة بدر — خطة المعركة (17 رمضان 2 هـ / 624 م)',
    },
  },
  gazve_uhud: {
    primary: `${SVG_DIR}/uhud_battle_formation.svg`,
    caption: {
      tr: 'Uhud Gazvesi — Savaş Düzeni (7 Şevval 3 H. / 625 CE)',
      en: 'Battle of Uhud — Battle Formation (7 Shawwal 3 AH / 625 CE)',
      ar: 'غزوة أحد — خطة المعركة (7 شوال 3 هـ / 625 م)',
    },
  },
  gazve_hendek: {
    primary: `${SVG_DIR}/khandaq_defense_line.svg`,
    secondary: `${SVG_DIR}/khandaq_cross_section.svg`,
    caption: {
      tr: 'Hendek Gazvesi — Savunma Hattı (Şevval 5 H. / 627 CE)',
      en: 'Battle of the Trench — Defense Line (Shawwal 5 AH / 627 CE)',
      ar: 'غزوة الخندق — خط الدفاع (شوال 5 هـ / 627 م)',
    },
    captionSecondary: {
      tr: 'Hendek Kesit Görünümü',
      en: 'Trench Cross-Section View',
      ar: 'مقطع عرضي للخندق',
    },
  },
  gazve_hudeybiye: {
    primary: `${SVG_DIR}/hudeybiye_map.svg`,
    caption: {
      tr: 'Hudeybiye Antlaşması — Konum Haritası (6 H. / 628 CE)',
      en: 'Treaty of Hudaybiyyah — Location Map (6 AH / 628 CE)',
      ar: 'صلح الحديبية — خريطة الموقع (6 هـ / 628 م)',
    },
  },
  gazve_fetih_mekke: {
    primary: `${SVG_DIR}/mekke_fethi_route.svg`,
    caption: {
      tr: 'Mekke\'nin Fethi — Güzergâh Haritası (20 Ramazan 8 H. / 630 CE)',
      en: 'Conquest of Mecca — Route Map (20 Ramadan 8 AH / 630 CE)',
      ar: 'فتح مكة — خريطة المسار (20 رمضان 8 هـ / 630 م)',
    },
  },
  /* ─── Alias for recon_index mismatch ─── */
  gazve_mekke_fethi: {
    primary: `${SVG_DIR}/mekke_fethi_route.svg`,
    caption: {
      tr: 'Mekke\'nin Fethi — Güzergâh Haritası (20 Ramazan 8 H. / 630 CE)',
      en: 'Conquest of Mecca — Route Map (20 Ramadan 8 AH / 630 CE)',
      ar: 'فتح مكة — خريطة المسار (20 رمضان 8 هـ / 630 م)',
    },
  },
};

/**
 * Related SVGs that can appear contextually (e.g. Hicret route on migration events)
 */
export const CONTEXTUAL_SVG_MAP: Record<string, { path: string; caption: { tr: string; en: string; ar: string } }> = {
  hijra: {
    path: `${SVG_DIR}/hijra_route_map.svg`,
    caption: { tr: 'Hicret Güzergâhı', en: 'Hijra Route', ar: 'مسار الهجرة' },
  },
  isra_mirac: {
    path: `${SVG_DIR}/isra_mirac_route.svg`,
    caption: { tr: 'İsrâ ve Mi\'râc', en: 'Isra and Mi\'raj', ar: 'الإسراء والمعراج' },
  },
  hicaz: {
    path: `${SVG_DIR}/hejaz_regional_map.svg`,
    caption: { tr: 'Hicaz Bölge Haritası', en: 'Hejaz Regional Map', ar: 'خريطة منطقة الحجاز' },
  },
};

/** Check if a battle has SVG visualizations */
export function hasBattleSvg(battleId: string): boolean {
  return battleId in BATTLE_SVG_MAP;
}

/** Get SVG entry for a battle */
export function getBattleSvg(battleId: string): BattleSvgEntry | null {
  return BATTLE_SVG_MAP[battleId] ?? null;
}

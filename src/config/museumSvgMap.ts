/* ─── MUSEUM → SVG MAPPING — Siyer Atlas v4.0 FAZ 3 ─── */

const BASE = import.meta.env.BASE_URL || '/';
const SVG_DIR = `${BASE}assets/museum/svg`;

/* ─── TYPES ─── */
export interface MuseumSvgEntry {
  /** SVG file path */
  src: string;
  /** Trilingual caption */
  caption: { tr: string; en: string; ar: string };
}

/* ─── CATEGORY → REPRESENTATIVE SVG (for category cards) ─── */
export const CATEGORY_SVG_MAP: Record<string, MuseumSvgEntry> = {
  weapons: {
    src: `${SVG_DIR}/sword_zulfiqar.svg`,
    caption: { tr: 'Zülfekār Kılıcı', en: 'Dhul-Fiqar Sword', ar: 'سيف ذو الفقار' },
  },
  architecture: {
    src: `${SVG_DIR}/masjid_nabawi_original.svg`,
    caption: { tr: 'Mescid-i Nebevî (Orijinal Plan)', en: 'Masjid al-Nabawi (Original Plan)', ar: 'المسجد النبوي (المخطط الأصلي)' },
  },
  daily_life: {
    src: `${SVG_DIR}/daily_life_items.svg`,
    caption: { tr: 'Günlük Yaşam Objeleri', en: 'Daily Life Items', ar: 'أدوات الحياة اليومية' },
  },
  geography: {
    src: `${SVG_DIR}/hejaz_regional_map.svg`,
    caption: { tr: 'Hicaz Bölge Haritası', en: 'Hejaz Regional Map', ar: 'خريطة منطقة الحجاز' },
  },
  medical: {
    src: `${SVG_DIR}/medical_herbs_tools.svg`,
    caption: { tr: 'Tıbbi Bitkiler ve Aletler', en: 'Medical Herbs & Tools', ar: 'الأعشاب والأدوات الطبية' },
  },
  manuscripts: {
    src: `${SVG_DIR}/writing_tools_quran.svg`,
    caption: { tr: 'Yazı Araçları', en: 'Writing Tools', ar: 'أدوات الكتابة' },
  },
  // flags: no representative SVG
};

/* ─── SUBCATEGORY → SVG (fallback when no item-level override) ─── */
export const SUBCATEGORY_SVG_MAP: Record<string, MuseumSvgEntry> = {
  /* Weapons */
  swords: {
    src: `${SVG_DIR}/sword_zulfiqar.svg`,
    caption: { tr: 'Kılıç Türleri', en: 'Sword Types', ar: 'أنواع السيوف' },
  },
  spears_lances: {
    src: `${SVG_DIR}/spear_lance_types.svg`,
    caption: { tr: 'Mızrak ve Harbe Türleri', en: 'Spear & Lance Types', ar: 'أنواع الرماح والحراب' },
  },
  bows_arrows: {
    src: `${SVG_DIR}/bow_quiver_composite.svg`,
    caption: { tr: 'Yay ve Ok Donanımı', en: 'Bow & Quiver Equipment', ar: 'القوس والجعبة' },
  },
  shields: {
    src: `${SVG_DIR}/shields_turs_daraqah.svg`,
    caption: { tr: 'Kalkan Türleri', en: 'Shield Types', ar: 'أنواع التروس' },
  },
  armor: {
    src: `${SVG_DIR}/armor_dir_zat_fudul.svg`,
    caption: { tr: 'Zırh ve Koruyucu Donanım', en: 'Armor & Protective Gear', ar: 'الدروع والمعدات الواقية' },
  },
  helmets: {
    src: `${SVG_DIR}/armor_dir_zat_fudul.svg`,
    caption: { tr: 'Miğfer ve Başlık', en: 'Helmets & Headgear', ar: 'البيض والخوذ' },
  },
  daggers: {
    src: `${SVG_DIR}/sword_zulfiqar.svg`,
    caption: { tr: 'Hançer ve Bıçak', en: 'Daggers & Knives', ar: 'الخناجر والسكاكين' },
  },
  siege_equipment: {
    src: `${SVG_DIR}/siege_weapons.svg`,
    caption: { tr: 'Kuşatma Silahları', en: 'Siege Weapons', ar: 'آلات الحصار' },
  },

  /* Architecture */
  sacred_structures: {
    src: `${SVG_DIR}/kaaba_7c_plan.svg`,
    caption: { tr: 'Kâbe (7. Yüzyıl Planı)', en: 'Kaaba (7th Century Plan)', ar: 'الكعبة (مخطط القرن السابع)' },
  },
  mosques: {
    src: `${SVG_DIR}/masjid_nabawi_original.svg`,
    caption: { tr: 'Mescid-i Nebevî', en: 'Masjid al-Nabawi', ar: 'المسجد النبوي' },
  },
  houses: {
    src: `${SVG_DIR}/7c_arab_house_plan.svg`,
    caption: { tr: '7. Yüzyıl Arap Evi', en: '7th Century Arab House', ar: 'المنزل العربي في القرن السابع' },
  },
  markets_buildings: {
    src: `${SVG_DIR}/medina_market_plan.svg`,
    caption: { tr: 'Medine Çarşı Planı', en: 'Medina Market Plan', ar: 'مخطط سوق المدينة' },
  },
  camps_tents: {
    src: `${SVG_DIR}/7c_arab_house_plan.svg`,
    caption: { tr: 'Çadır ve Kamp Yapıları', en: 'Camps & Tent Structures', ar: 'الخيام والمعسكرات' },
  },
  fortifications: {
    src: `${SVG_DIR}/medine_city_plan.svg`,
    caption: { tr: 'Medine Şehir Planı', en: 'Medina City Plan', ar: 'مخطط مدينة المدينة' },
  },

  /* Daily Life */
  cooking_utensils: {
    src: `${SVG_DIR}/food_drink_vessels.svg`,
    caption: { tr: 'Yemek ve İçecek Kapları', en: 'Food & Drink Vessels', ar: 'أواني الطعام والشراب' },
  },
  pottery_vessels: {
    src: `${SVG_DIR}/food_drink_vessels.svg`,
    caption: { tr: 'Çömlek ve Kaplar', en: 'Pottery & Vessels', ar: 'الفخار والأواني' },
  },
  food_agriculture: {
    src: `${SVG_DIR}/food_drink_vessels.svg`,
    caption: { tr: 'Gıda ve Tarım', en: 'Food & Agriculture', ar: 'الغذاء والزراعة' },
  },
  textiles_clothing: {
    src: `${SVG_DIR}/clothing_prophetic_era.svg`,
    caption: { tr: 'Giyim ve Kumaşlar', en: 'Clothing & Textiles', ar: 'الملابس والأقمشة' },
  },
  coins_currency: {
    src: `${SVG_DIR}/coins_prophetic_era.svg`,
    caption: { tr: 'Sikke ve Para', en: 'Coins & Currency', ar: 'العملات والنقود' },
  },
  weights_measures: {
    src: `${SVG_DIR}/measurement_units.svg`,
    caption: { tr: 'Ölçü Birimleri', en: 'Measurement Units', ar: 'وحدات القياس' },
  },
  writing_tools: {
    src: `${SVG_DIR}/writing_tools_quran.svg`,
    caption: { tr: 'Yazı Araçları', en: 'Writing Tools', ar: 'أدوات الكتابة' },
  },
  trade_goods: {
    src: `${SVG_DIR}/daily_life_items.svg`,
    caption: { tr: 'Ticaret Malları', en: 'Trade Goods', ar: 'السلع التجارية' },
  },
  household_misc: {
    src: `${SVG_DIR}/daily_life_items.svg`,
    caption: { tr: 'Ev Eşyaları', en: 'Household Items', ar: 'الأدوات المنزلية' },
  },

  /* Geography */
  sacred_sites: {
    src: `${SVG_DIR}/kaaba_7c_plan.svg`,
    caption: { tr: 'Kutsal Mekânlar', en: 'Sacred Sites', ar: 'الأماكن المقدسة' },
  },
  caves_mountains: {
    src: `${SVG_DIR}/hira_cave_section.svg`,
    caption: { tr: 'Hira Mağarası Kesiti', en: 'Cave of Hira Cross-Section', ar: 'مقطع غار حراء' },
  },
  routes_roads: {
    src: `${SVG_DIR}/hijra_route_map.svg`,
    caption: { tr: 'Hicret Güzergâhı', en: 'Hijra Route', ar: 'مسار الهجرة' },
  },
  valleys_plains: {
    src: `${SVG_DIR}/hejaz_regional_map.svg`,
    caption: { tr: 'Hicaz Bölgesi', en: 'Hejaz Region', ar: 'منطقة الحجاز' },
  },
  battlefields: {
    src: `${SVG_DIR}/hejaz_regional_map.svg`,
    caption: { tr: 'Savaş Alanları', en: 'Battlefields', ar: 'ساحات المعارك' },
  },
  wells_springs: {
    src: `${SVG_DIR}/hejaz_regional_map.svg`,
    caption: { tr: 'Kuyular ve Pınarlar', en: 'Wells & Springs', ar: 'الآبار والعيون' },
  },
  deserts_landmarks: {
    src: `${SVG_DIR}/hejaz_regional_map.svg`,
    caption: { tr: 'Çöl ve İşaret Noktaları', en: 'Deserts & Landmarks', ar: 'الصحاري والمعالم' },
  },
  ports_coasts: {
    src: `${SVG_DIR}/hejaz_regional_map.svg`,
    caption: { tr: 'Limanlar ve Kıyılar', en: 'Ports & Coasts', ar: 'الموانئ والسواحل' },
  },

  /* Medical */
  herbal: {
    src: `${SVG_DIR}/medical_herbs_tools.svg`,
    caption: { tr: 'Bitkisel Tedavi', en: 'Herbal Medicine', ar: 'الطب بالأعشاب' },
  },
  nebevi_tedavi: {
    src: `${SVG_DIR}/medical_herbs_tools.svg`,
    caption: { tr: 'Nebevî Tedavi', en: 'Prophetic Healing', ar: 'الطب النبوي' },
  },
  therapeutic: {
    src: `${SVG_DIR}/medical_herbs_tools.svg`,
    caption: { tr: 'Terapötik Yöntemler', en: 'Therapeutic Methods', ar: 'الأساليب العلاجية' },
  },
  nebevi_gida: {
    src: `${SVG_DIR}/medical_herbs_tools.svg`,
    caption: { tr: 'Nebevî Gıdalar', en: 'Prophetic Foods', ar: 'الأغذية النبوية' },
  },
  hygiene: {
    src: `${SVG_DIR}/medical_herbs_tools.svg`,
    caption: { tr: 'Temizlik ve Hijyen', en: 'Hygiene & Cleanliness', ar: 'النظافة والطهارة' },
  },
  surgical: {
    src: `${SVG_DIR}/medical_herbs_tools.svg`,
    caption: { tr: 'Cerrahi Aletler', en: 'Surgical Instruments', ar: 'الأدوات الجراحية' },
  },
  alet: {
    src: `${SVG_DIR}/medical_herbs_tools.svg`,
    caption: { tr: 'Tıbbi Aletler', en: 'Medical Instruments', ar: 'الأدوات الطبية' },
  },

  /* Manuscripts — shared SVG */
  mushaf: {
    src: `${SVG_DIR}/writing_tools_quran.svg`,
    caption: { tr: 'Mushaf ve Yazı Araçları', en: 'Quran Manuscripts & Writing Tools', ar: 'المصاحف وأدوات الكتابة' },
  },
  sahife: {
    src: `${SVG_DIR}/writing_tools_quran.svg`,
    caption: { tr: 'Sahîfe ve Yazı Araçları', en: 'Scrolls & Writing Tools', ar: 'الصحف وأدوات الكتابة' },
  },
  hadith_collection: {
    src: `${SVG_DIR}/writing_tools_quran.svg`,
    caption: { tr: 'Hadis Derlemeleri', en: 'Hadith Collections', ar: 'مجموعات الحديث' },
  },
  mektup: {
    src: `${SVG_DIR}/writing_tools_quran.svg`,
    caption: { tr: 'Mektuplar', en: 'Letters', ar: 'الرسائل' },
  },
  treaty: {
    src: `${SVG_DIR}/writing_tools_quran.svg`,
    caption: { tr: 'Antlaşma Vesikaları', en: 'Treaty Documents', ar: 'وثائق المعاهدات' },
  },
  vesika: {
    src: `${SVG_DIR}/writing_tools_quran.svg`,
    caption: { tr: 'Resmî Vesikalar', en: 'Official Documents', ar: 'الوثائق الرسمية' },
  },
};

/* ─── ITEM-LEVEL OVERRIDES (specific items → specific SVG) ─── */
export const ITEM_SVG_MAP: Record<string, MuseumSvgEntry> = {
  /* Specific weapon items */
  sword_zulfiqar: {
    src: `${SVG_DIR}/sword_zulfiqar.svg`,
    caption: { tr: 'Zülfekār — Hz. Ali\'nin Kılıcı', en: 'Dhul-Fiqar — Sword of Ali', ar: 'ذو الفقار — سيف علي' },
  },
  cavalry_horse_equipment: {
    src: `${SVG_DIR}/cavalry_horse_equipment.svg`,
    caption: { tr: 'Süvari At Teçhizatı', en: 'Cavalry Horse Equipment', ar: 'معدات خيل الفرسان' },
  },

  /* Architecture specifics */
  kaaba: {
    src: `${SVG_DIR}/kaaba_7c_plan.svg`,
    caption: { tr: 'Kâbe — 7. Yüzyıl Planı', en: 'Kaaba — 7th Century Plan', ar: 'الكعبة — مخطط القرن السابع' },
  },
  masjid_nabawi: {
    src: `${SVG_DIR}/masjid_nabawi_original.svg`,
    caption: { tr: 'Mescid-i Nebevî — Orijinal Plan', en: 'Masjid al-Nabawi — Original Plan', ar: 'المسجد النبوي — المخطط الأصلي' },
  },
  kuba_mosque: {
    src: `${SVG_DIR}/kuba_mosque_sevr_cave.svg`,
    caption: { tr: 'Kuba Mescidi ve Sevr Mağarası', en: 'Quba Mosque & Cave of Thawr', ar: 'مسجد قباء وغار ثور' },
  },
  medina_market: {
    src: `${SVG_DIR}/medina_market_plan.svg`,
    caption: { tr: 'Medine Çarşı Planı', en: 'Medina Market Plan', ar: 'مخطط سوق المدينة' },
  },

  /* Geography specifics */
  hira_cave: {
    src: `${SVG_DIR}/hira_cave_section.svg`,
    caption: { tr: 'Hira Mağarası — Kesit', en: 'Cave of Hira — Cross-Section', ar: 'غار حراء — مقطع عرضي' },
  },
  sevr_cave: {
    src: `${SVG_DIR}/kuba_mosque_sevr_cave.svg`,
    caption: { tr: 'Sevr Mağarası', en: 'Cave of Thawr', ar: 'غار ثور' },
  },
  hijra_route: {
    src: `${SVG_DIR}/hijra_route_map.svg`,
    caption: { tr: 'Hicret Güzergâhı', en: 'Hijra Route', ar: 'مسار الهجرة' },
  },
  isra_mirac: {
    src: `${SVG_DIR}/isra_mirac_route.svg`,
    caption: { tr: 'İsrâ ve Mi\'râc Güzergâhı', en: 'Isra & Mi\'raj Route', ar: 'مسار الإسراء والمعراج' },
  },
};

/* ─── LOOKUP FUNCTIONS ─── */

/**
 * Get SVG entry for a museum item.
 * Priority: item-level override → subcategory fallback → null
 */
export function getMuseumSvg(itemId: string, subcategory: string): MuseumSvgEntry | null {
  return ITEM_SVG_MAP[itemId] ?? SUBCATEGORY_SVG_MAP[subcategory] ?? null;
}

/**
 * Get representative SVG for a category (for card previews).
 */
export function getCategorySvg(categoryKey: string): MuseumSvgEntry | null {
  return CATEGORY_SVG_MAP[categoryKey] ?? null;
}

/**
 * Check if a museum item has an SVG mapping.
 */
export function hasMuseumSvg(itemId: string, subcategory: string): boolean {
  return !!(ITEM_SVG_MAP[itemId] || SUBCATEGORY_SVG_MAP[subcategory]);
}

/**
 * Count SVGs available for a category (based on subcategories).
 */
export function countCategorySvgs(subcategories: string[]): number {
  const uniqueSrcs = new Set<string>();
  for (const sc of subcategories) {
    const entry = SUBCATEGORY_SVG_MAP[sc];
    if (entry) uniqueSrcs.add(entry.src);
  }
  return uniqueSrcs.size;
}

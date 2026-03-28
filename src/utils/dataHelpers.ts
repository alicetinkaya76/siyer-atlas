/* ─── DATA HELPERS — Siyer Atlas v3.2 ─── */

/**
 * Classify a free-text Turkish battle result into a category.
 */
export type ResultCategory = 'victory' | 'defeat' | 'treaty' | 'conquest' | 'inconclusive';

const VICTORY_KEYWORDS = ['zafer', 'başarı', 'baskın başarılı', 'düşman dağıldı', 'düşman kaçtı', 'düşman çekildi', 'ganimet', 'ele geçirildi', 'psikolojik zafer', 'savunma zaferi', 'hâkimiy', 'krallığı yıkıldı', 'başkenti düştü', 'esir alındı', 'islam zaferi'];
const DEFEAT_KEYWORDS = ['yenilgi', 'bozgun', 'ağır kayıp', 'başarısız', 'ihanet', 'şehadet', 'geri çekilme'];
const TREATY_KEYWORDS = ['sulh', 'antlaşma', 'barış', 'teslim', 'biat', 'mübâhale', 'arabuluculuk', 'çatışma olmadı', 'savaş olmadı'];
const CONQUEST_KEYWORDS = ['fethedildi', 'fetih', 'feth', 'tamamıyla feth'];

export function resultCategory(result: string | undefined): ResultCategory {
  if (!result) return 'inconclusive';
  const r = result.toLowerCase().replace(/['ʾ]/g, '');

  // Order matters: conquest before victory (fetih is specific)
  if (CONQUEST_KEYWORDS.some(k => r.includes(k))) return 'conquest';
  if (DEFEAT_KEYWORDS.some(k => r.includes(k))) return 'defeat';
  if (TREATY_KEYWORDS.some(k => r.includes(k))) return 'treaty';
  if (VICTORY_KEYWORDS.some(k => r.includes(k))) return 'victory';

  // Specific patterns
  if (r === 'put_yikimi') return 'victory';
  if (r.includes('ok ') || r.includes('kısa çatışma')) return 'inconclusive';

  return 'inconclusive';
}

export const RESULT_LABELS: Record<ResultCategory, { tr: string; en: string; color: string; icon: string }> = {
  victory:      { tr: 'Zafer', en: 'Victory', color: '#2d6a4f', icon: '🏆' },
  defeat:       { tr: 'Yenilgi', en: 'Defeat', color: '#c0392b', icon: '📉' },
  treaty:       { tr: 'Sulh / Anlaşma', en: 'Treaty', color: '#2e5984', icon: '🤝' },
  conquest:     { tr: 'Fetih', en: 'Conquest', color: '#d4af37', icon: '🏴' },
  inconclusive: { tr: 'Belirsiz', en: 'Inconclusive', color: '#888', icon: '➖' },
};

/**
 * Companion category group classification.
 */
export type CompanionGroup = 'asere' | 'badri' | 'muhacir' | 'ansar' | 'ehl_beyt' | 'women' | 'other';

export function companionGroup(category: string | string[] | undefined): CompanionGroup[] {
  const cats = Array.isArray(category) ? category : category ? [category] : [];
  const groups = new Set<CompanionGroup>();

  for (const c of cats) {
    const cl = c.toLowerCase().replace(/[\s,]+/g, '_').trim();
    if (cl.includes('asere')) groups.add('asere');
    if (cl.includes('bedir') || cl.includes('badri')) groups.add('badri');
    if (cl.includes('muhacir') || cl.includes('muhajirun') || cl.includes('habesistan')) groups.add('muhacir');
    if (cl.includes('ansar') || cl.includes('ensari') || cl.includes('ensar') || cl.includes('ensâr') || cl.includes('akabe')) groups.add('ansar');
    if (cl.includes('ehl_beyt')) groups.add('ehl_beyt');
    if (cl.includes('women') || cl.includes('peygamber_eş')) groups.add('women');
  }

  if (groups.size === 0) groups.add('other');
  return Array.from(groups);
}

export const COMPANION_GROUP_LABELS: Record<CompanionGroup, { tr: string; en: string; color: string; icon: string }> = {
  asere:    { tr: 'Aşere-i Mübeşşere', en: 'Ten Promised Paradise', color: '#d4af37', icon: '⭐' },
  badri:    { tr: 'Bedir Ehli', en: 'Badr Veterans', color: '#2d6a4f', icon: '🏅' },
  muhacir:  { tr: 'Muhâcir', en: 'Emigrants', color: '#8b4513', icon: '🕌' },
  ansar:    { tr: 'Ensâr', en: 'Helpers', color: '#2e5984', icon: '🤲' },
  ehl_beyt: { tr: 'Ehl-i Beyt', en: 'Ahl al-Bayt', color: '#6b3a2a', icon: '🏠' },
  women:    { tr: 'Hanım Sahâbîler', en: 'Women Companions', color: '#8e44ad', icon: '👩' },
  other:    { tr: 'Diğer', en: 'Other', color: '#666', icon: '👤' },
};

export const BATTLE_TYPE_LABELS: Record<string, { tr: string; en: string; icon: string; color: string }> = {
  gazve:       { tr: 'Gazve', en: 'Ghazwa', icon: '⚔️', color: '#c0392b' },
  seriyye:     { tr: 'Seriyye', en: 'Sariyyah', icon: '🏹', color: '#e67e22' },
  fetih:       { tr: 'Fetih', en: 'Conquest', icon: '🏴', color: '#d4af37' },
  ridde:       { tr: 'Ridde Savaşı', en: 'Ridda War', icon: '🔥', color: '#8b4513' },
  fitne:       { tr: 'Fitne', en: 'Fitna', icon: '⚡', color: '#7f8c8d' },
  olay:        { tr: 'Olay', en: 'Event', icon: '📌', color: '#2e5984' },
  deniz_savasi:{ tr: 'Deniz Savaşı', en: 'Naval Battle', icon: '⛵', color: '#1a6b4a' },
};

import type { LocalizedText } from '@/types';
import { useLocalizedField } from '@/hooks/useLocalizedField';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

/* ─── BATTLE POPUP (from v2.12 timeline.json entry) ─── */

interface BattlePopupProps {
  battle_id: string;
  name: string;
  year_ce: number;
  date_hijri: string;
  type: string;
  result: string;
  tier: number;
}

const TYPE_LABELS: Record<string, string> = {
  gazve: 'Gazve',
  seriyye: 'Seriyye',
  fetih: 'Fetih',
  ridde: 'Ridde',
  fitne: 'Fitne',
  deniz_savasi: 'Deniz Savaşı',
  olay: 'Olay',
};

const TIER_COLORS: Record<number, string> = {
  1: '#d4af37',
  2: '#6b7280',
  3: '#9ca3af',
};

export function BattlePopup({ battle_id, name, year_ce, date_hijri, type, result, tier }: BattlePopupProps) {
  const navigate = useNavigate();
  const tierColor = TIER_COLORS[tier] ?? '#6b7280';

  return (
    <div style={{ minWidth: 200, maxWidth: 280 }}>
      {/* Header */}
      <div className="flex items-start gap-2 mb-2">
        <span style={{ fontSize: 18 }}>⚔️</span>
        <div className="flex-1 min-w-0">
          <h4
            className="text-sm font-bold leading-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
          >
            {name}
          </h4>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
            {date_hijri} · {year_ce} CE
          </p>
        </div>
      </div>

      {/* Type & Tier badges */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span
          className="px-2 py-0.5 rounded-full text-xs font-semibold"
          style={{
            background: 'rgba(212, 175, 55, 0.12)',
            color: 'var(--text-accent)',
            border: '1px solid rgba(212, 175, 55, 0.25)',
          }}
        >
          {TYPE_LABELS[type] ?? type}
        </span>
        {tier <= 2 && (
          <span className="text-xs font-semibold" style={{ color: tierColor }}>
            {'★'.repeat(4 - tier)}
          </span>
        )}
      </div>

      {/* Result */}
      {result && (
        <p className="text-xs leading-relaxed mb-2" style={{ color: 'var(--text-secondary)' }}>
          {result}
        </p>
      )}

      {/* Link */}
      <button
        type="button"
        onClick={() => navigate(`/battles/${battle_id}`)}
        className="text-xs font-semibold transition-colors"
        style={{ color: 'var(--text-accent)' }}
      >
        Detaylar →
      </button>
    </div>
  );
}

/* ─── LOCATION POPUP (from v2.12 locations.json) ─── */

interface LocationPopupProps {
  name: LocalizedText;
  type: string;
  description: string;
}

const LOC_ICONS: Record<string, string> = {
  city: '🏙️',
  mosque: '🕌',
  battlefield: '⚔️',
  well: '💧',
  mountain: '⛰️',
  cave: '🕳️',
  landmark: '📍',
  cemetery: '🪦',
  market: '🏪',
  oasis: '🌴',
};

export function LocationPopup({ name, type, description }: LocationPopupProps) {
  const { localize } = useLocalizedField();
  const icon = LOC_ICONS[type] ?? '📍';

  return (
    <div style={{ minWidth: 180, maxWidth: 260 }}>
      <div className="flex items-start gap-2 mb-2">
        <span style={{ fontSize: 18 }}>{icon}</span>
        <div className="flex-1 min-w-0">
          <h4
            className="text-sm font-bold leading-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
          >
            {localize(name)}
          </h4>
          <p className="text-xs mt-0.5 capitalize" style={{ color: 'var(--text-tertiary)' }}>
            {type.replace('_', ' ')}
          </p>
        </div>
      </div>

      {description && (
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {description.length > 150 ? `${description.slice(0, 150)}…` : description}
        </p>
      )}
    </div>
  );
}

/* ─── COMPANION POPUP (from companions.json joined with locations) ─── */

interface CompanionPopupProps {
  id: string;
  name: LocalizedText;
  birthCe?: number;
  deathCe?: number;
  locName?: LocalizedText;
  locType: 'birth' | 'death';
  category?: string;
}

export function CompanionPopup({ id, name, birthCe, deathCe, locName, locType, category }: CompanionPopupProps) {
  const { localize } = useLocalizedField();
  const navigate = useNavigate();

  const catLabel = category ? category.replace(/_/g, ' ') : '';

  return (
    <div style={{ minWidth: 180, maxWidth: 260 }}>
      <div className="flex items-start gap-2 mb-2">
        <span style={{ fontSize: 18 }}>👤</span>
        <div className="flex-1 min-w-0">
          <h4
            className="text-sm font-bold leading-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
          >
            {localize(name)}
          </h4>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
            {birthCe && deathCe ? `${birthCe} – ${deathCe} CE` : birthCe ? `d. ${birthCe} CE` : deathCe ? `ö. ${deathCe} CE` : ''}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-2">
        <span
          className="px-2 py-0.5 rounded-full text-xs font-semibold"
          style={{
            background: locType === 'birth' ? 'rgba(21, 128, 61, 0.12)' : 'rgba(185, 28, 28, 0.12)',
            color: locType === 'birth' ? '#15803d' : '#b91c1c',
            border: `1px solid ${locType === 'birth' ? 'rgba(21,128,61,0.25)' : 'rgba(185,28,28,0.25)'}`,
          }}
        >
          {locType === 'birth' ? '🌱 Doğum' : '🕊️ Vefat'}
        </span>
        {catLabel && (
          <span
            className="px-2 py-0.5 rounded-full text-xs"
            style={{ background: 'rgba(124,58,237,0.1)', color: '#7c3aed', border: '1px solid rgba(124,58,237,0.2)' }}
          >
            {catLabel}
          </span>
        )}
      </div>

      {locName && (
        <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
          📍 {localize(locName)}
        </p>
      )}

      <button
        type="button"
        onClick={() => navigate(`/companions/${id}`)}
        className="text-xs font-semibold transition-colors"
        style={{ color: 'var(--text-accent)' }}
      >
        Detaylar →
      </button>
    </div>
  );
}

/* ─── MUSEUM POPUP (from museum_architecture / museum_geography with coords) ─── */

interface MuseumPopupProps {
  id: string;
  name: LocalizedText;
  category: string;
  subcategory?: string;
  period?: string;
  description?: LocalizedText;
  categoryIcon: string;
  categoryColor: string;
}

const CAT_LABELS: Record<string, { tr: string; en: string; ar: string }> = {
  architecture: { tr: 'Mimari', en: 'Architecture', ar: 'العمارة' },
  geography: { tr: 'Coğrafya', en: 'Geography', ar: 'الجغرافيا' },
  weapons: { tr: 'Silahlar', en: 'Weapons', ar: 'الأسلحة' },
  daily_life: { tr: 'Günlük Hayat', en: 'Daily Life', ar: 'الحياة اليومية' },
  medical: { tr: 'Tıbb-ı Nebevî', en: 'Prophetic Medicine', ar: 'الطب النبوي' },
  manuscripts: { tr: 'Yazma', en: 'Manuscripts', ar: 'المخطوطات' },
  flags: { tr: 'Sancak', en: 'Banners', ar: 'الرايات' },
};

export function MuseumPopup({ id, name, category, subcategory, period, description, categoryIcon, categoryColor }: MuseumPopupProps) {
  const { localize } = useLocalizedField();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const lang = i18n.language as 'tr' | 'en' | 'ar';

  const catLabel = CAT_LABELS[category]?.[lang] ?? category;

  return (
    <div style={{ minWidth: 200, maxWidth: 280 }}>
      <div className="flex items-start gap-2 mb-2">
        <span style={{ fontSize: 18 }}>{categoryIcon}</span>
        <div className="flex-1 min-w-0">
          <h4
            className="text-sm font-bold leading-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
          >
            {localize(name)}
          </h4>
          {period && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
              {period}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-2">
        <span
          className="px-2 py-0.5 rounded-full text-xs font-semibold"
          style={{
            background: `${categoryColor}18`,
            color: categoryColor,
            border: `1px solid ${categoryColor}40`,
          }}
        >
          {catLabel}
        </span>
        {subcategory && (
          <span
            className="px-2 py-0.5 rounded-full text-xs"
            style={{ background: 'rgba(107,107,107,0.1)', color: 'var(--text-tertiary)', border: '1px solid rgba(107,107,107,0.2)' }}
          >
            {subcategory.replace(/_/g, ' ')}
          </span>
        )}
      </div>

      {description && (
        <p className="text-xs leading-relaxed mb-2" style={{ color: 'var(--text-secondary)' }}>
          {(() => { const txt = localize(description); return txt.length > 120 ? `${txt.slice(0, 120)}…` : txt; })()}
        </p>
      )}

      <button
        type="button"
        onClick={() => navigate(`/museum/${category}/${id}`)}
        className="text-xs font-semibold transition-colors"
        style={{ color: 'var(--text-accent)' }}
      >
        {lang === 'tr' ? 'Detaylar →' : lang === 'ar' ? 'التفاصيل ←' : 'Details →'}
      </button>
    </div>
  );
}

/* ─── TRIBE POPUP (from v2.12 tribes.json) ─── */

interface TribePopupProps {
  name: LocalizedText;
  description: string;
  region: string;
  clanCount: number;
}

export function TribePopup({ name, description, region, clanCount }: TribePopupProps) {
  const { localize } = useLocalizedField();

  return (
    <div style={{ minWidth: 180, maxWidth: 260 }}>
      <div className="flex items-start gap-2 mb-2">
        <span style={{ fontSize: 18 }}>🏕️</span>
        <div className="flex-1 min-w-0">
          <h4
            className="text-sm font-bold leading-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
          >
            {localize(name)}
          </h4>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
            {region} · {clanCount} kol
          </p>
        </div>
      </div>

      {description && (
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {description.length > 150 ? `${description.slice(0, 150)}…` : description}
        </p>
      )}
    </div>
  );
}

/* ─── GEOGRAPHY POPUP (from geography.json — mountains, valleys, rivers, etc.) ─── */

const GEO_CATEGORY_ICONS: Record<string, string> = {
  mountains: '⛰️',
  valleys: '🏜️',
  rivers_water: '💧',
  deserts_plains: '🏝️',
  mountain_passes: '🛤️',
  ports_coasts: '⚓',
  islands: '🏝️',
};

const GEO_CATEGORY_COLORS: Record<string, string> = {
  mountains: '#7c3aed',
  valleys: '#a16207',
  rivers_water: '#0891b2',
  deserts_plains: '#d97706',
  mountain_passes: '#6b7280',
  ports_coasts: '#1d4ed8',
  islands: '#15803d',
};

interface GeographyPopupProps {
  name: LocalizedText;
  category: string;
  description: string;
  elevation_m?: number;
  quran_refs?: string[];
}

export function GeographyPopup({ name, category, description, elevation_m, quran_refs }: GeographyPopupProps) {
  const { localize } = useLocalizedField();
  const icon = GEO_CATEGORY_ICONS[category] ?? '🌍';
  const color = GEO_CATEGORY_COLORS[category] ?? '#6b7280';

  return (
    <div style={{ minWidth: 200, maxWidth: 280 }}>
      <div className="flex items-start gap-2 mb-2">
        <span style={{ fontSize: 18 }}>{icon}</span>
        <div className="flex-1 min-w-0">
          <h4
            className="text-sm font-bold leading-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
          >
            {localize(name)}
          </h4>
          {elevation_m && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
              ▲ {elevation_m}m
            </p>
          )}
        </div>
      </div>

      <span
        className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold mb-2"
        style={{
          background: `${color}18`,
          color: color,
          border: `1px solid ${color}40`,
        }}
      >
        {category.replace(/_/g, ' ')}
      </span>

      {description && (
        <p className="text-xs leading-relaxed mb-2" style={{ color: 'var(--text-secondary)' }}>
          {description.length > 150 ? `${description.slice(0, 150)}…` : description}
        </p>
      )}

      {quran_refs && quran_refs.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {quran_refs.slice(0, 2).map((ref, i) => (
            <span
              key={i}
              className="px-1.5 py-0.5 rounded text-[10px] font-medium"
              style={{ background: 'rgba(21,128,61,0.1)', color: '#15803d', border: '1px solid rgba(21,128,61,0.2)' }}
            >
              📖 {ref}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

import { useTranslation } from 'react-i18next';

const RESULT_LEGEND = [
  { key: 'victory', color: '#15803d', label: { tr: 'Zafer', en: 'Victory', ar: 'نصر' } },
  { key: 'defeat', color: '#b91c1c', label: { tr: 'Mağlubiyet', en: 'Defeat', ar: 'هزيمة' } },
  { key: 'treaty', color: '#1d4ed8', label: { tr: 'Antlaşma', en: 'Treaty', ar: 'معاهدة' } },
  { key: 'inconclusive', color: '#a16207', label: { tr: 'Kararsız', en: 'Inconclusive', ar: 'غير حاسم' } },
  { key: 'withdrawal', color: '#6b7280', label: { tr: 'Çekilme', en: 'Withdrawal', ar: 'انسحاب' } },
];

const LOCATION_LEGEND = [
  { icon: '🕌', label: { tr: 'Mescid', en: 'Mosque', ar: 'مسجد' } },
  { icon: '🏙️', label: { tr: 'Şehir', en: 'City', ar: 'مدينة' } },
  { icon: '⛰️', label: { tr: 'Nirengi', en: 'Landmark', ar: 'معلم' } },
  { icon: '💧', label: { tr: 'Kuyu', en: 'Well', ar: 'بئر' } },
];

const MUSEUM_LEGEND = [
  { icon: '🕌', color: '#1a6b4a', label: { tr: 'Mimari', en: 'Architecture', ar: 'العمارة' } },
  { icon: '🗺️', color: '#2e5984', label: { tr: 'Coğrafya', en: 'Geography', ar: 'الجغرافيا' } },
];

const GEOGRAPHY_LEGEND = [
  { icon: '⛰️', color: '#7c3aed', label: { tr: 'Dağ / Geçit / Vadi', en: 'Mountain / Pass / Valley', ar: 'جبل / ممر / واد' } },
  { icon: '💧', color: '#0891b2', label: { tr: 'Su / Liman', en: 'Water / Port', ar: 'مياه / ميناء' } },
];

export function MapLegend() {
  const { i18n } = useTranslation();
  const lang = i18n.language as 'tr' | 'en' | 'ar';

  return (
    <div
      className="map-legend-wrapper absolute bottom-4 left-3 z-[1000] rounded-xl p-3"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(var(--glass-blur))',
        WebkitBackdropFilter: 'blur(var(--glass-blur))',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--shadow-md)',
        minWidth: 160,
      }}
    >
      {/* Battle results */}
      <p
        className="text-xs font-semibold mb-2"
        style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}
      >
        {lang === 'tr' ? 'Savaş Sonuçları' : lang === 'ar' ? 'نتائج المعارك' : 'Battle Results'}
      </p>
      <div className="flex flex-col gap-1.5 mb-3">
        {RESULT_LEGEND.map((r) => (
          <div key={r.key} className="flex items-center gap-2">
            <span
              className="rounded-full flex-shrink-0"
              style={{ width: 8, height: 8, background: r.color }}
            />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {r.label[lang]}
            </span>
          </div>
        ))}
      </div>

      {/* Location types */}
      <p
        className="text-xs font-semibold mb-2"
        style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}
      >
        {lang === 'tr' ? 'Mekân Tipleri' : lang === 'ar' ? 'أنواع الأماكن' : 'Location Types'}
      </p>
      <div className="flex flex-col gap-1.5">
        {LOCATION_LEGEND.map((l) => (
          <div key={l.icon} className="flex items-center gap-2">
            <span style={{ fontSize: 12 }}>{l.icon}</span>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {l.label[lang]}
            </span>
          </div>
        ))}
      </div>

      {/* Museum types */}
      <p
        className="text-xs font-semibold mb-2 mt-3"
        style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}
      >
        {lang === 'tr' ? 'Müze Katmanı' : lang === 'ar' ? 'طبقة المتحف' : 'Museum Layer'}
      </p>
      <div className="flex flex-col gap-1.5">
        {MUSEUM_LEGEND.map((m) => (
          <div key={m.icon} className="flex items-center gap-2">
            <span
              className="rounded-full flex-shrink-0"
              style={{ width: 8, height: 8, background: m.color }}
            />
            <span style={{ fontSize: 12 }}>{m.icon}</span>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {m.label[lang]}
            </span>
          </div>
        ))}
      </div>

      {/* Geography types */}
      <p
        className="text-xs font-semibold mb-2 mt-3"
        style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}
      >
        {lang === 'tr' ? 'Coğrafya Katmanı' : lang === 'ar' ? 'طبقة الجغرافيا' : 'Geography Layer'}
      </p>
      <div className="flex flex-col gap-1.5">
        {GEOGRAPHY_LEGEND.map((g) => (
          <div key={g.icon} className="flex items-center gap-2">
            <span
              className="rounded-full flex-shrink-0"
              style={{ width: 8, height: 8, background: g.color }}
            />
            <span style={{ fontSize: 12 }}>{g.icon}</span>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {g.label[lang]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

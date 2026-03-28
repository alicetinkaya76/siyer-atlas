const CATEGORIES = [
  { key: 'milestone', icon: '★', color: '#d4af37', label: 'Dönüm Noktası' },
  { key: 'battle', icon: '⚔️', color: '#dc2626', label: 'Gazve / Savaş' },
  { key: 'seriyye', icon: '🏹', color: '#f97316', label: 'Seriyye' },
  { key: 'conquest', icon: '🏴', color: '#ea580c', label: 'Fetih' },
  { key: 'political', icon: '👑', color: '#1d4ed8', label: 'Siyasî' },
  { key: 'revelation', icon: '📖', color: '#7c3aed', label: 'Vahiy' },
  { key: 'migration', icon: '🕌', color: '#15803d', label: 'Hicret' },
];

const TIERS = [
  { tier: 1, stars: '★★★', label: 'Tier 1 — Büyük olay' },
  { tier: 2, stars: '★★', label: 'Tier 2 — Orta' },
  { tier: 3, stars: '★', label: 'Tier 3 — Küçük' },
];

export function EventTypeLegend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center">
      {CATEGORIES.map((c) => (
        <div key={c.key} className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.color }} />
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {c.icon} {c.label}
          </span>
        </div>
      ))}
      <span className="text-xs" style={{ color: 'var(--border-color)' }}>│</span>
      {TIERS.map((t) => (
        <span key={t.tier} className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          <span style={{ color: 'var(--text-accent)' }}>{t.stars}</span> {t.label}
        </span>
      ))}
    </div>
  );
}

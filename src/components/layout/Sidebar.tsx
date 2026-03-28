import { useLocation, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { NAV_ITEMS } from '@/config/routes';
import { useLocalizedField } from '@/hooks/useLocalizedField';
import { DATA_COUNTS, APP_VERSION } from '@/config/constants';
import { usePrefetch } from '@/hooks/useData';

const GROUPS: Record<string, { tr: string; en: string; ar: string }> = {
  explore: { tr: 'Keşfet', en: 'Explore', ar: 'استكشف' },
  people: { tr: 'Kişiler', en: 'People', ar: 'الأشخاص' },
  events: { tr: 'Olaylar', en: 'Events', ar: 'الأحداث' },
  museum: { tr: 'Müze', en: 'Museum', ar: 'المتحف' },
  quran: { tr: 'Kur\'ân', en: 'Quran', ar: 'القرآن' },
  network: { tr: 'Ağlar', en: 'Networks', ar: 'الشبكات' },
  media: { tr: 'Medya', en: 'Media', ar: 'وسائط' },
  tools: { tr: 'Araçlar', en: 'Tools', ar: 'أدوات' },
};

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { localize } = useLocalizedField();
  const { t } = useTranslation();
  const prefetch = usePrefetch();

  /* Route → data key mapping for hover prefetch */
  const ROUTE_DATA: Record<string, string[]> = {
    '/companions': ['companions'],
    '/battles': ['timeline'],
    '/museum': ['museum_master_index'],
    '/mesa-nebevi': ['mesa_nebevi'],
    '/economy': ['economy', 'trade_goods'],
    '/geography': ['geography'],
    '/literature': ['literature'],
    '/religions': ['pre_islamic_religions'],
    '/map': ['timeline', 'locations', 'tribes'],
    '/network': ['companions', 'teacher_student_edges'],
    '/audio': ['audio_episodes'],
    '/prophet': ['prophet_events', 'prophet_character'],
    '/quran/esbab': ['esbab_nuzul'],
    '/timeline': ['timeline'],
  };

  const handlePrefetch = (path: string) => {
    const keys = ROUTE_DATA[path];
    if (keys) keys.forEach((k) => prefetch(k));
  };

  const sidebarItems = NAV_ITEMS.filter((item) => item.showInSidebar);

  // Group items
  const grouped = new Map<string, typeof sidebarItems>();
  const ungrouped: typeof sidebarItems = [];

  for (const item of sidebarItems) {
    if (item.group) {
      const g = grouped.get(item.group) ?? [];
      g.push(item);
      grouped.set(item.group, g);
    } else {
      ungrouped.push(item);
    }
  }

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      className="flex h-full flex-col overflow-y-auto py-3"
      style={{ width: 'var(--sidebar-width)' }}
      aria-label="Main navigation"
    >
      {/* Ungrouped items (Home) */}
      <div className="px-3">
        {ungrouped.map((item) => (
          <SidebarItem
            key={item.path}
            icon={item.icon}
            label={localize(item.label)}
            active={isActive(item.path)}
            onClick={() => navigate(item.path)}
            onHover={() => handlePrefetch(item.path)}
          />
        ))}
      </div>

      {/* Grouped items */}
      {[...grouped.entries()].map(([group, items]) => (
        <div key={group} className="mt-4 px-3">
          <p
            className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-widest"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {localize(GROUPS[group])}
          </p>
          {items.map((item) => (
            <SidebarItem
              key={item.path}
              icon={item.icon}
              label={localize(item.label)}
              active={isActive(item.path)}
              onClick={() => navigate(item.path)}
              onHover={() => handlePrefetch(item.path)}
            />
          ))}
        </div>
      ))}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Stats bar */}
      <div
        className="mx-3 mt-4 rounded-lg border p-3"
        style={{ borderColor: 'var(--border-color)', background: 'var(--bg-tertiary)' }}
      >
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
          <span>{t('companions_count', { count: DATA_COUNTS.companions })}</span>
          <span>{t('battles_count', { count: DATA_COUNTS.battles })}</span>
          <span>{t('museum_items_count', { count: DATA_COUNTS.museumItems })}</span>
        </div>
        <p className="mt-2 text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
          v{APP_VERSION}
        </p>
      </div>
    </nav>
  );
}

function SidebarItem({
  icon,
  label,
  active,
  onClick,
  onHover,
}: {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
  onHover?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onHover}
      className="relative flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-start text-sm transition-all"
      style={{
        color: active ? 'var(--text-accent)' : 'var(--text-secondary)',
        background: active ? 'rgba(212, 175, 55, 0.08)' : 'transparent',
        fontWeight: active ? 600 : 400,
      }}
    >
      {active && (
        <motion.div
          layoutId="sidebar-indicator"
          className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full"
          style={{ background: 'linear-gradient(180deg, #d4af37, #e6bf55)' }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        />
      )}
      <span className="w-5 text-center text-base">{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  );
}

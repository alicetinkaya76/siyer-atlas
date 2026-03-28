import { lazy } from 'react';
import type { RouteObject } from 'react-router';

/* ─── LAZY IMPORT WITH RETRY (handles stale chunk hashes after deploy) ─── */
function lazyRetry<T extends { default: React.ComponentType<any> }>(
  importFn: () => Promise<T>,
  retries = 2,
): React.LazyExoticComponent<T['default']> {
  return lazy(() => {
    const attempt = (remaining: number): Promise<T> =>
      importFn().catch((err: unknown) => {
        if (remaining <= 0) {
          // Last resort: force reload to get fresh chunks
          const alreadyReloaded = sessionStorage.getItem('chunk-reload');
          if (!alreadyReloaded) {
            sessionStorage.setItem('chunk-reload', '1');
            window.location.reload();
          }
          throw err;
        }
        return new Promise<T>((resolve) =>
          setTimeout(() => resolve(attempt(remaining - 1)), 500),
        );
      });
    return attempt(retries);
  });
}

/* ─── Clear chunk-reload flag on successful load ─── */
sessionStorage.removeItem('chunk-reload');

/* ─── LAZY PAGE IMPORTS ─── */
const HomePage = lazyRetry(() => import('@/pages/HomePage'));
const MapPage = lazyRetry(() => import('@/pages/MapPage'));
const TimelinePage = lazyRetry(() => import('@/pages/TimelinePage'));
const CompanionsPage = lazyRetry(() => import('@/pages/CompanionsPage'));
const CompanionDetailPage = lazyRetry(() => import('@/pages/CompanionDetailPage'));
const BattlesPage = lazyRetry(() => import('@/pages/BattlesPage'));
const BattleDetailPage = lazyRetry(() => import('@/pages/BattleDetailPage'));
const QuranPage = lazyRetry(() => import('@/pages/QuranPage'));
const MuseumPage = lazyRetry(() => import('@/pages/MuseumPage'));
const MuseumItemPage = lazyRetry(() => import('@/pages/MuseumItemPage'));
const NetworkPage = lazyRetry(() => import('@/pages/NetworkPage'));
const ProphetPage = lazyRetry(() => import('@/pages/ProphetPage'));
const AudioPage = lazyRetry(() => import('@/pages/AudioPage'));
const StatsPage = lazyRetry(() => import('@/pages/StatsPage'));
const EconomyPage = lazyRetry(() => import('@/pages/EconomyPage'));
const LiteraturePage = lazyRetry(() => import('@/pages/LiteraturePage'));
const ReligionsPage = lazyRetry(() => import('@/pages/ReligionsPage'));
const GeographyPage = lazyRetry(() => import('@/pages/GeographyPage'));
const MesaNebeviPage = lazyRetry(() => import('@/pages/MesaNebeviPage'));
const AboutPage = lazyRetry(() => import('@/pages/AboutPage'));
const NotFoundPage = lazyRetry(() => import('@/pages/NotFoundPage'));

/* ─── NAV ITEMS (Sidebar + BottomTabBar) ─── */
export interface NavItem {
  path: string;
  icon: string;
  label: { tr: string; en: string; ar: string };
  showInSidebar: boolean;
  showInBottomBar: boolean;
  group?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { path: '/', icon: '🏠', label: { tr: 'Ana Sayfa', en: 'Home', ar: 'الرئيسية' }, showInSidebar: true, showInBottomBar: true },
  { path: '/map', icon: '🗺️', label: { tr: 'Harita', en: 'Map', ar: 'الخريطة' }, showInSidebar: true, showInBottomBar: true, group: 'explore' },
  { path: '/timeline', icon: '⏳', label: { tr: 'Zaman Çizelgesi', en: 'Timeline', ar: 'الخط الزمني' }, showInSidebar: true, showInBottomBar: false, group: 'explore' },
  { path: '/companions', icon: '👤', label: { tr: 'Sahâbîler', en: 'Companions', ar: 'الصحابة' }, showInSidebar: true, showInBottomBar: true, group: 'people' },
  { path: '/battles', icon: '⚔️', label: { tr: 'Savaşlar', en: 'Battles', ar: 'الغزوات' }, showInSidebar: true, showInBottomBar: false, group: 'events' },
  { path: '/museum', icon: '🏛️', label: { tr: 'Dijital Müze', en: 'Digital Museum', ar: 'المتحف الرقمي' }, showInSidebar: true, showInBottomBar: true, group: 'museum' },
  { path: '/mesa-nebevi', icon: '🍽️', label: { tr: 'Mesa-i Nebevî', en: 'Prophet\'s Table', ar: 'المائدة النبوية' }, showInSidebar: true, showInBottomBar: false, group: 'museum' },
  { path: '/quran/esbab', icon: '📖', label: { tr: 'Kur\'ân Bağlantıları', en: 'Quran Links', ar: 'روابط القرآن' }, showInSidebar: true, showInBottomBar: false, group: 'quran' },
  { path: '/network', icon: '🕸️', label: { tr: 'İlişki Ağları', en: 'Networks', ar: 'الشبكات' }, showInSidebar: true, showInBottomBar: false, group: 'network' },
  { path: '/prophet', icon: '☪️', label: { tr: 'Hz. Peygamber', en: 'The Prophet', ar: 'النبي ﷺ' }, showInSidebar: true, showInBottomBar: false, group: 'people' },
  { path: '/audio', icon: '🎧', label: { tr: 'Radyo Tiyatrosu', en: 'Radio Drama', ar: 'المسرح الإذاعي' }, showInSidebar: true, showInBottomBar: false, group: 'media' },
  { path: '/economy', icon: '💰', label: { tr: 'Ekonomi', en: 'Economy', ar: 'الاقتصاد' }, showInSidebar: true, showInBottomBar: false, group: 'explore' },
  { path: '/geography', icon: '🌍', label: { tr: 'Coğrafya', en: 'Geography', ar: 'الجغرافيا' }, showInSidebar: true, showInBottomBar: false, group: 'explore' },
  { path: '/literature', icon: '📜', label: { tr: 'Edebiyat', en: 'Literature', ar: 'الأدب' }, showInSidebar: true, showInBottomBar: false, group: 'explore' },
  { path: '/religions', icon: '🕌', label: { tr: 'Câhiliye İnançları', en: 'Pre-Islamic Beliefs', ar: 'معتقدات الجاهلية' }, showInSidebar: true, showInBottomBar: false, group: 'explore' },
  { path: '/stats', icon: '📊', label: { tr: 'İstatistikler', en: 'Statistics', ar: 'الإحصائيات' }, showInSidebar: true, showInBottomBar: false, group: 'tools' },
  { path: '/about', icon: 'ℹ️', label: { tr: 'Hakkında', en: 'About', ar: 'حول' }, showInSidebar: true, showInBottomBar: true },
];

/* ─── ROUTE DEFINITIONS ─── */
export const routes: RouteObject[] = [
  { path: '/', Component: HomePage },
  { path: '/map', Component: MapPage },
  { path: '/timeline', Component: TimelinePage },
  { path: '/companions', Component: CompanionsPage },
  { path: '/companions/:id', Component: CompanionDetailPage },
  { path: '/companions/:id/network', Component: CompanionDetailPage },
  { path: '/battles', Component: BattlesPage },
  { path: '/battles/:id', Component: BattleDetailPage },
  { path: '/battles/:id/map', Component: BattleDetailPage },
  { path: '/quran', Component: QuranPage },
  { path: '/quran/esbab', Component: QuranPage },
  { path: '/quran/esbab/:id', Component: QuranPage },
  { path: '/quran/hadith', Component: QuranPage },
  { path: '/quran/hadith/:id', Component: QuranPage },
  { path: '/museum', Component: MuseumPage },
  { path: '/museum/:category', Component: MuseumPage },
  { path: '/museum/:category/:id', Component: MuseumItemPage },
  { path: '/mesa-nebevi', Component: MesaNebeviPage },
  { path: '/network', Component: NetworkPage },
  { path: '/network/teacher-student', Component: NetworkPage },
  { path: '/network/tribes', Component: NetworkPage },
  { path: '/network/muahat', Component: NetworkPage },
  { path: '/prophet', Component: ProphetPage },
  { path: '/prophet/:section', Component: ProphetPage },
  { path: '/audio', Component: AudioPage },
  { path: '/economy', Component: EconomyPage },
  { path: '/geography', Component: GeographyPage },
  { path: '/literature', Component: LiteraturePage },
  { path: '/religions', Component: ReligionsPage },
  { path: '/stats', Component: StatsPage },
  { path: '/about', Component: AboutPage },
  { path: '*', Component: NotFoundPage },
];

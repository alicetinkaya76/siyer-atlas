import { lazy } from 'react';
import type { RouteObject } from 'react-router';

/* ─── LAZY PAGE IMPORTS ─── */
const HomePage = lazy(() => import('@/pages/HomePage'));
const MapPage = lazy(() => import('@/pages/MapPage'));
const TimelinePage = lazy(() => import('@/pages/TimelinePage'));
const CompanionsPage = lazy(() => import('@/pages/CompanionsPage'));
const CompanionDetailPage = lazy(() => import('@/pages/CompanionDetailPage'));
const BattlesPage = lazy(() => import('@/pages/BattlesPage'));
const BattleDetailPage = lazy(() => import('@/pages/BattleDetailPage'));
const QuranPage = lazy(() => import('@/pages/QuranPage'));
const MuseumPage = lazy(() => import('@/pages/MuseumPage'));
const MuseumItemPage = lazy(() => import('@/pages/MuseumItemPage'));
const NetworkPage = lazy(() => import('@/pages/NetworkPage'));
const ProphetPage = lazy(() => import('@/pages/ProphetPage'));
const AudioPage = lazy(() => import('@/pages/AudioPage'));
const StatsPage = lazy(() => import('@/pages/StatsPage'));
const EconomyPage = lazy(() => import('@/pages/EconomyPage'));
const LiteraturePage = lazy(() => import('@/pages/LiteraturePage'));
const ReligionsPage = lazy(() => import('@/pages/ReligionsPage'));
const GeographyPage = lazy(() => import('@/pages/GeographyPage'));
const MesaNebeviPage = lazy(() => import('@/pages/MesaNebeviPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

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

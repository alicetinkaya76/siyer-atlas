import type { LocalizedText } from './common';

/* ─── v2.12 LOCATION (locations.json — 185 kayıt) ─── */
export interface Location {
  id: string;
  name: LocalizedText;
  lat: number;
  lng: number;
  type: string; // city, mosque, battlefield, well, landmark, mountain, cave, etc.
  description: string; // TR-only in v2.12
  museum_item_ids: string[];
}

/* ─── v2.12 TIMELINE (timeline.json — 90 askerî olay) ─── */
export interface TimelineEntry {
  battle_id: string;
  tier: 1 | 2 | 3;
  name: string; // TR-only in v2.12
  year_ce: number;
  year_hijri: number | null;
  date_hijri: string;
  type: string; // gazve, seriyye, fetih, ridde, fitne, deniz_savasi, olay
  lat: number;
  lng: number;
  phase_count: number;
  result: string; // free-text description
}

/* ─── v2.12 PROPHET_EVENTS (prophet_events.json — 30 genel olay) ─── */
export interface ProphetEvent {
  id: string;
  event: LocalizedText;
  date_ce: number;
  date_hijri: string;
  age: number;
  location_id: string;
  description: LocalizedText;
  quran_refs: string[];
  hadith_refs: string[];
  significance: LocalizedText;
  source_refs: string[];
}

export interface ProphetEventsData {
  version: string;
  description: string;
  total_entries: number;
  entries: ProphetEvent[];
}

/* ─── v2.12 TRADE ROUTES (trade_routes.json — 5 güzergâh) ─── */
export interface TradeRoute {
  id: string;
  name: LocalizedText;
  waypoints: { name: string; lat: number; lng: number }[];
  description: LocalizedText;
  season: string;
  quran_ref: string;
  goods: string[];
}

/* ─── v2.12 TRIBES (tribes.json — 124 kabile) ─── */
export interface Tribe {
  id: string;
  name: LocalizedText;
  center_lat: number;
  center_lng: number;
  description: string;
  clans: { id: string; name: string; companions: string[] }[];
  region: string;
  territory_description: string;
}

/* ─── UNIFIED TIMELINE EVENT (for D3 chart — merged from multiple sources) ─── */
export interface UnifiedEvent {
  id: string;
  name: string;
  year_ce: number;
  period: 'mekke' | 'medine' | 'hulefa';
  category: 'battle' | 'seriyye' | 'conquest' | 'milestone' | 'political' | 'revelation' | 'migration';
  tier: 1 | 2 | 3;
  lat?: number;
  lng?: number;
  result?: string;
  battle_id?: string;
}

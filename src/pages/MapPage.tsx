import { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useMapStore } from '@/stores/useMapStore';
import { useTimelineStore } from '@/stores/useTimelineStore';
import { useData } from '@/hooks/useData';
import { useLocalizedField } from '@/hooks/useLocalizedField';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';
import { MapControls } from '@/components/map/MapControls';
import { MapLegend } from '@/components/map/MapLegend';
import { BattlePopup, LocationPopup, CompanionPopup, TribePopup, MuseumPopup, GeographyPopup } from '@/components/map/MapPopup';
import { createBattleIcon, createLocationIcon, createMarkerIcon } from '@/components/map/MarkerIcons';
import { HIJRAH_ROUTE } from '@/components/map/routeData';
import { MAP_CENTER, MAP_DEFAULT_ZOOM, TILE_URL, TILE_ATTRIBUTION, ERA_RANGES } from '@/config/constants';
import type { Location, TimelineEntry, TradeRoute, Tribe, LocalizedText } from '@/types';
import { getCategoryIcon, getCategoryColor } from '@/config/museum';

/* ─── Museum item shape for map pins ─── */
interface MuseumMapItem {
  id: string;
  name: LocalizedText;
  category: string;
  subcategory?: string;
  period?: string;
  description?: LocalizedText;
  coordinates?: { lat: number; lng: number };
}

/* ─── Geography item shape for map pins ─── */
interface GeoMapItem {
  id: string;
  name: LocalizedText;
  lat: number;
  lng: number;
  type: string;
  description: string;
  elevation_m?: number;
  quran_refs?: string[];
  geoCategory: string; // which array key it came from
}

/* ─── Companion raw shape for map join ─── */
interface RawCompanionMap {
  id: string;
  name: LocalizedText;
  birth_ce?: number;
  death_ce?: number;
  birth_location_id?: string;
  death_location_id?: string;
  category?: string;
  gender?: string;
}

/* ─── TIER → result category mapping (for marker color) ─── */

function resultCategory(result: string): string {
  const r = result.toLowerCase();
  if (r.includes('zafer') || r.includes('başarı') || r.includes('galip') || r.includes('fethed') || r.includes('teslim')) return 'victory';
  if (r.includes('yenilgi') || r.includes('bozgun') || r.includes('kayıp') || r.includes('şehit')) return 'defeat';
  if (r.includes('antlaşma') || r.includes('barış') || r.includes('biat')) return 'treaty';
  if (r.includes('çekil') || r.includes('dağıl') || r.includes('olmadı')) return 'withdrawal';
  return 'inconclusive';
}

/* ─── TRADE ROUTE COLORS ─── */

const ROUTE_COLORS = ['#d97706', '#0891b2', '#7c3aed', '#15803d', '#b91c1c'];

/* ─── MAP EVENT SYNC ─── */

function MapSync() {
  const setView = useMapStore((s) => s.setView);
  const setZoom = useMapStore((s) => s.setZoom);

  useMapEvents({
    moveend: (e) => {
      const map = e.target;
      const c = map.getCenter();
      setView({ lat: c.lat, lng: c.lng }, map.getZoom());
    },
    zoomend: (e) => {
      setZoom(e.target.getZoom());
    },
  });

  return null;
}

/* ─── FLY TO STORE CENTER ─── */

function FlyToCenter() {
  const map = useMap();
  const center = useMapStore((s) => s.center);
  const zoom = useMapStore((s) => s.zoom);
  const prevCenter = useRef(center);

  useEffect(() => {
    if (prevCenter.current.lat !== center.lat || prevCenter.current.lng !== center.lng) {
      map.flyTo([center.lat, center.lng], zoom, { duration: 0.8 });
      prevCenter.current = center;
    }
  }, [center, zoom, map]);

  return null;
}

/* ─── FLY TO QUERY PARAM (?fly=lat,lng,zoom) ─── */

function FlyToQueryParam() {
  const map = useMap();
  const [searchParams, setSearchParams] = useSearchParams();
  const didFly = useRef(false);

  useEffect(() => {
    if (didFly.current) return;
    const fly = searchParams.get('fly');
    if (!fly) return;

    const parts = fly.split(',').map(Number);
    if (parts.length >= 2 && !parts.some(isNaN)) {
      const lat = parts[0]!;
      const lng = parts[1]!;
      const zoom = parts[2];
      const z = zoom && zoom >= 4 && zoom <= 18 ? zoom : 12;
      // Small delay to let map initialize
      setTimeout(() => {
        map.flyTo([lat, lng], z, { duration: 1.2 });
      }, 300);
      didFly.current = true;
      // Clean up query param
      searchParams.delete('fly');
      setSearchParams(searchParams, { replace: true });
    }
  }, [map, searchParams, setSearchParams]);

  return null;
}

/* ─── FLOATING TIMELINE BAR (Mini) ─── */

function MiniTimelineBar() {
  const { currentYear, setCurrentYear, rangeStart, rangeEnd } = useTimelineStore();
  const { localize } = useLocalizedField();

  const era = currentYear < 622 ? 'mekke' : currentYear < 632 ? 'medine' : 'hulefa';
  const eraInfo = ERA_RANGES[era];
  const eraColor = era === 'mekke' ? '#a16207' : era === 'medine' ? '#15803d' : '#1d4ed8';

  return (
    <div
      className="absolute bottom-4 right-3 z-[1000] rounded-xl px-4 py-3 flex flex-col gap-2"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(var(--glass-blur))',
        WebkitBackdropFilter: 'blur(var(--glass-blur))',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--shadow-md)',
        minWidth: 220,
      }}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-lg font-bold tabular-nums"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
        >
          {currentYear} CE
        </span>
        <span
          className="px-2 py-0.5 rounded-full text-xs font-semibold"
          style={{ background: `${eraColor}18`, color: eraColor, border: `1px solid ${eraColor}30` }}
        >
          {localize(eraInfo.label)}
        </span>
      </div>

      <input
        type="range"
        min={rangeStart}
        max={rangeEnd}
        value={currentYear}
        onChange={(e) => setCurrentYear(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right,
            #a16207 0%,
            #a16207 ${((622 - rangeStart) / (rangeEnd - rangeStart)) * 100}%,
            #15803d ${((622 - rangeStart) / (rangeEnd - rangeStart)) * 100}%,
            #15803d ${((632 - rangeStart) / (rangeEnd - rangeStart)) * 100}%,
            #1d4ed8 ${((632 - rangeStart) / (rangeEnd - rangeStart)) * 100}%,
            #1d4ed8 100%)`,
          accentColor: 'var(--text-accent)',
        }}
      />

      <div className="flex justify-between text-xs" style={{ color: 'var(--text-tertiary)' }}>
        <span>{rangeStart}</span>
        <span>{rangeEnd}</span>
      </div>
    </div>
  );
}

/* ─── MAP EMPTY STATE OVERLAY ─── */

function MapEmptyOverlay() {
  const { i18n } = useTranslation();
  const lang = i18n.language as 'tr' | 'en' | 'ar';

  const text = {
    tr: { title: 'Görünen marker yok', desc: 'Katman seçimini veya zaman çizelgesini değiştirmeyi deneyin.' },
    en: { title: 'No visible markers', desc: 'Try changing layer selection or timeline.' },
    ar: { title: 'لا توجد علامات مرئية', desc: 'جرب تغيير اختيار الطبقة أو الجدول الزمني.' },
  };

  return (
    <div
      className="absolute inset-0 z-[999] flex items-center justify-center pointer-events-none"
    >
      <div
        className="rounded-2xl px-6 py-5 text-center pointer-events-auto"
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(var(--glass-blur))',
          WebkitBackdropFilter: 'blur(var(--glass-blur))',
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--shadow-lg)',
          maxWidth: 280,
        }}
      >
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-3">
          <path d="M60 20C45 20 33 32 33 47c0 20 27 43 27 43s27-23 27-43c0-15-12-27-27-27z" stroke="var(--text-tertiary)" strokeWidth="2.5" strokeDasharray="6 4" opacity="0.4" />
          <circle cx="60" cy="47" r="10" stroke="var(--text-accent)" strokeWidth="2" opacity="0.3" />
        </svg>
        <h4 className="text-sm font-bold mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
          {text[lang].title}
        </h4>
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          {text[lang].desc}
        </p>
      </div>
    </div>
  );
}

/* ─── MAIN MAP PAGE ─── */

export default function MapPage() {
  const { activeLayers } = useMapStore();
  const currentYear = useTimelineStore((s) => s.currentYear);

  // Fetch v2.12 data
  const { data: timeline = [] } = useData<TimelineEntry[]>('timeline');
  const { data: locations = [] } = useData<Location[]>('locations');
  const { data: tradeRoutes = [] } = useData<TradeRoute[]>('trade_routes');
  const { data: tribes = [] } = useData<Tribe[]>('tribes');
  const { data: companions = [] } = useData<RawCompanionMap[]>('companions');

  // Museum data — only categories with coordinates (architecture + geography)
  const showMuseum = activeLayers.includes('museum');
  const { data: museumArch = [] } = useData<MuseumMapItem[]>('museum_architecture', showMuseum);
  const { data: museumGeo = [] } = useData<MuseumMapItem[]>('museum_geography', showMuseum);

  // Geography data — 7 categories all with lat/lng
  const showGeography = activeLayers.includes('geography');
  const { data: geoData } = useData<Record<string, any>>('geography', showGeography);

  // Filter battles (timeline entries) by current year
  const filteredBattles = useMemo(
    () => timeline.filter((t) => t.year_ce <= currentYear && t.lat && t.lng),
    [timeline, currentYear],
  );

  // Build companion→location map markers
  const companionMarkers = useMemo(() => {
    if (!locations.length || !companions.length) return [];
    const locMap = new Map(locations.map(l => [l.id, l]));
    const markers: Array<{
      key: string;
      lat: number;
      lng: number;
      companion: RawCompanionMap;
      loc: Location;
      locType: 'birth' | 'death';
    }> = [];

    for (const c of companions) {
      if (c.birth_location_id) {
        const loc = locMap.get(c.birth_location_id);
        if (loc) {
          if (!c.birth_ce || c.birth_ce <= currentYear) {
            markers.push({ key: `${c.id}-birth`, lat: loc.lat, lng: loc.lng, companion: c, loc, locType: 'birth' });
          }
        }
      }
      if (c.death_location_id) {
        const loc = locMap.get(c.death_location_id);
        if (loc) {
          if (!c.death_ce || c.death_ce <= currentYear) {
            markers.push({ key: `${c.id}-death`, lat: loc.lat, lng: loc.lng, companion: c, loc, locType: 'death' });
          }
        }
      }
    }
    return markers;
  }, [companions, locations, currentYear]);

  // Museum markers — merge architecture + geography
  const museumMarkers = useMemo(() => {
    if (!showMuseum) return [];
    const items: MuseumMapItem[] = [
      ...museumArch.filter((i) => i.coordinates?.lat),
      ...museumGeo.filter((i) => i.coordinates?.lat),
    ];
    return items;
  }, [showMuseum, museumArch, museumGeo]);

  // Geography markers — flatten all 7 categories
  const geoMarkers = useMemo(() => {
    if (!showGeography || !geoData) return [];
    const GEO_KEYS = ['mountains', 'valleys', 'rivers_water', 'deserts_plains', 'mountain_passes', 'ports_coasts', 'islands'];
    const items: GeoMapItem[] = [];
    for (const key of GEO_KEYS) {
      const arr = geoData[key];
      if (Array.isArray(arr)) {
        for (const item of arr) {
          if (item.lat && item.lng) {
            items.push({ ...item, geoCategory: key });
          }
        }
      }
    }
    return items;
  }, [showGeography, geoData]);

  // All locations are static — no year filter needed
  const showHijrah = activeLayers.includes('hijrah') && currentYear >= 622;
  const showTradeRoutes = activeLayers.includes('tradeRoutes');
  const showTribes = activeLayers.includes('tribes');

  // Count visible markers for EmptyState
  const visibleMarkerCount = useMemo(() => {
    let count = 0;
    if (activeLayers.includes('battles')) count += filteredBattles.length;
    if (activeLayers.includes('locations')) count += locations.length;
    if (activeLayers.includes('companions')) count += companionMarkers.length;
    if (showTribes) count += tribes.length;
    if (showMuseum) count += museumMarkers.length;
    if (showGeography) count += geoMarkers.length;
    // hijrah + tradeRoutes are lines, not markers — don't count
    return count;
  }, [activeLayers, filteredBattles, locations, companionMarkers, tribes, museumMarkers, geoMarkers, showTribes, showMuseum, showGeography]);

  // Show empty only when at least one point layer is active but nothing visible
  const hasPointLayerActive = activeLayers.some((l) =>
    ['battles', 'locations', 'companions', 'tribes', 'museum', 'geography'].includes(l),
  );
  const showEmpty = hasPointLayerActive && visibleMarkerCount === 0;

  return (
    <div className="relative flex-1 w-full" style={{ height: 'calc(100dvh - var(--header-height))' }}>
      <MapContainer
        center={[MAP_CENTER.lat, MAP_CENTER.lng]}
        zoom={MAP_DEFAULT_ZOOM}
        className="h-full w-full z-0"
        zoomControl={false}
        attributionControl={true}
        minZoom={4}
        maxZoom={14}
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
        <MapSync />
        <FlyToCenter />
        <FlyToQueryParam />

        {/* ─── BATTLE LAYER (from timeline.json — 90 entries with lat/lng) ─── */}
        {activeLayers.includes('battles') &&
          filteredBattles.map((t) => (
            <Marker
              key={t.battle_id}
              position={[t.lat ?? 0, t.lng ?? 0]}
              icon={createBattleIcon(resultCategory(t.result), t.tier)}
            >
              <Popup maxWidth={300} className="glass-popup">
                <BattlePopup
                  battle_id={t.battle_id}
                  name={t.name}
                  year_ce={t.year_ce}
                  date_hijri={t.date_hijri}
                  type={t.type}
                  result={t.result}
                  tier={t.tier}
                />
              </Popup>
            </Marker>
          ))}

        {/* ─── LOCATION LAYER (from locations.json — 185 entries) ─── */}
        {activeLayers.includes('locations') &&
          locations.filter((loc) => loc.lat && loc.lng).map((loc) => (
            <Marker
              key={loc.id}
              position={[loc.lat, loc.lng]}
              icon={createLocationIcon(loc.type)}
            >
              <Popup maxWidth={280} className="glass-popup">
                <LocationPopup
                  name={loc.name}
                  type={loc.type}
                  description={loc.description}
                />
              </Popup>
            </Marker>
          ))}

        {/* ─── COMPANION LAYER (from companions.json joined with locations.json) ─── */}
        {activeLayers.includes('companions') &&
          companionMarkers.map((m) => (
            <Marker
              key={m.key}
              position={[m.lat, m.lng]}
              icon={createMarkerIcon('companion', 24)}
            >
              <Popup maxWidth={280} className="glass-popup">
                <CompanionPopup
                  id={m.companion.id}
                  name={m.companion.name}
                  birthCe={m.companion.birth_ce}
                  deathCe={m.companion.death_ce}
                  locName={m.loc.name}
                  locType={m.locType}
                  category={m.companion.category}
                />
              </Popup>
            </Marker>
          ))}

        {/* ─── MUSEUM LAYER (architecture 52 + geography 45 items with coords) ─── */}
        {showMuseum &&
          museumMarkers.map((item) => {
            const markerType = item.category === 'architecture' ? 'arch' : 'geo';
            return (
              <Marker
                key={`museum-${item.id}`}
                position={[item.coordinates!.lat, item.coordinates!.lng]}
                icon={createMarkerIcon(markerType as any, 26)}
              >
                <Popup maxWidth={280} className="glass-popup">
                  <MuseumPopup
                    id={item.id}
                    name={item.name}
                    category={item.category}
                    subcategory={item.subcategory}
                    period={item.period}
                    description={item.description}
                    categoryIcon={getCategoryIcon(item.category)}
                    categoryColor={getCategoryColor(item.category)}
                  />
                </Popup>
              </Marker>
            );
          })}

        {/* ─── GEOGRAPHY LAYER (87 items — mountains, valleys, rivers, etc.) ─── */}
        {showGeography &&
          geoMarkers.map((item) => {
            const markerType = ['rivers_water', 'ports_coasts'].includes(item.geoCategory) ? 'water' : 'mountain';
            return (
              <Marker
                key={`geo-${item.id}`}
                position={[item.lat, item.lng]}
                icon={createMarkerIcon(markerType as any, 24)}
              >
                <Popup maxWidth={280} className="glass-popup">
                  <GeographyPopup
                    name={item.name}
                    category={item.geoCategory}
                    description={item.description}
                    elevation_m={item.elevation_m}
                    quran_refs={item.quran_refs}
                  />
                </Popup>
              </Marker>
            );
          })}

        {/* ─── TRIBE LAYER (from tribes.json — 124 entries with center_lat/lng) ─── */}
        {showTribes &&
          tribes.map((tribe) => (
            <CircleMarker
              key={tribe.id}
              center={[tribe.center_lat ?? 0, tribe.center_lng ?? 0]}
              radius={8}
              pathOptions={{
                color: '#a16207',
                fillColor: '#d4af37',
                fillOpacity: 0.35,
                weight: 1.5,
              }}
            >
              <Popup maxWidth={260} className="glass-popup">
                <TribePopup
                  name={tribe.name}
                  description={tribe.description}
                  region={tribe.region}
                  clanCount={tribe.clans?.length ?? 0}
                />
              </Popup>
            </CircleMarker>
          ))}

        {/* ─── GEOGRAPHY LAYER (87 items — mountains, valleys, rivers, etc.) ─── */}
        {showGeography &&
          geoMarkers.map((item) => {
            const markerType = (['mountains', 'mountain_passes'].includes(item.geoCategory)
              ? 'mountain'
              : ['rivers_water', 'ports_coasts'].includes(item.geoCategory)
                ? 'water'
                : 'geo') as any;
            return (
              <Marker
                key={`geo-${item.id}`}
                position={[item.lat, item.lng]}
                icon={createMarkerIcon(markerType, 24)}
              >
                <Popup maxWidth={280} className="glass-popup">
                  <GeographyPopup
                    name={item.name}
                    category={item.geoCategory}
                    description={item.description}
                    elevation_m={item.elevation_m}
                    quran_refs={item.quran_refs}
                  />
                </Popup>
              </Marker>
            );
          })}

        {/* ─── HIJRAH ROUTE ─── */}
        {showHijrah && (
          <Polyline
            positions={HIJRAH_ROUTE}
            pathOptions={{
              color: '#15803d',
              weight: 3,
              dashArray: '8, 6',
              opacity: 0.8,
            }}
          />
        )}

        {/* ─── TRADE ROUTES (from trade_routes.json — 5 routes with waypoints) ─── */}
        {showTradeRoutes &&
          tradeRoutes.map((route, i) => (
            <Polyline
              key={route.id}
              positions={route.waypoints.map((wp) => [wp.lat, wp.lng] as [number, number])}
              pathOptions={{
                color: ROUTE_COLORS[i % ROUTE_COLORS.length] ?? '#d97706',
                weight: 2.5,
                dashArray: '4, 8',
                opacity: 0.6,
              }}
            />
          ))}
      </MapContainer>

      {/* Overlay controls */}
      <MapControls />
      <MapLegend />
      <MiniTimelineBar />
      {showEmpty && <MapEmptyOverlay />}
    </div>
  );
}

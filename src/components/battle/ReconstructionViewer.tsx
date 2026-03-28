import { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLocalizedField } from '@/hooks/useLocalizedField';
import type { LocalizedText } from '@/types';
import { TILE_URL, TILE_ATTRIBUTION } from '@/config/constants';

/* ─── Types matching reconstruction JSON schema ─── */

interface ReconLandmark {
  id: string;
  name: LocalizedText | string;
  lat: number;
  lng: number;
  type?: string;
  strategic_role?: LocalizedText | string;
}

interface ReconWaypoint {
  name: string;
  lat: number;
  lng: number;
  note_tr?: string;
  confidence?: string;
}

interface ReconRoute {
  id: string;
  name: LocalizedText | string;
  type: string;
  waypoints: ReconWaypoint[];
}

interface ReconPhase {
  id: string;
  order: number;
  name: LocalizedText | string;
  date_range?: { start: string; end: string };
  duration?: string;
  description: LocalizedText | string;
  key_decisions?: Array<{ decision: LocalizedText | string; actor?: string }>;
  map_state?: {
    show?: string[];
    zoom?: number;
    focus?: string;
    animation?: string;
  };
}

interface ReconSpatial {
  battlefield: {
    center: { lat: number; lng: number };
    bbox?: { north: number; south: number; east: number; west: number };
    terrain_type?: string;
    terrain_desc?: LocalizedText | string;
  };
  key_landmarks: ReconLandmark[];
  routes: ReconRoute[];
}

interface ReconForces {
  muslim: { total?: number; composition?: Array<{ unit: string; count: number }> };
  enemy: { total?: number; composition?: Array<{ unit: string; count: number }> };
}

interface ReconData {
  meta: { id: string; battle_id: string; tier: number };
  spatial: ReconSpatial;
  phases: ReconPhase[];
  forces?: ReconForces;
  quran_connections?: Array<{ surah: number; ayah_start: number; ayah_end: number; context: LocalizedText | string }>;
  hadith_connections?: Array<{ text: LocalizedText | string; source: string }>;
  impact?: LocalizedText | string;
}

/* ─── Landmark Icon Factory ─── */

const LANDMARK_COLORS: Record<string, string> = {
  command_post: '#d4af37',
  water_source: '#0891b2',
  defensive: '#15803d',
  geographic: '#6b7280',
  camp: '#a16207',
  cemetery: '#4b5563',
  default: '#1d4ed8',
};

const LANDMARK_ICONS: Record<string, string> = {
  command_post: '⚜️',
  water_source: '💧',
  defensive: '🛡️',
  geographic: '⛰️',
  camp: '⛺',
  cemetery: '🪦',
};

function createLandmarkIcon(type: string) {
  const color = LANDMARK_COLORS[type] ?? LANDMARK_COLORS.default;
  const size = 26;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40" width="${size}" height="${size * 1.25}">
    <path d="M16 0C7.16 0 0 7.16 0 16c0 11 16 24 16 24s16-13 16-24C32 7.16 24.84 0 16 0z" fill="${color}"/>
    <circle cx="16" cy="15" r="10" fill="rgba(255,255,255,0.25)"/>
    <circle cx="16" cy="15" r="6" fill="white" fill-opacity="0.9"/>
  </svg>`;
  return L.icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(svg)}`,
    iconSize: [size, size * 1.25],
    iconAnchor: [size / 2, size * 1.25],
    popupAnchor: [0, -size * 1.1],
  });
}

/* ─── Route Colors ─── */
const ROUTE_COLORS: Record<string, string> = {
  march: '#15803d',
  retreat: '#b91c1c',
  caravan: '#d97706',
  flanking: '#7c3aed',
  default: '#6b7280',
};

/* ─── FlyToPhase: fly map to phase focus ─── */

function FlyToPhase({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 0.8 });
  }, [center, zoom, map]);
  return null;
}

/* ─── MAIN COMPONENT ─── */

interface Props {
  data: ReconData;
}

export function ReconstructionViewer({ data }: Props) {
  const { localize, lang } = useLocalizedField();
  const [currentPhase, setCurrentPhase] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const { spatial, phases } = data;
  const phase = phases[currentPhase];

  // Resolve text helper
  const txt = useCallback(
    (v: LocalizedText | string | undefined): string => {
      if (!v) return '';
      if (typeof v === 'string') return v;
      return localize(v);
    },
    [localize],
  );

  // Auto-play
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentPhase((p) => {
        if (p >= phases.length - 1) {
          setIsPlaying(false);
          return p;
        }
        return p + 1;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [isPlaying, phases.length]);

  // Determine which landmarks/routes to show in current phase
  const showIds = phase?.map_state?.show ?? [];
  const phaseZoom = phase?.map_state?.zoom ?? 10;

  const visibleLandmarks = useMemo(
    () =>
      showIds.length > 0
        ? spatial.key_landmarks.filter((lm) => showIds.includes(lm.id))
        : spatial.key_landmarks,
    [showIds, spatial.key_landmarks],
  );

  const visibleRoutes = useMemo(
    () =>
      showIds.length > 0
        ? spatial.routes.filter((r) => showIds.includes(r.id))
        : spatial.routes,
    [showIds, spatial.routes],
  );

  // Map center: use phase focus or battlefield center
  const mapCenter: [number, number] = useMemo(() => {
    // If the phase shows specific landmarks, center on their midpoint
    if (visibleLandmarks.length > 0) {
      const avgLat = visibleLandmarks.reduce((s, l) => s + l.lat, 0) / visibleLandmarks.length;
      const avgLng = visibleLandmarks.reduce((s, l) => s + l.lng, 0) / visibleLandmarks.length;
      return [avgLat, avgLng];
    }
    return [spatial.battlefield.center.lat, spatial.battlefield.center.lng];
  }, [visibleLandmarks, spatial.battlefield.center]);

  return (
    <div className="flex flex-col gap-4">
      {/* ─── Mini Map ─── */}
      <div className="rounded-xl overflow-hidden" style={{ height: 320, border: '1px solid var(--border-color)' }}>
        <MapContainer
          center={[spatial.battlefield.center.lat, spatial.battlefield.center.lng]}
          zoom={phaseZoom}
          className="h-full w-full"
          zoomControl={false}
          attributionControl={false}
          minZoom={4}
          maxZoom={16}
        >
          <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
          <FlyToPhase center={mapCenter} zoom={phaseZoom} />

          {/* Landmarks */}
          {visibleLandmarks.map((lm) => (
            <Marker
              key={lm.id}
              position={[lm.lat, lm.lng]}
              icon={createLandmarkIcon(lm.type ?? 'default')}
            >
              <Popup maxWidth={220}>
                <div>
                  <h4 className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                    {LANDMARK_ICONS[lm.type ?? ''] ?? '📍'} {txt(lm.name)}
                  </h4>
                  {lm.strategic_role && (
                    <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                      {txt(lm.strategic_role).slice(0, 120)}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Routes */}
          {visibleRoutes.map((route) => (
            <Polyline
              key={route.id}
              positions={route.waypoints.map((wp) => [wp.lat, wp.lng] as [number, number])}
              pathOptions={{
                color: ROUTE_COLORS[route.type] ?? ROUTE_COLORS.default,
                weight: 3,
                dashArray: route.type === 'retreat' ? '6, 6' : undefined,
                opacity: 0.8,
              }}
            />
          ))}

          {/* Route waypoint dots */}
          {visibleRoutes.flatMap((route) =>
            route.waypoints.map((wp, i) => (
              <CircleMarker
                key={`${route.id}-wp-${i}`}
                center={[wp.lat, wp.lng]}
                radius={3}
                pathOptions={{
                  color: ROUTE_COLORS[route.type] ?? ROUTE_COLORS.default,
                  fillColor: '#fff',
                  fillOpacity: 0.9,
                  weight: 2,
                }}
              >
                {wp.name && (
                  <Popup>
                    <span className="text-xs font-medium">{wp.name}</span>
                  </Popup>
                )}
              </CircleMarker>
            )),
          )}
        </MapContainer>
      </div>

      {/* ─── Phase Controls ─── */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCurrentPhase((p) => Math.max(0, p - 1))}
          disabled={currentPhase === 0}
          className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-30"
          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
        >
          ◀ {lang === 'en' ? 'Prev' : 'Önceki'}
        </button>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
          style={{
            background: isPlaying ? 'rgba(185,28,28,0.1)' : 'rgba(21,128,61,0.1)',
            color: isPlaying ? '#b91c1c' : '#15803d',
            border: `1px solid ${isPlaying ? 'rgba(185,28,28,0.25)' : 'rgba(21,128,61,0.25)'}`,
          }}
        >
          {isPlaying ? '⏸ Dur' : '▶ Oynat'}
        </button>

        <button
          onClick={() => setCurrentPhase((p) => Math.min(phases.length - 1, p + 1))}
          disabled={currentPhase === phases.length - 1}
          className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-30"
          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
        >
          {lang === 'en' ? 'Next' : 'Sonraki'} ▶
        </button>

        <span className="ml-auto text-xs font-medium tabular-nums" style={{ color: 'var(--text-tertiary)' }}>
          {currentPhase + 1} / {phases.length}
        </span>
      </div>

      {/* Phase progress bar */}
      <div className="flex gap-1">
        {phases.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPhase(i)}
            className="flex-1 h-1.5 rounded-full transition-all"
            style={{
              background: i <= currentPhase ? 'var(--text-accent)' : 'var(--border-color)',
              opacity: i === currentPhase ? 1 : i < currentPhase ? 0.5 : 0.25,
            }}
          />
        ))}
      </div>

      {/* ─── Phase Detail Card ─── */}
      {phase && (
        <div className="rounded-xl p-4" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-start gap-3 mb-3">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold"
              style={{ background: 'var(--text-accent)', color: '#1a1a2e' }}
            >
              {phase.order + 1}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                {txt(phase.name)}
              </h3>
              {phase.date_range && (
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                  {phase.date_range.start} — {phase.date_range.end}
                  {phase.duration && ` (${phase.duration})`}
                </p>
              )}
            </div>
          </div>

          <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
            {txt(phase.description)}
          </p>

          {/* Key decisions */}
          {phase.key_decisions && phase.key_decisions.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-accent)' }}>
                ⚡ {lang === 'en' ? 'Key Decisions' : 'Kilit Kararlar'}
              </p>
              {phase.key_decisions.map((kd, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded-lg p-2"
                  style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.12)' }}
                >
                  <span className="text-xs">→</span>
                  <div className="text-xs" style={{ color: 'var(--text-primary)' }}>
                    {kd.actor && <strong className="mr-1">{kd.actor}:</strong>}
                    {txt(kd.decision)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

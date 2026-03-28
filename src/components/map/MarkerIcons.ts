import L from 'leaflet';

/* ─── MARKER SVG FACTORY ─── */

const svgTemplate = (path: string, color: string, size = 32) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40" width="${size}" height="${size * 1.25}">
    <defs>
      <filter id="ds" x="-20%" y="-10%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.25"/>
      </filter>
    </defs>
    <path d="M16 0C7.16 0 0 7.16 0 16c0 11 16 24 16 24s16-13 16-24C32 7.16 24.84 0 16 0z" fill="${color}" filter="url(#ds)"/>
    <circle cx="16" cy="15" r="11" fill="rgba(255,255,255,0.2)"/>
    <g transform="translate(8,7)" fill="white">${path}</g>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/* ─── ICON PATHS (16×16 viewBox) ─── */

const PATHS = {
  battle: '<path d="M2 14L8 2l2 5h4l-2 3 2 4H2z"/><path d="M10 2l4 8" stroke="white" stroke-width="1" fill="none"/>',
  mosque: '<path d="M8 1C5 1 3 4 3 6v3H1v6h14v-6h-2V6c0-2-2-5-5-5zm0 2c1.5 0 3 2 3 3v3H5V6c0-1 1.5-3 3-3z"/><rect x="7" y="0" width="2" height="3" rx="1"/>',
  city: '<rect x="1" y="6" width="4" height="10"/><rect x="6" y="3" width="5" height="13"/><rect x="12" y="7" width="3" height="9"/><rect x="2" y="8" width="1.5" height="2" fill="rgba(0,0,0,0.3)"/><rect x="7.5" y="5" width="2" height="2" fill="rgba(0,0,0,0.3)"/><rect x="7.5" y="9" width="2" height="2" fill="rgba(0,0,0,0.3)"/>',
  well: '<ellipse cx="8" cy="4" rx="6" ry="3" fill="none" stroke="white" stroke-width="1.5"/><path d="M2 4v6c0 2 2.7 4 6 4s6-2 6-4V4" fill="none" stroke="white" stroke-width="1.5"/><path d="M5 1v-0.5M11 1v-0.5M8 0v1" stroke="white" stroke-width="1"/>',
  companion: '<circle cx="8" cy="4" r="3.5"/><path d="M1 15c0-4 3-7 7-7s7 3 7 7"/>',
  museum: '<path d="M8 0L0 5v2h16V5L8 0zM1 8v6h3V8H1zm5 0v6h4V8H6zm6 0v6h3V8h-3zM0 15h16v1H0z"/>',
  landmark: '<path d="M8 0l2.5 5 5.5.8-4 3.9.9 5.5L8 12.7 3.1 15.2l.9-5.5-4-3.9L5.5 5z"/>',
  arch: '<path d="M1 15V6l7-5 7 5v9h-3v-5c0-2.2-1.8-4-4-4s-4 1.8-4 4v5H1z"/><rect x="6" y="0" width="4" height="2" rx="1"/>',
  geo: '<path d="M8 0C4 0 1 3.6 1 8c0 5.3 7 8 7 8s7-2.7 7-8c0-4.4-3-8-7-8zm0 11a3 3 0 110-6 3 3 0 010 6z"/>',
  mountain: '<path d="M1 15L5 5l3 4 4-8 3 14H1z"/><path d="M5 5l1.5 2L8 5.5" fill="rgba(255,255,255,0.4)"/>',
  water: '<path d="M2 8c1.5-3 3-4.5 6-4.5S12.5 5 14 8c-1.5 3-3 4.5-6 4.5S3.5 11 2 8z"/><circle cx="8" cy="8" r="3" fill="rgba(255,255,255,0.3)"/><path d="M3 12c1 1 2 2 3 2s2-1 3-2" stroke="white" stroke-width="0.8" fill="none" opacity="0.5"/>',
} as const;

/* ─── COLOR MAP ─── */

const COLORS = {
  battle: '#b91c1c',      // deep red
  mosque: '#15803d',       // green
  city: '#1d4ed8',         // blue
  well: '#0891b2',         // cyan
  companion: '#7c3aed',    // purple
  museum: '#a16207',       // amber
  landmark: '#d97706',     // orange
  arch: '#1a6b4a',         // architecture green
  geo: '#2e5984',          // geography blue
  mountain: '#7c3aed',     // purple for mountains
  water: '#0891b2',        // cyan for water
  default: '#6b7280',      // gray
} as const;

export type MarkerType = keyof typeof PATHS;

/* ─── LEAFLET ICON FACTORY ─── */

export function createMarkerIcon(type: MarkerType, size = 32): L.Icon {
  const color = COLORS[type] ?? COLORS.default;
  const path = PATHS[type] ?? PATHS.city;

  return L.icon({
    iconUrl: svgTemplate(path, color, size),
    iconSize: [size, size * 1.25],
    iconAnchor: [size / 2, size * 1.25],
    popupAnchor: [0, -size * 1.1],
    className: 'marker-icon',
  });
}

/* ─── BATTLE RESULT ICONS ─── */

const RESULT_COLORS: Record<string, string> = {
  victory: '#15803d',
  defeat: '#b91c1c',
  inconclusive: '#a16207',
  treaty: '#1d4ed8',
  withdrawal: '#6b7280',
};

export function createBattleIcon(result: string, tier: number): L.Icon {
  const color = RESULT_COLORS[result] ?? '#6b7280';
  const size = tier === 1 ? 36 : tier === 2 ? 28 : 22;
  return L.icon({
    iconUrl: svgTemplate(PATHS.battle, color, size),
    iconSize: [size, size * 1.25],
    iconAnchor: [size / 2, size * 1.25],
    popupAnchor: [0, -size * 1.1],
    className: `marker-icon marker-battle tier-${tier}`,
  });
}

export function createLocationIcon(type: string): L.Icon {
  const markerType = (['mosque', 'city', 'well', 'landmark'].includes(type) ? type : 'city') as MarkerType;
  return createMarkerIcon(markerType, 28);
}

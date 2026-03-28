import type { LocalizedText, Coordinate, Period, SourceRef } from './common';

export interface Battle {
  id: string;
  name: LocalizedText;
  type: 'gazve' | 'seriyye' | 'fetih' | 'muhasara' | 'savunma' | 'ic_savas' | 'isyan';
  date_hijri?: string;
  date_ce?: string;
  year_ce: number;
  year_hijri?: number;
  period: Period;
  location: Coordinate & { name: LocalizedText };
  description: LocalizedText;
  result: 'victory' | 'defeat' | 'inconclusive' | 'treaty' | 'withdrawal';
  muslim_forces?: ForceInfo;
  enemy_forces?: ForceInfo;
  commanders_muslim: string[];
  commanders_enemy: string[];
  casualties_muslim?: string;
  casualties_enemy?: string;
  significance: LocalizedText;
  quran_refs?: string[];
  museum_item_ids: string[];
  reconstruction_id?: string;
  sources: SourceRef[];
  tier: 1 | 2 | 3;
}

export interface ForceInfo {
  count?: number;
  description: LocalizedText;
  composition?: string[];
}

export interface ReconstructionPhase {
  phase: number;
  title: LocalizedText;
  description: LocalizedText;
  timestamp?: string;
  map_state: {
    center: Coordinate;
    zoom: number;
    markers: ReconMarker[];
    polylines?: ReconPolyline[];
    polygons?: ReconPolygon[];
  };
  forces?: {
    muslim: ForceInfo;
    enemy: ForceInfo;
  };
}

export interface ReconMarker {
  id: string;
  position: Coordinate;
  type: 'army' | 'commander' | 'fortification' | 'event' | 'camp';
  label: LocalizedText;
  side: 'muslim' | 'enemy' | 'neutral';
  icon?: string;
}

export interface ReconPolyline {
  positions: Coordinate[];
  color: string;
  label?: string;
  dashed?: boolean;
}

export interface ReconPolygon {
  positions: Coordinate[];
  color: string;
  fill: string;
  label?: string;
}

import type { LocalizedText, MuseumCategoryKey, VisualType, Period, SourceRef } from './common';

export interface MuseumItem {
  id: string;
  name: LocalizedText;
  alternate_names?: LocalizedText;
  category: MuseumCategoryKey;
  subcategory: string;
  period: Period;
  description: LocalizedText;
  historical_context?: LocalizedText;
  period_comparison?: {
    pre_islamic: LocalizedText;
    islamic: LocalizedText;
  };
  visual_type: VisualType;
  visual_description?: LocalizedText;
  svg_file?: string;
  photo_url?: string;
  reconstruction_id?: string;
  dimensions?: string;
  materials?: LocalizedText;
  current_location?: LocalizedText;
  companion_ids: string[];
  battle_ids: string[];
  quran_refs?: string[];
  hadith_refs?: string[];
  sources: SourceRef[];
  authenticity_note?: LocalizedText;
  exhibition_note?: LocalizedText;
}

export interface MuseumMasterEntry {
  id: string;
  name: LocalizedText;
  category: MuseumCategoryKey;
  subcategory: string;
  period: Period;
  visual_type: VisualType;
  has_svg: boolean;
  companion_count: number;
  battle_count: number;
}

export interface MuseumCategoryMeta {
  key: MuseumCategoryKey;
  icon: string;
  color: string;
  label: LocalizedText;
  count: number;
  subcategories: string[];
  visualTypes: VisualType[];
  hasMap: boolean;
}

export interface MuseumCrossRef {
  companion_to_items: Record<string, string[]>;
  battle_to_items: Record<string, string[]>;
  item_to_companions: Record<string, string[]>;
  item_to_battles: Record<string, string[]>;
}

export interface MuseumAssetManifest {
  [itemId: string]: {
    svg?: string;
    thumb_webp?: string;
    full_webp?: string;
    blurhash?: string;
    width: number;
    height: number;
    type: VisualType;
  };
}

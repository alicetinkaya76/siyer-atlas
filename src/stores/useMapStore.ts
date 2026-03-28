import { create } from 'zustand';
import type { Coordinate } from '@/types';
import { MAP_CENTER, MAP_DEFAULT_ZOOM } from '@/config/constants';

export type MapLayerKey =
  | 'battles'
  | 'locations'
  | 'companions'
  | 'tribes'
  | 'tradeRoutes'
  | 'hijrah'
  | 'museum'
  | 'geography'
  | 'heatmap';

interface MapState {
  center: Coordinate;
  zoom: number;
  activeLayers: MapLayerKey[];
  selectedFeatureId: string | null;
  selectedFeatureType: string | null;
  popupOpen: boolean;

  setCenter: (center: Coordinate) => void;
  setZoom: (zoom: number) => void;
  setView: (center: Coordinate, zoom: number) => void;
  toggleLayer: (layer: MapLayerKey) => void;
  setActiveLayers: (layers: MapLayerKey[]) => void;
  selectFeature: (id: string | null, type?: string | null) => void;
  setPopupOpen: (open: boolean) => void;
  resetMap: () => void;
}

const defaultLayers: MapLayerKey[] = ['battles', 'locations'];

export const useMapStore = create<MapState>()((set) => ({
  center: MAP_CENTER,
  zoom: MAP_DEFAULT_ZOOM,
  activeLayers: defaultLayers,
  selectedFeatureId: null,
  selectedFeatureType: null,
  popupOpen: false,

  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),
  setView: (center, zoom) => set({ center, zoom }),

  toggleLayer: (layer) =>
    set((s) => ({
      activeLayers: s.activeLayers.includes(layer)
        ? s.activeLayers.filter((l) => l !== layer)
        : [...s.activeLayers, layer],
    })),

  setActiveLayers: (layers) => set({ activeLayers: layers }),

  selectFeature: (id, type = null) =>
    set({ selectedFeatureId: id, selectedFeatureType: type, popupOpen: !!id }),

  setPopupOpen: (open) =>
    set((s) => ({ popupOpen: open, selectedFeatureId: open ? s.selectedFeatureId : null })),

  resetMap: () =>
    set({
      center: MAP_CENTER,
      zoom: MAP_DEFAULT_ZOOM,
      activeLayers: defaultLayers,
      selectedFeatureId: null,
      selectedFeatureType: null,
      popupOpen: false,
    }),
}));

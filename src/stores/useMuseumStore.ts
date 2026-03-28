import { create } from 'zustand';
import type { MuseumCategoryKey, VisualType, ViewMode, SortOrder } from '@/types';

interface MuseumState {
  activeCategory: MuseumCategoryKey | 'all';
  subcategory: string | null;
  viewMode: ViewMode;
  sortBy: 'name' | 'subcategory' | 'period' | 'visual' | 'relevance';
  sortOrder: SortOrder;
  visualTypeFilter: VisualType | 'all';
  hasVisualFilter: boolean | null;
  searchTerm: string;
  selectedItemId: string | null;
  comparisonItemId: string | null;

  setActiveCategory: (cat: MuseumCategoryKey | 'all') => void;
  setSubcategory: (sub: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
  setSortBy: (field: MuseumState['sortBy']) => void;
  setSortOrder: (order: SortOrder) => void;
  setVisualTypeFilter: (type: VisualType | 'all') => void;
  setHasVisualFilter: (has: boolean | null) => void;
  setSearchTerm: (term: string) => void;
  setSelectedItemId: (id: string | null) => void;
  setComparisonItemId: (id: string | null) => void;
  resetMuseumFilters: () => void;
}

const defaults = {
  activeCategory: 'all' as const,
  subcategory: null,
  viewMode: 'grid' as ViewMode,
  sortBy: 'name' as const,
  sortOrder: 'asc' as SortOrder,
  visualTypeFilter: 'all' as const,
  hasVisualFilter: null,
  searchTerm: '',
  selectedItemId: null,
  comparisonItemId: null,
};

export const useMuseumStore = create<MuseumState>()((set) => ({
  ...defaults,
  setActiveCategory: (cat) => set({ activeCategory: cat, subcategory: null }),
  setSubcategory: (sub) => set({ subcategory: sub }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setSortBy: (field) => set({ sortBy: field }),
  setSortOrder: (order) => set({ sortOrder: order }),
  setVisualTypeFilter: (type) => set({ visualTypeFilter: type }),
  setHasVisualFilter: (has) => set({ hasVisualFilter: has }),
  setSearchTerm: (term) => set({ searchTerm: term }),
  setSelectedItemId: (id) => set({ selectedItemId: id }),
  setComparisonItemId: (id) => set({ comparisonItemId: id }),
  resetMuseumFilters: () => set(defaults),
}));

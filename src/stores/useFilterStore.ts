import { create } from 'zustand';
import type { Period, ViewMode, SortOrder } from '@/types';

interface FilterState {
  searchTerm: string;
  period: Period | 'all';
  viewMode: ViewMode;
  sortBy: string;
  sortOrder: SortOrder;
  selectedCompanionId: string | null;
  selectedBattleId: string | null;

  setSearchTerm: (term: string) => void;
  setPeriod: (period: Period | 'all') => void;
  setViewMode: (mode: ViewMode) => void;
  setSortBy: (field: string) => void;
  setSortOrder: (order: SortOrder) => void;
  setSelectedCompanionId: (id: string | null) => void;
  setSelectedBattleId: (id: string | null) => void;
  resetFilters: () => void;
}

const defaults = {
  searchTerm: '',
  period: 'all' as const,
  viewMode: 'grid' as ViewMode,
  sortBy: 'name',
  sortOrder: 'asc' as SortOrder,
  selectedCompanionId: null,
  selectedBattleId: null,
};

export const useFilterStore = create<FilterState>()((set) => ({
  ...defaults,
  setSearchTerm: (term) => set({ searchTerm: term }),
  setPeriod: (period) => set({ period }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setSortBy: (field) => set({ sortBy: field }),
  setSortOrder: (order) => set({ sortOrder: order }),
  setSelectedCompanionId: (id) => set({ selectedCompanionId: id }),
  setSelectedBattleId: (id) => set({ selectedBattleId: id }),
  resetFilters: () => set(defaults),
}));

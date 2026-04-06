import { create } from 'zustand';
import { AlertPriority } from '@/types';
import { EntityType, TimeRange } from '@/types';

interface DashboardState {
  timeRange: TimeRange;
  selectedPriorities: AlertPriority[];
  selectedEntityTypes: EntityType[];
  searchQuery: string;
  briefingDismissed: boolean;
}

interface DashboardActions {
  setTimeRange: (range: TimeRange) => void;
  togglePriority: (priority: AlertPriority) => void;
  toggleEntityType: (type: EntityType) => void;
  setSearchQuery: (query: string) => void;
  dismissBriefing: () => void;
  resetFilters: () => void;
}

export const useDashboardStore = create<DashboardState & DashboardActions>((set) => ({
  timeRange: '7d',
  selectedPriorities: [],
  selectedEntityTypes: [],
  searchQuery: '',
  briefingDismissed: false,

  setTimeRange: (range) => set({ timeRange: range }),
  togglePriority: (priority) => set((state) => ({
    selectedPriorities: state.selectedPriorities.includes(priority)
      ? state.selectedPriorities.filter(p => p !== priority)
      : [...state.selectedPriorities, priority],
  })),
  toggleEntityType: (type) => set((state) => ({
    selectedEntityTypes: state.selectedEntityTypes.includes(type)
      ? state.selectedEntityTypes.filter(t => t !== type)
      : [...state.selectedEntityTypes, type],
  })),
  setSearchQuery: (query) => set({ searchQuery: query }),
  dismissBriefing: () => set({ briefingDismissed: true }),
  resetFilters: () => set({ selectedPriorities: [], selectedEntityTypes: [], searchQuery: '', timeRange: '7d' }),
}));

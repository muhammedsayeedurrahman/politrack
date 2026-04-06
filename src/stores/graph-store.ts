import { create } from 'zustand';
import { EntityType, GraphLayout } from '@/types';

interface GraphState {
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  layout: GraphLayout;
  entityTypeFilters: EntityType[];
  edgeTypeFilters: ('financial' | 'organizational' | 'familial' | 'contractual')[];
  riskScoreRange: [number, number];
  searchQuery: string;
  zoom: number;
}

interface GraphActions {
  selectNode: (id: string | null) => void;
  selectEdge: (id: string | null) => void;
  setLayout: (layout: GraphLayout) => void;
  toggleEntityTypeFilter: (type: EntityType) => void;
  toggleEdgeTypeFilter: (type: GraphState['edgeTypeFilters'][number]) => void;
  setRiskScoreRange: (range: [number, number]) => void;
  setSearchQuery: (query: string) => void;
  setZoom: (zoom: number) => void;
  resetFilters: () => void;
}

export const useGraphStore = create<GraphState & GraphActions>((set) => ({
  selectedNodeId: null,
  selectedEdgeId: null,
  layout: 'fcose',
  entityTypeFilters: ['person', 'company', 'official', 'contract'],
  edgeTypeFilters: ['financial', 'organizational', 'familial', 'contractual'],
  riskScoreRange: [0, 100],
  searchQuery: '',
  zoom: 1,

  selectNode: (id) => set({ selectedNodeId: id, selectedEdgeId: null }),
  selectEdge: (id) => set({ selectedEdgeId: id, selectedNodeId: null }),
  setLayout: (layout) => set({ layout }),
  toggleEntityTypeFilter: (type) => set((state) => ({
    entityTypeFilters: state.entityTypeFilters.includes(type)
      ? state.entityTypeFilters.filter(t => t !== type)
      : [...state.entityTypeFilters, type],
  })),
  toggleEdgeTypeFilter: (type) => set((state) => ({
    edgeTypeFilters: state.edgeTypeFilters.includes(type)
      ? state.edgeTypeFilters.filter(t => t !== type)
      : [...state.edgeTypeFilters, type],
  })),
  setRiskScoreRange: (range) => set({ riskScoreRange: range }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setZoom: (zoom) => set({ zoom }),
  resetFilters: () => set({
    entityTypeFilters: ['person', 'company', 'official', 'contract'],
    edgeTypeFilters: ['financial', 'organizational', 'familial', 'contractual'],
    riskScoreRange: [0, 100],
    searchQuery: '',
  }),
}));

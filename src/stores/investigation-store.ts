import { create } from 'zustand';
import { CaseStatus } from '@/types';

interface InvestigationState {
  activeCaseId: string | null;
  activeTab: 'documents' | 'graph' | 'timeline';
  caseFilter: {
    status: CaseStatus[];
    search: string;
    sortBy: 'priority' | 'date' | 'status';
  };
  activityLogExpanded: boolean;
}

interface InvestigationActions {
  setActiveCaseId: (id: string | null) => void;
  setActiveTab: (tab: InvestigationState['activeTab']) => void;
  toggleStatusFilter: (status: CaseStatus) => void;
  setCaseSearch: (search: string) => void;
  setSortBy: (sortBy: InvestigationState['caseFilter']['sortBy']) => void;
  toggleActivityLog: () => void;
}

export const useInvestigationStore = create<InvestigationState & InvestigationActions>((set) => ({
  activeCaseId: null,
  activeTab: 'documents',
  caseFilter: { status: [], search: '', sortBy: 'priority' },
  activityLogExpanded: true,

  setActiveCaseId: (id) => set({ activeCaseId: id }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleStatusFilter: (status) => set((state) => ({
    caseFilter: {
      ...state.caseFilter,
      status: state.caseFilter.status.includes(status)
        ? state.caseFilter.status.filter(s => s !== status)
        : [...state.caseFilter.status, status],
    },
  })),
  setCaseSearch: (search) => set((state) => ({ caseFilter: { ...state.caseFilter, search } })),
  setSortBy: (sortBy) => set((state) => ({ caseFilter: { ...state.caseFilter, sortBy } })),
  toggleActivityLog: () => set((state) => ({ activityLogExpanded: !state.activityLogExpanded })),
}));

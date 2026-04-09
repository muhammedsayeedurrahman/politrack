import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  context?: {
    page: string;
    entityId?: string;
    caseId?: string;
    alertId?: string;
  };
}

interface AIState {
  panelOpen: boolean;
  messages: ChatMessage[];
  isStreaming: boolean;
  streamingContent: string;
  currentPage: string;
  selectedEntityId: string | null;
  selectedCaseId: string | null;
  onboardingDismissed: boolean;
  activeAgent: string | null;
  agentSteps: string[];
}

interface AIActions {
  togglePanel: () => void;
  setPanelOpen: (open: boolean) => void;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  setStreaming: (streaming: boolean) => void;
  setStreamingContent: (content: string) => void;
  appendStreamingContent: (chunk: string) => void;
  setCurrentPage: (page: string) => void;
  setSelectedEntityId: (id: string | null) => void;
  setSelectedCaseId: (id: string | null) => void;
  clearMessages: () => void;
  dismissOnboarding: () => void;
  resetOnboarding: () => void;
  setActiveAgent: (agent: string | null) => void;
  addAgentStep: (step: string) => void;
  clearAgentSteps: () => void;
}

export const useAIStore = create<AIState & AIActions>((set) => ({
  panelOpen: false,
  messages: [],
  isStreaming: false,
  streamingContent: '',
  currentPage: 'dashboard',
  selectedEntityId: null,
  selectedCaseId: null,
  onboardingDismissed: false,
  activeAgent: null,
  agentSteps: [],

  togglePanel: () => set((state) => ({ panelOpen: !state.panelOpen })),
  setPanelOpen: (open) => set({ panelOpen: open }),
  addMessage: (message) => set((state) => ({
    messages: [
      ...state.messages,
      {
        ...message,
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toISOString(),
      },
    ],
  })),
  setStreaming: (streaming) => set({ isStreaming: streaming }),
  setStreamingContent: (content) => set({ streamingContent: content }),
  appendStreamingContent: (chunk) => set((state) => ({
    streamingContent: state.streamingContent + chunk,
  })),
  setCurrentPage: (page) => set({ currentPage: page }),
  setSelectedEntityId: (id) => set({ selectedEntityId: id }),
  setSelectedCaseId: (id) => set({ selectedCaseId: id }),
  clearMessages: () => set({ messages: [], streamingContent: '' }),
  dismissOnboarding: () => set({ onboardingDismissed: true }),
  resetOnboarding: () => set({ onboardingDismissed: false }),
  setActiveAgent: (agent) => set({ activeAgent: agent }),
  addAgentStep: (step) => set((state) => ({ agentSteps: [...state.agentSteps, step] })),
  clearAgentSteps: () => set({ agentSteps: [] }),
}));

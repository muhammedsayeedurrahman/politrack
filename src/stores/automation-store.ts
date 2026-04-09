import { create } from 'zustand';

export type RuleConditionField = 'priority' | 'entity_type' | 'risk_score' | 'keyword' | 'source';
export type RuleAction = 'escalate' | 'assign' | 'notify' | 'tag' | 'auto_dismiss';

export interface AutomationRuleCondition {
  field: RuleConditionField;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
  value: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  conditions: AutomationRuleCondition[];
  action: RuleAction;
  actionValue?: string;
  enabled: boolean;
  matchCount: number;
  suggestedBy: 'ai' | 'user';
  createdAt: string;
}

interface AutomationState {
  rules: AutomationRule[];
  showRuleBuilder: boolean;
}

interface AutomationActions {
  toggleRule: (id: string) => void;
  addRule: (rule: Omit<AutomationRule, 'id' | 'matchCount' | 'createdAt'>) => void;
  removeRule: (id: string) => void;
  setShowRuleBuilder: (show: boolean) => void;
}

const DEFAULT_RULES: AutomationRule[] = [
  {
    id: 'rule-1',
    name: 'Auto-escalate critical government alerts',
    description: 'Automatically escalate all critical-priority alerts involving government officials to senior investigators.',
    conditions: [
      { field: 'priority', operator: 'equals', value: 'critical' },
      { field: 'entity_type', operator: 'equals', value: 'official' },
    ],
    action: 'escalate',
    enabled: true,
    matchCount: 12,
    suggestedBy: 'ai',
    createdAt: '2026-04-01T08:00:00Z',
  },
  {
    id: 'rule-2',
    name: 'Flag high-risk connected entities',
    description: 'Flag alerts involving entities with risk scores exceeding 80 for immediate review.',
    conditions: [
      { field: 'risk_score', operator: 'greater_than', value: '80' },
    ],
    action: 'tag',
    actionValue: 'high-risk-review',
    enabled: true,
    matchCount: 8,
    suggestedBy: 'ai',
    createdAt: '2026-04-02T10:00:00Z',
  },
  {
    id: 'rule-3',
    name: 'Auto-assign procurement fraud alerts',
    description: 'Automatically assign all procurement fraud alerts to Team Alpha for specialized investigation.',
    conditions: [
      { field: 'keyword', operator: 'contains', value: 'procurement' },
    ],
    action: 'assign',
    actionValue: 'Team Alpha',
    enabled: true,
    matchCount: 15,
    suggestedBy: 'ai',
    createdAt: '2026-04-03T09:00:00Z',
  },
  {
    id: 'rule-4',
    name: 'Notify on risk threshold breach',
    description: 'Send notification when any entity risk score exceeds 90, indicating critical threat level.',
    conditions: [
      { field: 'risk_score', operator: 'greater_than', value: '90' },
    ],
    action: 'notify',
    enabled: false,
    matchCount: 3,
    suggestedBy: 'ai',
    createdAt: '2026-04-04T14:00:00Z',
  },
  {
    id: 'rule-5',
    name: 'Auto-dismiss low-risk informational alerts',
    description: 'Automatically dismiss alerts with risk score below 15 and low priority to reduce noise.',
    conditions: [
      { field: 'priority', operator: 'equals', value: 'low' },
      { field: 'risk_score', operator: 'less_than', value: '15' },
    ],
    action: 'auto_dismiss',
    enabled: false,
    matchCount: 22,
    suggestedBy: 'ai',
    createdAt: '2026-04-05T11:00:00Z',
  },
];

export const useAutomationStore = create<AutomationState & AutomationActions>((set) => ({
  rules: DEFAULT_RULES,
  showRuleBuilder: false,

  toggleRule: (id) =>
    set((state) => ({
      rules: state.rules.map((r) =>
        r.id === id ? { ...r, enabled: !r.enabled } : r,
      ),
    })),

  addRule: (rule) =>
    set((state) => ({
      rules: [
        ...state.rules,
        {
          ...rule,
          id: `rule-${Date.now()}`,
          matchCount: 0,
          createdAt: new Date().toISOString(),
        },
      ],
    })),

  removeRule: (id) =>
    set((state) => ({
      rules: state.rules.filter((r) => r.id !== id),
    })),

  setShowRuleBuilder: (show) => set({ showRuleBuilder: show }),
}));

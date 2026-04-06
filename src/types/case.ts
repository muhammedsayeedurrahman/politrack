import { AlertPriority } from './alert';

export type CaseStatus = 'new' | 'in_progress' | 'pending' | 'closed';

export interface Evidence {
  id: string;
  type: 'document' | 'transaction' | 'communication' | 'report';
  title: string;
  description: string;
  source: string;
  timestamp: string;
  metadata: Record<string, string>;
}

export interface Activity {
  id: string;
  type: 'created' | 'updated' | 'escalated' | 'comment' | 'evidence_added' | 'status_changed';
  description: string;
  user: string;
  timestamp: string;
}

export interface Case {
  id: string;
  title: string;
  status: CaseStatus;
  priority: AlertPriority;
  assignee: string;
  entityIds: string[];
  alertIds: string[];
  summary: string;
  riskScore: number;
  createdAt: string;
  updatedAt: string;
  evidence: Evidence[];
  activities: Activity[];
  tags: string[];
}

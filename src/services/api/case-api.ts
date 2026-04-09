import { apiGet, apiPatch, apiPost } from '@/lib/api-client';
import type { Case, CaseStatus, AlertPriority } from '@/types';

export interface CaseFilter {
  status?: CaseStatus[];
  priority?: AlertPriority[];
  assignee?: string;
  search?: string;
  tags?: string[];
}

export const caseApi = {
  getCases(filter?: CaseFilter): Promise<Case[]> {
    return apiGet<Case[]>('/cases', {
      status: filter?.status,
      priority: filter?.priority,
      assignee: filter?.assignee,
      search: filter?.search,
      tags: filter?.tags,
    });
  },

  getCase(id: string): Promise<Case | null> {
    return apiGet<Case>(`/cases/${id}`);
  },

  updateStatus(id: string, status: CaseStatus): Promise<Case> {
    return apiPatch<Case>(`/cases/${id}`, { status });
  },

  updatePriority(id: string, priority: AlertPriority): Promise<Case> {
    return apiPatch<Case>(`/cases/${id}`, { priority });
  },

  addComment(id: string, comment: string, user: string): Promise<Case> {
    return apiPost<Case>(`/cases/${id}/comments`, { comment, user });
  },
};

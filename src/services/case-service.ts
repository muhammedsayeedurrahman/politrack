import { Case, CaseStatus, AlertPriority } from '@/types';
import { mockCases } from './mock-data';

export interface CaseFilter {
  status?: CaseStatus[];
  priority?: AlertPriority[];
  assignee?: string;
  search?: string;
  tags?: string[];
}

let cases: Case[] = [...mockCases];

export const caseService = {
  getCases(filter?: CaseFilter): Promise<Case[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filtered = [...cases];

        if (filter?.status?.length) {
          filtered = filtered.filter((c) =>
            filter.status!.includes(c.status),
          );
        }

        if (filter?.priority?.length) {
          filtered = filtered.filter((c) =>
            filter.priority!.includes(c.priority),
          );
        }

        if (filter?.assignee) {
          const assignee = filter.assignee.toLowerCase();
          filtered = filtered.filter((c) =>
            c.assignee.toLowerCase().includes(assignee),
          );
        }

        if (filter?.tags?.length) {
          filtered = filtered.filter((c) =>
            filter.tags!.some((tag) => c.tags.includes(tag)),
          );
        }

        if (filter?.search) {
          const s = filter.search.toLowerCase();
          filtered = filtered.filter(
            (c) =>
              c.title.toLowerCase().includes(s) ||
              c.summary.toLowerCase().includes(s) ||
              c.assignee.toLowerCase().includes(s),
          );
        }

        filtered.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );

        resolve(filtered);
      }, 300);
    });
  },

  getCase(id: string): Promise<Case | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const found = cases.find((c) => c.id === id) ?? null;
        resolve(found);
      }, 200);
    });
  },

  updateStatus(id: string, status: CaseStatus): Promise<Case | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let updated: Case | null = null;

        cases = cases.map((c) => {
          if (c.id !== id) return c;

          updated = {
            ...c,
            status,
            updatedAt: new Date().toISOString(),
            activities: [
              ...c.activities,
              {
                id: `act-${Date.now()}`,
                type: 'status_changed',
                description: `Case status changed from "${c.status}" to "${status}".`,
                user: 'System',
                timestamp: new Date().toISOString(),
              },
            ],
          };
          return updated;
        });

        resolve(updated);
      }, 200);
    });
  },

  updatePriority(id: string, priority: AlertPriority): Promise<Case | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let updated: Case | null = null;

        cases = cases.map((c) => {
          if (c.id !== id) return c;

          updated = {
            ...c,
            priority,
            updatedAt: new Date().toISOString(),
            activities: [
              ...c.activities,
              {
                id: `act-${Date.now()}`,
                type: 'updated',
                description: `Case priority changed from "${c.priority}" to "${priority}".`,
                user: 'System',
                timestamp: new Date().toISOString(),
              },
            ],
          };
          return updated;
        });

        resolve(updated);
      }, 200);
    });
  },

  addComment(id: string, comment: string, user: string): Promise<Case | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let updated: Case | null = null;

        cases = cases.map((c) => {
          if (c.id !== id) return c;

          updated = {
            ...c,
            updatedAt: new Date().toISOString(),
            activities: [
              ...c.activities,
              {
                id: `act-${Date.now()}`,
                type: 'comment',
                description: comment,
                user,
                timestamp: new Date().toISOString(),
              },
            ],
          };
          return updated;
        });

        resolve(updated);
      }, 150);
    });
  },

  getStatusCounts(): Promise<Record<CaseStatus, number>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const counts: Record<CaseStatus, number> = {
          new: 0,
          in_progress: 0,
          pending: 0,
          closed: 0,
        };
        for (const c of cases) {
          counts[c.status]++;
        }
        resolve(counts);
      }, 100);
    });
  },
};

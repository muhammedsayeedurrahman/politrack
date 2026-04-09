import { apiGet, apiPatch, apiPost } from '@/lib/api-client';
import type { Alert, AlertFilter } from '@/types';

export const alertApi = {
  getAlerts(filter?: AlertFilter): Promise<Alert[]> {
    return apiGet<Alert[]>('/alerts', {
      priority: filter?.priority,
      entityType: filter?.entityType,
      isRead: filter?.isRead,
      search: filter?.search,
    });
  },

  markAsRead(id: string): Promise<Alert> {
    return apiPatch<Alert>(`/alerts/${id}`, { action: 'markAsRead' });
  },

  dismiss(id: string): Promise<Alert> {
    return apiPatch<Alert>(`/alerts/${id}`, { action: 'dismiss' });
  },

  simulateNewAlert(): Promise<Alert> {
    return apiPost<Alert>('/alerts/simulate');
  },

  getUnreadCount(): Promise<number> {
    return apiGet<{ count: number }>('/alerts/unread-count').then((r) => r.count);
  },
};

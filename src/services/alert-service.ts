import { Alert, AlertFilter } from '@/types';
import { mockAlerts, generateNewAlert } from './mock-data';

let alerts: Alert[] = [...mockAlerts];

export const alertService = {
  getAlerts(filter?: AlertFilter): Promise<Alert[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filtered = [...alerts];

        if (filter?.priority?.length) {
          filtered = filtered.filter((a) =>
            filter.priority!.includes(a.priority),
          );
        }

        if (filter?.entityType?.length) {
          filtered = filtered.filter((a) =>
            filter.entityType!.includes(a.entityType),
          );
        }

        if (filter?.isRead !== undefined) {
          filtered = filtered.filter((a) => a.isRead === filter.isRead);
        }

        if (filter?.search) {
          const s = filter.search.toLowerCase();
          filtered = filtered.filter(
            (a) =>
              a.title.toLowerCase().includes(s) ||
              a.entityName.toLowerCase().includes(s),
          );
        }

        filtered.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        );

        resolve(filtered);
      }, 300);
    });
  },

  markAsRead(id: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        alerts = alerts.map((a) =>
          a.id === id ? { ...a, isRead: true } : a,
        );
        resolve();
      }, 100);
    });
  },

  dismiss(id: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        alerts = alerts.map((a) =>
          a.id === id ? { ...a, isDismissed: true } : a,
        );
        resolve();
      }, 100);
    });
  },

  simulateNewAlert(): Alert {
    const newAlert = generateNewAlert();
    alerts = [newAlert, ...alerts];
    return newAlert;
  },

  getUnreadCount(): number {
    return alerts.filter((a) => !a.isRead && !a.isDismissed).length;
  },
};

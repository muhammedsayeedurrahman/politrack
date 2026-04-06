import { create } from 'zustand';
import { Alert } from '@/types';

interface Notification {
  id: string;
  title: string;
  message: string;
  priority: Alert['priority'];
  timestamp: string;
  isRead: boolean;
  alertId?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isOpen: boolean;
}

interface NotificationActions {
  addNotification: (notification: Omit<Notification, 'id' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismissNotification: (id: string) => void;
  setOpen: (open: boolean) => void;
}

export const useNotificationStore = create<NotificationState & NotificationActions>((set) => ({
  notifications: [],
  unreadCount: 0,
  isOpen: false,

  addNotification: (notification) => set((state) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      isRead: false,
    };
    return {
      notifications: [newNotification, ...state.notifications].slice(0, 50),
      unreadCount: state.unreadCount + 1,
    };
  }),
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n),
    unreadCount: Math.max(0, state.unreadCount - (state.notifications.find(n => n.id === id && !n.isRead) ? 1 : 0)),
  })),
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, isRead: true })),
    unreadCount: 0,
  })),
  dismissNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id),
    unreadCount: state.unreadCount - (state.notifications.find(n => n.id === id && !n.isRead) ? 1 : 0),
  })),
  setOpen: (open) => set({ isOpen: open }),
}));

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { alertService } from '@/services/alert-service';
import { useNotificationStore } from '@/stores/notification-store';
import { Alert } from '@/types';

interface UseWebSocketOptions {
  enabled?: boolean;
  interval?: number;
  onNewAlert?: (alert: Alert) => void;
}

export function useWebSocket({ enabled = true, interval = 20000, onNewAlert }: UseWebSocketOptions = {}) {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const addNotification = useNotificationStore((s) => s.addNotification);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      cleanup();
      return;
    }

    const randomInterval = () => interval + Math.random() * interval * 0.5;

    function tick() {
      const alert = alertService.simulateNewAlert();
      addNotification({
        title: alert.title,
        message: alert.description,
        priority: alert.priority,
        timestamp: alert.timestamp,
        alertId: alert.id,
      });
      onNewAlert?.(alert);

      // Schedule next with random jitter
      cleanup();
      timerRef.current = setTimeout(tick, randomInterval()) as unknown as ReturnType<typeof setInterval>;
    }

    timerRef.current = setTimeout(tick, randomInterval()) as unknown as ReturnType<typeof setInterval>;
    return cleanup;
  }, [enabled, interval, onNewAlert, addNotification, cleanup]);

  return { isConnected: enabled };
}

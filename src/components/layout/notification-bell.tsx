'use client';

import { Bell, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useNotificationStore } from '@/stores/notification-store';
import { PriorityBadge } from '@/components/shared/priority-badge';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, dismissNotification } =
    useNotificationStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" className="relative h-9 w-9" aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`} />}
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-critical px-1 text-[10px] font-bold text-white animate-pulse-critical">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="text-sm font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-auto py-0.5 text-xs" onClick={markAllAsRead}>
              <Check size={12} className="mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        <Separator />
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No notifications yet</p>
          ) : (
            notifications.slice(0, 20).map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  'flex gap-3 px-4 py-3 border-b last:border-0 transition-colors',
                  !notification.isRead && 'bg-accent/50'
                )}
                onClick={() => markAsRead(notification.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && markAsRead(notification.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <PriorityBadge priority={notification.priority} className="scale-90 origin-left" />
                    {!notification.isRead && (
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                    )}
                    {!notification.isRead && (
                      <span className="sr-only">Unread</span>
                    )}
                  </div>
                  <p className="text-sm font-medium truncate">{notification.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissNotification(notification.id);
                  }}
                  className="shrink-0 p-1 rounded hover:bg-muted transition-colors"
                  aria-label="Dismiss notification"
                >
                  <X size={12} className="text-muted-foreground" />
                </button>
              </div>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

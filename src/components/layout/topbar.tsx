'use client';

import { Moon, Sun, Search, Command } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/stores/ui-store';
import { NotificationBell } from './notification-bell';
import { cn } from '@/lib/utils';

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);

  return (
    <header
      className={cn(
        'sticky top-0 z-20 flex h-14 items-center gap-4 border-b bg-card/80 backdrop-blur-sm px-4 sm:px-6 transition-all duration-300',
        'ml-0 md:ml-16',
        !collapsed && 'md:ml-60'
      )}
      role="banner"
      aria-label="Top navigation bar"
    >
      {/* Search trigger */}
      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="flex flex-1 max-w-md items-center gap-2 rounded-lg border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
        aria-label="Open search (Ctrl+K)"
      >
        <Search size={14} />
        <span className="flex-1 text-left">Search entities, cases, alerts...</span>
        <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border bg-background px-1.5 text-[10px] font-mono text-muted-foreground">
          <Command size={10} /> K
        </kbd>
      </button>

      <div className="flex items-center gap-1">
        {/* Notification bell */}
        <NotificationBell />

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="h-9 w-9"
          aria-label="Toggle theme"
        >
          <Sun size={16} className="rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
          <Moon size={16} className="absolute rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
        </Button>

        {/* User avatar placeholder */}
        <div
          className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
          role="img"
          aria-label="User avatar: AT"
        >
          AT
        </div>
      </div>
    </header>
  );
}

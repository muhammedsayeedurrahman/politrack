'use client';

import { MdLightMode, MdDarkMode, MdSearch } from 'react-icons/md';
import { Command } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/stores/ui-store';
import { NotificationBell } from './notification-bell';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { motion as motionTokens } from '@/lib/design-tokens';

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);

  return (
    <header
      className={cn(
        'sticky top-0 z-20 flex h-14 items-center gap-4 glass-header px-4 sm:px-6 transition-all duration-300',
        'ml-0 md:ml-16',
        !collapsed && 'md:ml-60'
      )}
      role="banner"
      aria-label="Top navigation bar"
    >
      {/* Search trigger */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        transition={motionTokens.fast}
        onClick={() => setCommandPaletteOpen(true)}
        className="flex flex-1 max-w-md items-center gap-2 rounded-lg border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
        aria-label="Open search (Ctrl+K)"
      >
        <MdSearch size={14} />
        <span className="flex-1 text-left">Search entities, cases, alerts...</span>
        <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border bg-background px-1.5 text-[10px] font-mono text-muted-foreground">
          <Command size={10} /> K
        </kbd>
      </motion.button>

      <div className="flex items-center gap-1">
        <NotificationBell />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="h-9 w-9 relative"
          aria-label="Toggle theme"
        >
          <MdLightMode size={16} className="rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
          <MdDarkMode size={16} className="absolute rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
        </Button>

        <motion.div
          whileHover={{ scale: 1.1 }}
          transition={motionTokens.fast}
          className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground cursor-pointer"
          role="img"
          aria-label="User avatar: AT"
        >
          AT
        </motion.div>
      </div>
    </header>
  );
}

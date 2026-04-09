'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { MdDashboard, MdSearch, MdHub, MdNotifications, MdSettings, MdShield, MdReportProblem } from 'react-icons/md';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { useUIStore } from '@/stores/ui-store';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { motion as motionTokens } from '@/lib/design-tokens';
import GradientText from '@/components/reactbits/gradient-text';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: MdDashboard },
  { href: '/investigations', label: 'Investigations', icon: MdSearch },
  { href: '/network', label: 'Network', icon: MdHub },
  { href: '/alerts', label: 'Alerts', icon: MdNotifications },
  { href: '/report', label: 'Report', icon: MdReportProblem },
  { href: '/settings', label: 'Settings', icon: MdSettings },
];

export function Sidebar() {
  const pathname = usePathname();
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 flex-col glass-panel text-sidebar-foreground transition-all duration-300',
        'hidden md:flex',
        collapsed ? 'w-16' : 'w-60'
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 px-4">
        <MdShield className="h-7 w-7 shrink-0 text-sidebar-primary" />
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={motionTokens.normal}
              className="flex flex-col overflow-hidden"
            >
              <GradientText
                colors={['#4A90D9', '#38B2AC', '#4A90D9']}
                animationSpeed={6}
                className="text-sm font-bold tracking-tight"
              >
                PolitiTrace
              </GradientText>
              <span className="text-[10px] text-sidebar-foreground/60">
                Corruption Intelligence
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-3" aria-label="Primary">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          if (collapsed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger
                  render={
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
                        'justify-center px-2'
                      )}
                      aria-current={isActive ? 'page' : undefined}
                      aria-label={item.label}
                    />
                  }
                >
                  <Icon size={20} className="shrink-0" aria-hidden="true" />
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            );
          }

          return (
            <motion.div
              key={item.href}
              whileHover={{ x: 2 }}
              transition={motionTokens.fast}
            >
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={20} className="shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary"
                    transition={motionTokens.spring}
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-sidebar-border p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="w-full justify-center text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
      </div>
    </aside>
  );
}

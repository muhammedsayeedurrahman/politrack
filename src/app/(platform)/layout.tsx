'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { SearchCommand } from '@/components/shared/search-command';
import { CopilotPanel } from '@/components/ai/copilot-panel';
import { CopilotToggle } from '@/components/ai/copilot-toggle';
import { AIOnboarding } from '@/components/ai/ai-onboarding';
import { useWebSocket } from '@/lib/hooks/use-websocket';
import { useUIStore } from '@/stores/ui-store';
import { cn } from '@/lib/utils';

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);

  // Simulate real-time alerts
  useWebSocket({ enabled: true, interval: 20000 });

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Topbar />
      <main
        className={cn(
          'transition-all duration-300 pt-0',
          'ml-0 md:ml-16',
          !collapsed && 'md:ml-60'
        )}
        id="main-content"
        role="main"
        aria-label="Main content"
      >
        <div className="p-4 sm:p-6">{children}</div>
      </main>
      <SearchCommand />
      <CopilotPanel />
      <CopilotToggle />
      <AIOnboarding />
    </div>
  );
}

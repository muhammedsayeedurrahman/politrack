'use client';

import { useEffect } from 'react';
import { Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAIStore } from '@/stores/ai-store';
import { cn } from '@/lib/utils';

export function CopilotToggle() {
  const { panelOpen, togglePanel } = useAIStore();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
        e.preventDefault();
        togglePanel();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePanel]);

  return (
    <Button
      onClick={togglePanel}
      size="icon"
      className={cn(
        'fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full shadow-lg transition-all hover:scale-105',
        panelOpen && 'bg-primary/80',
      )}
      aria-label="Toggle AI Copilot (Ctrl+J)"
    >
      <Bot size={20} />
    </Button>
  );
}

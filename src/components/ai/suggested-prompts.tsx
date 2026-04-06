'use client';

import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SuggestedPromptsProps {
  prompts: string[];
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

export function SuggestedPrompts({ prompts, onSelect, disabled }: SuggestedPromptsProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Sparkles size={12} />
        <span>Suggested prompts</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {prompts.map((prompt) => (
          <Button
            key={prompt}
            variant="outline"
            size="sm"
            className="h-auto py-1.5 px-2.5 text-xs whitespace-normal text-left"
            onClick={() => onSelect(prompt)}
            disabled={disabled}
          >
            {prompt}
          </Button>
        ))}
      </div>
    </div>
  );
}

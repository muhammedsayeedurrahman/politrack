'use client';

import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FilterChip {
  id: string;
  label: string;
  category?: string;
}

interface FilterChipsProps {
  chips: FilterChip[];
  onRemove: (id: string) => void;
  onClearAll?: () => void;
  className?: string;
}

export function FilterChips({ chips, onRemove, onClearAll, className }: FilterChipsProps) {
  if (chips.length === 0) return null;
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {chips.map((chip) => (
        <Badge key={chip.id} variant="secondary" className="gap-1 pr-1">
          {chip.category && <span className="text-muted-foreground">{chip.category}:</span>}
          {chip.label}
          <button
            onClick={() => onRemove(chip.id)}
            className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
            aria-label={`Remove filter: ${chip.label}`}
          >
            <X size={12} />
          </button>
        </Badge>
      ))}
      {onClearAll && chips.length > 1 && (
        <Button variant="ghost" size="sm" onClick={onClearAll} className="h-6 text-xs text-muted-foreground">
          Clear all
        </Button>
      )}
    </div>
  );
}

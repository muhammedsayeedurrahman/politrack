'use client';

import { Badge } from '@/components/ui/badge';
import { PRIORITY_CONFIG } from '@/lib/constants';
import { AlertPriority } from '@/types';
import { cn } from '@/lib/utils';

interface PriorityBadgeProps {
  priority: AlertPriority;
  className?: string;
  showDot?: boolean;
}

export function PriorityBadge({ priority, className, showDot = true }: PriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority];
  return (
    <Badge variant="outline" className={cn(config.className, 'gap-1.5 font-medium', className)}>
      {showDot && <span className={cn('h-1.5 w-1.5 rounded-full', config.dotClass)} />}
      {config.label}
    </Badge>
  );
}

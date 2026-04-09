'use client';

import { Badge } from '@/components/ui/badge';
import { PriorityBadge } from '@/components/shared/priority-badge';
import { TimeAgo } from '@/components/shared/time-ago';
import { Case } from '@/types';
import { CASE_STATUS_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { MorphCard } from '@/components/motion';

interface CaseCardProps {
  caseItem: Case;
  isActive: boolean;
  onClick: () => void;
}

export function CaseCard({ caseItem, isActive, onClick }: CaseCardProps) {
  const statusConfig = CASE_STATUS_CONFIG[caseItem.status];
  return (
    <MorphCard
      className={cn(
        'p-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        isActive && 'ring-2 ring-primary bg-primary/5'
      )}
      onClick={onClick}
    >
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
        aria-label={`Case: ${caseItem.title}, priority: ${caseItem.priority}, status: ${statusConfig.label}`}
        aria-current={isActive ? 'true' : undefined}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <PriorityBadge priority={caseItem.priority} className="scale-90 origin-left" />
          <Badge variant="outline" className={cn('text-[10px]', statusConfig.className)}>
            {statusConfig.label}
          </Badge>
        </div>
        <h4 className="text-sm font-semibold line-clamp-2 mb-1">{caseItem.title}</h4>
        <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{caseItem.summary}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{caseItem.assignee}</span>
          <TimeAgo timestamp={caseItem.updatedAt} />
        </div>
      </div>
    </MorphCard>
  );
}

'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useInvestigationStore } from '@/stores/investigation-store';
import { Case } from '@/types';
import { TimeAgo } from '@/components/shared/time-ago';
import { ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

const ACTIVITY_ICONS: Record<string, string> = {
  created: 'bg-info',
  updated: 'bg-primary',
  escalated: 'bg-critical',
  comment: 'bg-muted-foreground',
  evidence_added: 'bg-low',
  status_changed: 'bg-medium',
};

interface ActivityLogProps {
  caseData: Case | null;
}

export function ActivityLog({ caseData }: ActivityLogProps) {
  const { activityLogExpanded, toggleActivityLog } = useInvestigationStore();

  if (!caseData) return null;

  return (
    <div className={cn('border-t transition-all', activityLogExpanded ? 'h-48' : 'h-10')}>
      <button onClick={toggleActivityLog} className="flex items-center justify-between w-full px-4 h-10 text-sm font-medium hover:bg-muted/50 transition-colors">
        <span className="flex items-center gap-2">
          <MessageSquare size={14} />
          Activity Log ({caseData.activities.length})
        </span>
        {activityLogExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>
      {activityLogExpanded && (
        <ScrollArea className="h-[calc(100%-2.5rem)]">
          <div className="px-4 pb-3 space-y-2">
            {caseData.activities
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map(activity => (
                <div key={activity.id} className="flex items-start gap-3 py-1.5">
                  <div className={cn('h-2 w-2 rounded-full mt-1.5 shrink-0', ACTIVITY_ICONS[activity.type] || 'bg-muted-foreground')} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{activity.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{activity.user}</span>
                      <TimeAgo timestamp={activity.timestamp} />
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] capitalize shrink-0">
                    {activity.type.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

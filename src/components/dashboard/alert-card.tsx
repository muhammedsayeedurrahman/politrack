'use client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PriorityBadge } from '@/components/shared/priority-badge';
import { EntityIcon } from '@/components/shared/entity-icon';
import { RiskIndicator } from '@/components/shared/risk-indicator';
import { TimeAgo } from '@/components/shared/time-ago';
import { Search, X, Clock } from 'lucide-react';
import { Alert } from '@/types';
import { cn } from '@/lib/utils';

interface AlertCardProps {
  alert: Alert;
  onInvestigate?: (id: string) => void;
  onDismiss?: (id: string) => void;
}

const BORDER_COLORS = {
  critical: 'border-l-critical',
  high: 'border-l-high',
  medium: 'border-l-medium',
  low: 'border-l-low',
};

export function AlertCard({ alert, onInvestigate, onDismiss }: AlertCardProps) {
  return (
    <Card className={cn('border-l-4 hover:shadow-md transition-shadow', BORDER_COLORS[alert.priority], alert.isRead && 'opacity-70')}>
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <PriorityBadge priority={alert.priority} />
            <TimeAgo timestamp={alert.timestamp} />
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold line-clamp-1">{alert.title}</h4>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{alert.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <EntityIcon type={alert.entityType} size={14} className="text-muted-foreground" />
          <span className="text-sm font-medium truncate">{alert.entityName}</span>
        </div>
        <RiskIndicator score={alert.riskScore} showLabel size="sm" />
        <div className="flex gap-2 pt-1">
          <Button size="sm" variant="default" className="h-7 text-xs flex-1" onClick={() => onInvestigate?.(alert.id)}>
            <Search size={12} className="mr-1" /> Investigate
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onDismiss?.(alert.id)} aria-label="Dismiss alert">
            <X size={12} aria-hidden="true" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

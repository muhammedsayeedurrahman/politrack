'use client';

import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowUp, Search, Eye, XCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TriageRecommendation = 'escalate' | 'investigate' | 'monitor' | 'auto-dismiss';

interface TriageBadgeProps {
  recommendation: TriageRecommendation;
  confidence: number;
  reason?: string;
  className?: string;
}

const TRIAGE_CONFIG: Record<TriageRecommendation, {
  label: string;
  icon: typeof ArrowUp;
  className: string;
}> = {
  escalate: {
    label: 'Escalate',
    icon: ArrowUp,
    className: 'bg-critical/10 text-critical border-critical/30',
  },
  investigate: {
    label: 'Investigate',
    icon: Search,
    className: 'bg-high/10 text-high border-high/30',
  },
  monitor: {
    label: 'Monitor',
    icon: Eye,
    className: 'bg-medium/10 text-medium border-medium/30',
  },
  'auto-dismiss': {
    label: 'Auto-dismiss',
    icon: XCircle,
    className: 'bg-muted text-muted-foreground border-muted',
  },
};

export function TriageBadge({ recommendation, confidence, reason, className }: TriageBadgeProps) {
  const config = TRIAGE_CONFIG[recommendation];
  const Icon = config.icon;

  const badge = (
    <Badge
      variant="outline"
      className={cn(
        'gap-1 text-[10px] font-medium border',
        config.className,
        className,
      )}
    >
      <Sparkles size={8} className="opacity-60" />
      <Icon size={10} />
      {config.label}
      <span className="opacity-60">{confidence}%</span>
    </Badge>
  );

  if (!reason) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger render={<span />}>{badge}</TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-64 text-xs">
          <p className="font-medium mb-0.5">AI Triage: {config.label}</p>
          <p className="text-muted-foreground">{reason}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

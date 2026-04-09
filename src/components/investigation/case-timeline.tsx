'use client';

import { useMemo } from 'react';
import { Case, Activity, Evidence } from '@/types';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FadeIn } from '@/components/motion';
import {
  AlertTriangle,
  FileText,
  MessageSquare,
  Receipt,
  BarChart3,
  ArrowUpCircle,
  Clock,
  PlusCircle,
  RefreshCw,
  Bot,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineEntry {
  id: string;
  date: string;
  title: string;
  subtitle: string;
  detail: string;
  kind: 'escalation' | 'evidence' | 'status' | 'comment' | 'created' | 'updated';
  source: 'activity' | 'evidence';
  relevanceScore: number;
}

const KIND_CONFIG: Record<
  TimelineEntry['kind'],
  { color: string; dotColor: string; icon: React.ElementType }
> = {
  escalation: { color: 'border-red-500/40 bg-red-500/5', dotColor: 'bg-red-500', icon: AlertTriangle },
  evidence: { color: 'border-emerald-500/40 bg-emerald-500/5', dotColor: 'bg-emerald-500', icon: PlusCircle },
  status: { color: 'border-blue-500/40 bg-blue-500/5', dotColor: 'bg-blue-500', icon: RefreshCw },
  comment: { color: 'border-slate-400/40 bg-slate-400/5', dotColor: 'bg-slate-400', icon: MessageSquare },
  created: { color: 'border-purple-500/40 bg-purple-500/5', dotColor: 'bg-purple-500', icon: Clock },
  updated: { color: 'border-amber-500/40 bg-amber-500/5', dotColor: 'bg-amber-500', icon: RefreshCw },
};

const EVIDENCE_ICONS: Record<Evidence['type'], React.ElementType> = {
  document: FileText,
  transaction: Receipt,
  communication: MessageSquare,
  report: BarChart3,
};

function mapActivityKind(type: Activity['type']): TimelineEntry['kind'] {
  switch (type) {
    case 'escalated':
      return 'escalation';
    case 'evidence_added':
      return 'evidence';
    case 'status_changed':
      return 'status';
    case 'comment':
      return 'comment';
    case 'created':
      return 'created';
    default:
      return 'updated';
  }
}

function seededRelevance(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  }
  return 60 + Math.abs(hash % 35);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function timeAgoShort(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface CaseTimelineProps {
  caseData: Case;
}

export function CaseTimeline({ caseData }: CaseTimelineProps) {
  const entries = useMemo(() => {
    const items: TimelineEntry[] = [];

    for (const activity of caseData.activities) {
      items.push({
        id: activity.id,
        date: activity.timestamp,
        title: activity.description,
        subtitle: `By ${activity.user}`,
        detail: `Activity type: ${activity.type.replace('_', ' ')}`,
        kind: mapActivityKind(activity.type),
        source: 'activity',
        relevanceScore: seededRelevance(activity.id),
      });
    }

    for (const evidence of caseData.evidence) {
      items.push({
        id: evidence.id,
        date: evidence.timestamp,
        title: evidence.title,
        subtitle: `Source: ${evidence.source}`,
        detail: evidence.description,
        kind: 'evidence',
        source: 'evidence',
        relevanceScore: seededRelevance(evidence.id),
      });
    }

    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return items;
  }, [caseData.activities, caseData.evidence]);

  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        No timeline events available
      </div>
    );
  }

  return (
    <ScrollArea className="h-full" aria-label="Interactive case timeline">
      <div className="p-4 pb-8">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <Bot size={16} className="text-primary" />
          <span className="text-xs text-muted-foreground">
            AI-curated timeline &middot; {entries.length} events &middot; Evidence + Activities merged
          </span>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border" aria-hidden="true" />

          <div className="space-y-4" role="list" aria-label="Timeline events">
            {entries.map((entry, index) => {
              const config = KIND_CONFIG[entry.kind];
              const Icon = entry.source === 'evidence'
                ? EVIDENCE_ICONS[(caseData.evidence.find(e => e.id === entry.id)?.type) ?? 'document']
                : config.icon;
              const isLeft = index % 2 === 0;

              return (
                <FadeIn key={entry.id} direction="up" delay={index * 0.04}>
                  <div className="relative pl-12" role="listitem">
                    {/* Dot */}
                    <div
                      className={cn(
                        'absolute left-[13px] top-3 h-3.5 w-3.5 rounded-full border-2 border-background z-10',
                        config.dotColor,
                      )}
                      aria-hidden="true"
                    />

                    {/* Card */}
                    <div
                      className={cn(
                        'rounded-xl border p-3 transition-all hover:shadow-md',
                        'glass-card !rounded-xl',
                        config.color,
                      )}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="p-1.5 rounded-lg bg-background/60 shrink-0">
                          <Icon size={14} className="text-muted-foreground" aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-medium leading-tight">{entry.title}</h4>
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-[9px] capitalize shrink-0',
                                entry.kind === 'escalation' && 'border-red-500/50 text-red-600',
                                entry.kind === 'evidence' && 'border-emerald-500/50 text-emerald-600',
                                entry.kind === 'status' && 'border-blue-500/50 text-blue-600',
                              )}
                            >
                              {entry.source === 'evidence' ? 'evidence' : entry.kind}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{entry.detail}</p>
                          <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                            <span>{entry.subtitle}</span>
                            <span>&middot;</span>
                            <span title={formatDate(entry.date)}>{timeAgoShort(entry.date)}</span>
                            <span className="ml-auto flex items-center gap-1 text-primary/70">
                              <Bot size={10} />
                              Relevance: {entry.relevanceScore}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}

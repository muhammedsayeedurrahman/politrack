'use client';

import { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useInvestigationStore } from '@/stores/investigation-store';
import { Case, Activity } from '@/types';
import { TimeAgo } from '@/components/shared/time-ago';
import { ChevronDown, ChevronUp, MessageSquare, Bot, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

const ACTIVITY_ICONS: Record<string, string> = {
  created: 'bg-info',
  updated: 'bg-primary',
  escalated: 'bg-critical',
  comment: 'bg-muted-foreground',
  evidence_added: 'bg-low',
  status_changed: 'bg-medium',
  ai_action: 'bg-primary',
};

const AI_ACTIVITIES: Omit<Activity, 'id' | 'timestamp'>[] = [
  {
    type: 'updated',
    description: 'AI Triage Agent auto-classified 3 new alerts related to this case',
    user: 'Triage Agent',
  },
  {
    type: 'updated',
    description: 'Network Analyst detected new connection: Entity X → Entity Y via shell company',
    user: 'Network Agent',
  },
  {
    type: 'updated',
    description: 'Compliance Agent flagged Entity Z for sanctions list review',
    user: 'Compliance Agent',
  },
  {
    type: 'evidence_added',
    description: 'Investigation Agent attached 2 financial transaction records as evidence',
    user: 'Investigation Agent',
  },
  {
    type: 'updated',
    description: 'Risk scoring updated: 3 entities moved to critical risk range',
    user: 'Risk Agent',
  },
  {
    type: 'comment',
    description: 'Pattern analysis complete: bid clustering anomaly confidence increased to 91%',
    user: 'Report Agent',
  },
];

interface ActivityLogProps {
  caseData: Case | null;
}

export function ActivityLog({ caseData }: ActivityLogProps) {
  const { activityLogExpanded, toggleActivityLog } = useInvestigationStore();
  const [simulatedActivities, setSimulatedActivities] = useState<Activity[]>([]);
  const [isAgentThinking, setIsAgentThinking] = useState(false);
  const aiIndexRef = useRef(0);

  // Simulate real-time AI activity entries
  useEffect(() => {
    if (!caseData) return;

    const interval = setInterval(() => {
      // Show thinking indicator
      setIsAgentThinking(true);

      // After a brief "thinking" period, add the activity
      setTimeout(() => {
        const template = AI_ACTIVITIES[aiIndexRef.current % AI_ACTIVITIES.length];
        aiIndexRef.current += 1;

        const newActivity: Activity = {
          id: `ai-sim-${Date.now()}`,
          type: template.type,
          description: template.description,
          user: template.user,
          timestamp: new Date().toISOString(),
        };

        setSimulatedActivities((prev) => [newActivity, ...prev].slice(0, 10));
        setIsAgentThinking(false);
      }, 2000);
    }, 18000); // Every 18 seconds

    return () => clearInterval(interval);
  }, [caseData]);

  if (!caseData) return null;

  const allActivities = [
    ...simulatedActivities,
    ...caseData.activities,
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const isAiEntry = (user: string) =>
    user.includes('Agent') || user.includes('AI');

  return (
    <div className={cn('border-t transition-all', activityLogExpanded ? 'h-48' : 'h-10')}>
      <button onClick={toggleActivityLog} className="flex items-center justify-between w-full px-4 h-10 text-sm font-medium hover:bg-muted/50 transition-colors">
        <span className="flex items-center gap-2">
          <MessageSquare size={14} />
          Activity Log ({allActivities.length})
          {simulatedActivities.length > 0 && (
            <Badge variant="secondary" className="text-[9px] px-1 py-0 gap-0.5">
              <Bot size={8} /> {simulatedActivities.length} AI
            </Badge>
          )}
        </span>
        <div className="flex items-center gap-2">
          {isAgentThinking && (
            <span className="flex items-center gap-1 text-[11px] text-primary animate-pulse">
              <Loader2 size={10} className="animate-spin" />
              AI Agent is analyzing...
            </span>
          )}
          {activityLogExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </div>
      </button>
      {activityLogExpanded && (
        <ScrollArea className="h-[calc(100%-2.5rem)]">
          <div className="px-4 pb-3 space-y-2">
            <AnimatePresence initial={false}>
              {allActivities.map((activity) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: -12, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  className="flex items-start gap-3 py-1.5"
                >
                  <div className="flex items-center gap-1.5 shrink-0 mt-1.5">
                    {isAiEntry(activity.user) ? (
                      <Bot size={10} className="text-primary" />
                    ) : (
                      <div className={cn('h-2 w-2 rounded-full', ACTIVITY_ICONS[activity.type] || 'bg-muted-foreground')} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{activity.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className={cn(isAiEntry(activity.user) && 'text-primary font-medium')}>
                        {activity.user}
                      </span>
                      <TimeAgo timestamp={activity.timestamp} />
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[10px] capitalize shrink-0',
                      isAiEntry(activity.user) && 'border-primary/30 text-primary',
                    )}
                  >
                    {isAiEntry(activity.user) ? 'AI' : activity.type.replace('_', ' ')}
                  </Badge>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

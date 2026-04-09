'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { FadeIn, StaggerList, StaggerItem } from '@/components/motion';
import { useAutomationStore, type AutomationRule, type RuleAction } from '@/stores/automation-store';
import {
  Bot,
  ChevronDown,
  ChevronUp,
  Zap,
  ArrowUpCircle,
  UserPlus,
  Bell,
  Tag,
  XCircle,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ACTION_CONFIG: Record<RuleAction, { label: string; icon: React.ElementType; color: string }> = {
  escalate: { label: 'Escalate', icon: ArrowUpCircle, color: 'text-red-500' },
  assign: { label: 'Assign', icon: UserPlus, color: 'text-blue-500' },
  notify: { label: 'Notify', icon: Bell, color: 'text-amber-500' },
  tag: { label: 'Tag', icon: Tag, color: 'text-purple-500' },
  auto_dismiss: { label: 'Auto-dismiss', icon: XCircle, color: 'text-slate-500' },
};

export function AutomationRules() {
  const [expanded, setExpanded] = useState(true);
  const { rules, toggleRule, removeRule } = useAutomationStore();

  const activeCount = rules.filter((r) => r.enabled).length;
  const totalMatches = rules.reduce((sum, r) => sum + r.matchCount, 0);

  return (
    <Card className="glass-card !rounded-2xl">
      <CardHeader className="pb-0">
        <button
          onClick={() => setExpanded((e) => !e)}
          className="flex items-center justify-between w-full"
        >
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Zap size={16} className="text-primary" />
            Automation Rules
            <Badge variant="secondary" className="text-[10px] ml-1">
              {activeCount} active
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">
              {totalMatches} matches this week
            </span>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </button>

        {/* Agent attribution */}
        <div className="flex items-center gap-1.5 mt-2">
          <Sparkles size={10} className="text-primary" />
          <span className="text-[10px] text-muted-foreground">
            Suggested by Triage Agent based on alert patterns
          </span>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-4">
          <StaggerList className="space-y-3">
            {rules.map((rule) => (
              <StaggerItem key={rule.id}>
                <RuleCard rule={rule} onToggle={toggleRule} onRemove={removeRule} />
              </StaggerItem>
            ))}
          </StaggerList>
        </CardContent>
      )}
    </Card>
  );
}

function RuleCard({
  rule,
  onToggle,
  onRemove,
}: {
  rule: AutomationRule;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const actionConfig = ACTION_CONFIG[rule.action];
  const ActionIcon = actionConfig.icon;

  return (
    <div
      className={cn(
        'rounded-xl border p-3 transition-all',
        rule.enabled
          ? 'bg-primary/[0.02] border-primary/20'
          : 'bg-muted/20 border-muted opacity-70',
      )}
    >
      <div className="flex items-start gap-3">
        <div className="pt-0.5">
          <Switch
            checked={rule.enabled}
            onCheckedChange={() => onToggle(rule.id)}
            aria-label={`Toggle rule: ${rule.name}`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium">{rule.name}</h4>
            {rule.suggestedBy === 'ai' && (
              <Badge variant="outline" className="text-[8px] gap-0.5 px-1">
                <Bot size={8} /> AI
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {rule.description}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              <ActionIcon size={12} className={actionConfig.color} />
              <span className="text-[11px] font-medium">{actionConfig.label}</span>
              {rule.actionValue && (
                <Badge variant="secondary" className="text-[9px] ml-0.5">
                  {rule.actionValue}
                </Badge>
              )}
            </div>
            <Separator orientation="vertical" className="h-3" />
            <span className="text-[11px] text-muted-foreground">
              {rule.matchCount} matches
            </span>
            <Separator orientation="vertical" className="h-3" />
            <span className="text-[11px] text-muted-foreground">
              {rule.conditions.length} condition{rule.conditions.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
          onClick={() => onRemove(rule.id)}
          aria-label={`Remove rule: ${rule.name}`}
        >
          <Trash2 size={12} />
        </Button>
      </div>
    </div>
  );
}

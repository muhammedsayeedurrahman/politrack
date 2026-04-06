'use client';

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, Layers, AlertTriangle } from 'lucide-react';
import { generateAlertInsights, type AIAlertInsights } from '@/services/ai-analysis-service';
import type { Alert } from '@/types';
import { cn } from '@/lib/utils';

interface AlertInsightsProps {
  alerts: Alert[];
}

const SEVERITY_COLORS = {
  critical: 'text-critical',
  high: 'text-high',
  medium: 'text-medium',
};

export function AlertInsights({ alerts }: AlertInsightsProps) {
  const insights: AIAlertInsights = useMemo(
    () => generateAlertInsights(alerts),
    [alerts],
  );

  return (
    <div className="space-y-3">
      {/* What is this */}
      <div className="rounded-lg bg-muted/40 px-3 py-2 flex items-start gap-2">
        <Sparkles size={14} className="text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground">AI Alert Intelligence:</strong> The AI analyzed {insights.totalAnalyzed} alerts and grouped related ones into clusters. Each alert in the table below also has a colored <strong className="text-foreground">AI Triage</strong> badge telling you whether to Escalate (red), Investigate (orange), Monitor (yellow), or Auto-dismiss (gray). Hover over any badge to see why.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {/* AI Summary Card */}
      <Card size="sm">
        <CardContent className="pt-3">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-primary" />
            <span className="text-xs font-semibold">AI Analysis</span>
          </div>
          <p className="text-sm leading-relaxed">{insights.trendSummary}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-[10px]">
              {insights.totalAnalyzed} analyzed
            </Badge>
            <Badge variant="outline" className="text-[10px] text-critical border-critical/30">
              {insights.escalationCount} to escalate
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Clusters Card */}
      <Card size="sm">
        <CardContent className="pt-3">
          <div className="flex items-center gap-2 mb-2">
            <Layers size={14} className="text-primary" />
            <span className="text-xs font-semibold">Alert Clusters</span>
          </div>
          <div className="space-y-2">
            {insights.clusters.slice(0, 3).map((cluster) => (
              <div key={cluster.id} className="flex items-start gap-2">
                <AlertTriangle
                  size={12}
                  className={cn('mt-0.5 shrink-0', SEVERITY_COLORS[cluster.severity])}
                />
                <div>
                  <p className="text-xs font-medium">{cluster.label}</p>
                  <p className="text-[10px] text-muted-foreground">{cluster.pattern}</p>
                </div>
              </div>
            ))}
            {insights.clusters.length === 0 && (
              <p className="text-xs text-muted-foreground">No significant clusters detected</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Pattern Card */}
      <Card size="sm">
        <CardContent className="pt-3">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-primary" />
            <span className="text-xs font-semibold">Top Pattern</span>
          </div>
          <p className="text-lg font-bold">{insights.topPattern}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Most frequent alert category across all monitored entities
          </p>
          <div className="mt-2">
            <Badge variant="secondary" className="text-[10px]">
              AI-detected trend
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
    </div>
  );
}

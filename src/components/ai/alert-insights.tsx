'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, Layers, AlertTriangle, Shield, Wrench, Zap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { aiAnalysisApi } from '@/services/api/ai-analysis-api';
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
  const { data: insights, isLoading } = useQuery({
    queryKey: ['ai', 'alert-insights', alerts.map((a) => a.id).join(',')],
    queryFn: () => aiAnalysisApi.generateAlertInsights(alerts),
    enabled: alerts.length > 0,
  });

  if (isLoading || !insights) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Agent attribution */}
      <div className="rounded-lg bg-primary/5 border border-primary/15 px-3 py-2 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-primary shrink-0" />
            <p className="text-xs font-semibold text-foreground">AI Alert Intelligence</p>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield size={10} className="text-primary" />
            <span className="text-[9px] font-semibold text-primary uppercase tracking-wider">Triage Agent</span>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          The Triage Agent analyzed {insights.totalAnalyzed} alerts using <strong className="text-foreground">query_alerts</strong>, <strong className="text-foreground">calculate_entity_risk</strong>, and <strong className="text-foreground">count_alerts</strong> tools. Each alert has a colored AI Triage badge: Escalate (red), Investigate (orange), Monitor (yellow), or Auto-dismiss (gray).
        </p>
        <div className="flex flex-wrap gap-1">
          {['query_alerts', 'count_alerts', 'calculate_entity_risk', 'get_alert_details'].map((tool) => (
            <span key={tool} className="inline-flex items-center gap-0.5 rounded bg-muted px-1.5 py-0.5 text-[8px] font-mono text-muted-foreground">
              <Wrench size={7} />
              {tool}
            </span>
          ))}
        </div>
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

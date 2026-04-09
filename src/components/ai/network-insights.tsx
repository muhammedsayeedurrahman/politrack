'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { aiAnalysisApi } from '@/services/api/ai-analysis-api';
import type { AINetworkPattern } from '@/services/ai-analysis-service';
import { useGraphStore } from '@/stores/graph-store';
import type { GraphNode, GraphEdge } from '@/types';
import { Sparkles, Network, Link2, Hexagon, HelpCircle, Shield, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NetworkInsightsProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

const PATTERN_ICONS = {
  hub: Network,
  cluster: Hexagon,
  chain: Link2,
  anomaly: HelpCircle,
};

const SEVERITY_STYLES = {
  critical: 'border-critical/30 bg-critical/5',
  high: 'border-high/30 bg-high/5',
  medium: 'border-medium/30 bg-medium/5',
};

const SEVERITY_DOT = {
  critical: 'bg-critical',
  high: 'bg-high',
  medium: 'bg-medium',
};

export function NetworkInsights({ nodes, edges }: NetworkInsightsProps) {
  const selectNode = useGraphStore((s) => s.selectNode);

  const { data: patterns = [] } = useQuery({
    queryKey: ['ai', 'network-patterns', nodes.length, edges.length],
    queryFn: () => aiAnalysisApi.detectNetworkPatterns(nodes, edges),
    enabled: nodes.length > 0,
  });

  if (patterns.length === 0) return null;

  return (
    <Card className="w-72 shrink-0 flex flex-col max-h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Sparkles size={14} className="text-primary" />
          AI Pattern Detection
        </CardTitle>
        <p className="text-[10px] text-muted-foreground">
          {patterns.length} patterns detected across {nodes.length} entities
        </p>
        <div className="rounded-md bg-primary/5 border border-primary/15 px-2.5 py-1.5 mt-1 space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Shield size={9} className="text-primary" />
            <span className="text-[9px] font-semibold text-primary uppercase tracking-wider">Network Analyst Agent</span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Scans all connections to detect hub entities, high-risk clusters, and suspicious official-corporate links.
          </p>
          <div className="flex flex-wrap gap-1">
            {['detect_communities', 'calculate_centrality', 'detect_hubs', 'detect_conflict_of_interest'].map((tool) => (
              <span key={tool} className="inline-flex items-center gap-0.5 rounded bg-muted px-1 py-0.5 text-[8px] font-mono text-muted-foreground">
                <Wrench size={7} />
                {tool}
              </span>
            ))}
          </div>
        </div>
      </CardHeader>
      <ScrollArea className="flex-1">
        <CardContent className="space-y-3">
          {patterns.map((pattern) => {
            const Icon = PATTERN_ICONS[pattern.type];
            return (
              <div
                key={pattern.id}
                className={cn(
                  'rounded-lg border p-3 space-y-2',
                  SEVERITY_STYLES[pattern.severity],
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon size={14} />
                    <span className="text-xs font-semibold">{pattern.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={cn('h-1.5 w-1.5 rounded-full', SEVERITY_DOT[pattern.severity])} />
                    <Badge variant="outline" className="text-[8px]">
                      {pattern.confidence}%
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {pattern.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {pattern.entityIds.slice(0, 4).map((id) => {
                    const node = nodes.find(n => n.data.id === id);
                    return (
                      <Button
                        key={id}
                        variant="ghost"
                        size="xs"
                        className="h-auto py-0.5 px-1.5 text-[10px]"
                        onClick={() => selectNode(id)}
                      >
                        {node?.data.label.split(' ').slice(0, 2).join(' ') ?? id}
                      </Button>
                    );
                  })}
                  {pattern.entityIds.length > 4 && (
                    <span className="text-[10px] text-muted-foreground py-0.5">
                      +{pattern.entityIds.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </ScrollArea>
    </Card>
  );
}

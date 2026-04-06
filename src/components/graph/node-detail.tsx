'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { EntityIcon } from '@/components/shared/entity-icon';
import { RiskIndicator } from '@/components/shared/risk-indicator';
import { useGraphStore } from '@/stores/graph-store';
import { GraphNode, GraphEdge } from '@/types';
import { getRiskLevel, ENTITY_TYPE_CONFIG } from '@/lib/constants';
import { explainNode } from '@/services/ai-analysis-service';
import { X, ExternalLink, Sparkles, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NodeDetailProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function NodeDetail({ nodes, edges }: NodeDetailProps) {
  const { selectedNodeId, selectNode } = useGraphStore();

  const node = useMemo(() => nodes.find(n => n.data.id === selectedNodeId), [nodes, selectedNodeId]);

  const connections = useMemo(() => {
    if (!selectedNodeId) return [];
    return edges
      .filter(e => e.data.source === selectedNodeId || e.data.target === selectedNodeId)
      .map(e => {
        const targetId = e.data.source === selectedNodeId ? e.data.target : e.data.source;
        const targetNode = nodes.find(n => n.data.id === targetId);
        return { edge: e, target: targetNode };
      })
      .filter(c => c.target);
  }, [edges, nodes, selectedNodeId]);

  const aiExplanation = useMemo(() => {
    if (!selectedNodeId) return null;
    return explainNode(selectedNodeId, nodes, edges);
  }, [selectedNodeId, nodes, edges]);

  if (!node || !selectedNodeId) return null;

  const riskLevel = getRiskLevel(node.data.riskScore);

  return (
    <Card className="w-80 shrink-0 flex flex-col max-h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Entity Detail</CardTitle>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => selectNode(null)}>
            <X size={14} />
          </Button>
        </div>
      </CardHeader>
      <ScrollArea className="flex-1">
        <CardContent className="space-y-4">
          {/* Profile */}
          <div className="flex items-center gap-3">
            <div className={cn('p-3 rounded-lg', `bg-${riskLevel}/10`)}>
              <EntityIcon type={node.data.type} size={24} className={`text-${riskLevel}`} />
            </div>
            <div>
              <h3 className="font-semibold">{node.data.label}</h3>
              <p className="text-xs text-muted-foreground">{ENTITY_TYPE_CONFIG[node.data.type].label}</p>
            </div>
          </div>

          {/* Risk Score */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">Risk Score</span>
              <span className={cn('text-lg font-bold', `text-${riskLevel}`)}>{node.data.riskScore}</span>
            </div>
            <RiskIndicator score={node.data.riskScore} size="lg" />
          </div>

          <Separator />

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <p className="text-xl font-bold">{node.data.connectionCount}</p>
              <p className="text-xs text-muted-foreground">Connections</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <p className="text-xl font-bold">{connections.length}</p>
              <p className="text-xs text-muted-foreground">Direct Links</p>
            </div>
          </div>

          <Separator />

          {/* AI Explain Section */}
          {aiExplanation && (
            <>
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles size={10} className="text-primary" />
                  AI Analysis
                </h4>
                <div
                  className="text-xs leading-relaxed [&_strong]:font-semibold"
                  dangerouslySetInnerHTML={{
                    __html: aiExplanation.summary
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  }}
                />
                <p className="text-xs leading-relaxed mt-2 text-muted-foreground">
                  {aiExplanation.riskNarrative}
                </p>
                {aiExplanation.relatedPatterns.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                      <TrendingUp size={9} />
                      Related Patterns
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {aiExplanation.relatedPatterns.map((pattern) => (
                        <Badge key={pattern} variant="secondary" className="text-[9px]">
                          {pattern}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Separator />
            </>
          )}

          {/* Connections */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Connections</h4>
            <div className="space-y-2">
              {connections.slice(0, 10).map(({ edge, target }) => (
                <div key={edge.data.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => target && selectNode(target.data.id)}>
                  <EntityIcon type={target!.data.type} size={14} className="text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{target!.data.label}</p>
                    <p className="text-xs text-muted-foreground capitalize">{edge.data.type} · {Math.round(edge.data.confidence * 100)}% confidence</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {target!.data.riskScore}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <Button className="w-full mt-4" size="sm">
            <ExternalLink size={14} className="mr-1" /> Open Investigation
          </Button>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}

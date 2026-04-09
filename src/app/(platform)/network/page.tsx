'use client';

import { useState, useEffect } from 'react';
import { NetworkGraph } from '@/components/graph/network-graph';
import { GraphControls } from '@/components/graph/graph-controls';
import { NodeDetail } from '@/components/graph/node-detail';
import { NetworkInsights } from '@/components/ai/network-insights';
import { useGraphStore } from '@/stores/graph-store';
import { GraphNode, GraphEdge } from '@/types';
import { graphApi } from '@/services/api/graph-api';
import { FadeIn } from '@/components/motion';
import BlurText from '@/components/reactbits/blur-text';

export default function NetworkPage() {
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; edges: GraphEdge[] }>({ nodes: [], edges: [] });
  const selectedNodeId = useGraphStore((s) => s.selectedNodeId);

  useEffect(() => {
    graphApi.getGraphData().then(setGraphData);
  }, []);

  return (
    <div className="space-y-4">
      <FadeIn direction="none">
        <div>
          <BlurText
            text="Network Graph"
            className="text-2xl font-bold tracking-tight"
            delay={80}
            animateBy="letters"
          />
          <p className="text-sm text-muted-foreground">
            Explore entity relationships and corruption networks — {graphData.nodes.length} entities, {graphData.edges.length} connections
          </p>
        </div>
      </FadeIn>
      <FadeIn direction="up" delay={0.1}>
        <div className="flex gap-4 h-[calc(100vh-12rem)]">
          <GraphControls />
          <div className="flex-1">
            <NetworkGraph nodes={graphData.nodes} edges={graphData.edges} />
          </div>
          {selectedNodeId ? (
            <NodeDetail nodes={graphData.nodes} edges={graphData.edges} />
          ) : (
            graphData.nodes.length > 0 && (
              <NetworkInsights nodes={graphData.nodes} edges={graphData.edges} />
            )
          )}
        </div>
      </FadeIn>
    </div>
  );
}

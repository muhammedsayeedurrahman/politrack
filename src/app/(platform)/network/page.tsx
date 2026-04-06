'use client';

import { useState, useEffect } from 'react';
import { NetworkGraph } from '@/components/graph/network-graph';
import { GraphControls } from '@/components/graph/graph-controls';
import { NodeDetail } from '@/components/graph/node-detail';
import { NetworkInsights } from '@/components/ai/network-insights';
import { useGraphStore } from '@/stores/graph-store';
import { GraphNode, GraphEdge } from '@/types';
import { graphService } from '@/services/graph-service';

export default function NetworkPage() {
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; edges: GraphEdge[] }>({ nodes: [], edges: [] });
  const selectedNodeId = useGraphStore((s) => s.selectedNodeId);

  useEffect(() => {
    graphService.getGraphData().then(setGraphData);
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Network Graph</h1>
        <p className="text-sm text-muted-foreground">
          Explore entity relationships and corruption networks — {graphData.nodes.length} entities, {graphData.edges.length} connections
        </p>
      </div>
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
    </div>
  );
}

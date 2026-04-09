import { apiGet } from '@/lib/api-client';
import type { GraphNode, GraphEdge, GraphFilter } from '@/types';

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export const graphApi = {
  getGraphData(filter?: GraphFilter): Promise<GraphData> {
    return apiGet<GraphData>('/graph', filter ? {
      entityTypes: filter.entityTypes,
      edgeTypes: filter.edgeTypes,
      minRiskScore: filter.minRiskScore,
      maxRiskScore: filter.maxRiskScore,
      search: filter.search,
    } : undefined);
  },

  getNodeConnections(id: string, depth?: number): Promise<GraphData> {
    return apiGet<GraphData>(`/graph/nodes/${id}/connections`, { depth });
  },

  findPath(source: string, target: string): Promise<GraphData | null> {
    return apiGet<GraphData | null>('/graph/path', { source, target });
  },

  getNodeById(id: string): Promise<GraphNode | null> {
    return apiGet<GraphNode>(`/graph/nodes/${id}`);
  },

  getEdgesByNode(nodeId: string): Promise<GraphEdge[]> {
    return apiGet<GraphEdge[]>(`/graph/edges/${nodeId}`);
  },
};

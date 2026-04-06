import { GraphNode, GraphEdge, EntityType, GraphFilter } from '@/types';
import { mockGraphNodes, mockGraphEdges } from './mock-data';

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

const allNodes: GraphNode[] = [...mockGraphNodes];
const allEdges: GraphEdge[] = [...mockGraphEdges];

// ---------------------------------------------------------------------------
// Adjacency helpers (built once, reused across calls)
// ---------------------------------------------------------------------------

function buildAdjacency(): Map<string, { nodeId: string; edgeId: string }[]> {
  const adj = new Map<string, { nodeId: string; edgeId: string }[]>();

  for (const edge of allEdges) {
    const { source, target, id } = edge.data;

    if (!adj.has(source)) adj.set(source, []);
    adj.get(source)!.push({ nodeId: target, edgeId: id });

    if (!adj.has(target)) adj.set(target, []);
    adj.get(target)!.push({ nodeId: source, edgeId: id });
  }

  return adj;
}

const adjacency = buildAdjacency();

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export const graphService = {
  getGraphData(filter?: GraphFilter): Promise<GraphData> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredNodes = [...allNodes];
        let filteredEdges = [...allEdges];

        if (filter) {
          if (filter.entityTypes.length > 0) {
            const typeSet = new Set<EntityType>(filter.entityTypes);
            filteredNodes = filteredNodes.filter((n) =>
              typeSet.has(n.data.type),
            );
          }

          filteredNodes = filteredNodes.filter(
            (n) =>
              n.data.riskScore >= filter.minRiskScore &&
              n.data.riskScore <= filter.maxRiskScore,
          );

          if (filter.edgeTypes.length > 0) {
            const edgeTypeSet = new Set(filter.edgeTypes);
            filteredEdges = filteredEdges.filter((e) =>
              edgeTypeSet.has(e.data.type),
            );
          }

          if (filter.search) {
            const s = filter.search.toLowerCase();
            filteredNodes = filteredNodes.filter((n) =>
              n.data.label.toLowerCase().includes(s),
            );
          }
        }

        // Only include edges whose source and target are both in the filtered node set
        const nodeIdSet = new Set(filteredNodes.map((n) => n.data.id));
        filteredEdges = filteredEdges.filter(
          (e) =>
            nodeIdSet.has(e.data.source) && nodeIdSet.has(e.data.target),
        );

        resolve({ nodes: filteredNodes, edges: filteredEdges });
      }, 400);
    });
  },

  getNodeConnections(
    entityId: string,
    depth: number = 1,
  ): Promise<GraphData> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const visitedNodeIds = new Set<string>();
        const collectedEdgeIds = new Set<string>();
        const queue: { nodeId: string; currentDepth: number }[] = [
          { nodeId: entityId, currentDepth: 0 },
        ];

        visitedNodeIds.add(entityId);

        while (queue.length > 0) {
          const { nodeId, currentDepth } = queue.shift()!;

          if (currentDepth >= depth) continue;

          const neighbors = adjacency.get(nodeId) ?? [];
          for (const neighbor of neighbors) {
            collectedEdgeIds.add(neighbor.edgeId);

            if (!visitedNodeIds.has(neighbor.nodeId)) {
              visitedNodeIds.add(neighbor.nodeId);
              queue.push({
                nodeId: neighbor.nodeId,
                currentDepth: currentDepth + 1,
              });
            }
          }
        }

        const nodes = allNodes.filter((n) => visitedNodeIds.has(n.data.id));
        const edges = allEdges.filter((e) =>
          collectedEdgeIds.has(e.data.id),
        );

        resolve({ nodes, edges });
      }, 300);
    });
  },

  findPath(
    sourceId: string,
    targetId: string,
  ): Promise<GraphData | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // BFS to find shortest path
        const visited = new Set<string>();
        const parent = new Map<
          string,
          { nodeId: string; edgeId: string } | null
        >();

        visited.add(sourceId);
        parent.set(sourceId, null);

        const queue: string[] = [sourceId];
        let found = false;

        while (queue.length > 0 && !found) {
          const current = queue.shift()!;
          const neighbors = adjacency.get(current) ?? [];

          for (const neighbor of neighbors) {
            if (visited.has(neighbor.nodeId)) continue;

            visited.add(neighbor.nodeId);
            parent.set(neighbor.nodeId, {
              nodeId: current,
              edgeId: neighbor.edgeId,
            });

            if (neighbor.nodeId === targetId) {
              found = true;
              break;
            }

            queue.push(neighbor.nodeId);
          }
        }

        if (!found) {
          resolve(null);
          return;
        }

        // Reconstruct path
        const pathNodeIds: string[] = [];
        const pathEdgeIds: string[] = [];
        let cursor: string | null = targetId;

        while (cursor !== null) {
          pathNodeIds.push(cursor);
          const prev = parent.get(cursor);
          if (prev === null || prev === undefined) break;
          pathEdgeIds.push(prev.edgeId);
          cursor = prev.nodeId;
        }

        pathNodeIds.reverse();
        pathEdgeIds.reverse();

        const nodes = allNodes.filter((n) =>
          pathNodeIds.includes(n.data.id),
        );
        const edges = allEdges.filter((e) =>
          pathEdgeIds.includes(e.data.id),
        );

        resolve({ nodes, edges });
      }, 500);
    });
  },

  getNodeById(id: string): Promise<GraphNode | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const node = allNodes.find((n) => n.data.id === id) ?? null;
        resolve(node);
      }, 100);
    });
  },

  getEdgesByNode(nodeId: string): Promise<GraphEdge[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const edges = allEdges.filter(
          (e) => e.data.source === nodeId || e.data.target === nodeId,
        );
        resolve(edges);
      }, 150);
    });
  },
};

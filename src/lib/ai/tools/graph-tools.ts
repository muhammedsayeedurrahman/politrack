/**
 * Graph Traversal Tools — MCP-compatible tools for network graph operations.
 */

import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import {
  getNodeById,
  getNodeConnections,
  findPath,
  getEdgesByNode,
  getGraphData,
} from '@/app/api/_lib/data';

export const getNode = tool(
  async (input) => {
    const node = getNodeById(input.nodeId);
    if (!node) return JSON.stringify({ error: 'Node not found' });
    return JSON.stringify(node.data);
  },
  {
    name: 'get_graph_node',
    description: 'Get details of a specific node in the network graph.',
    schema: z.object({
      nodeId: z.string().describe('The node/entity ID'),
    }),
  },
);

export const getConnections = tool(
  async (input) => {
    const result = getNodeConnections(input.nodeId, input.depth ?? 1);
    return JSON.stringify({
      centerNode: input.nodeId,
      depth: input.depth ?? 1,
      nodeCount: result.nodes.length,
      edgeCount: result.edges.length,
      nodes: result.nodes.map((n) => ({
        id: n.data.id,
        label: n.data.label,
        type: n.data.type,
        riskScore: n.data.riskScore,
        connectionCount: n.data.connectionCount,
      })),
      edges: result.edges.map((e) => ({
        source: e.data.source,
        target: e.data.target,
        type: e.data.type,
        label: e.data.label,
        confidence: e.data.confidence,
      })),
    });
  },
  {
    name: 'get_connections',
    description:
      'Get all nodes and edges connected to a node, up to a given depth (BFS traversal).',
    schema: z.object({
      nodeId: z.string().describe('Center node ID'),
      depth: z.number().optional().describe('Traversal depth (default 1, max 3)'),
    }),
  },
);

export const findPathBetweenNodes = tool(
  async (input) => {
    const result = findPath(input.sourceId, input.targetId);
    if (!result) {
      return JSON.stringify({
        found: false,
        message: `No path found between ${input.sourceId} and ${input.targetId}`,
      });
    }
    return JSON.stringify({
      found: true,
      pathLength: result.nodes.length,
      nodes: result.nodes.map((n) => ({
        id: n.data.id,
        label: n.data.label,
        type: n.data.type,
        riskScore: n.data.riskScore,
      })),
      edges: result.edges.map((e) => ({
        source: e.data.source,
        target: e.data.target,
        type: e.data.type,
        label: e.data.label,
      })),
    });
  },
  {
    name: 'find_path',
    description: 'Find the shortest path between two nodes in the network graph.',
    schema: z.object({
      sourceId: z.string().describe('Starting node ID'),
      targetId: z.string().describe('Target node ID'),
    }),
  },
);

export const getNodeEdges = tool(
  async (input) => {
    const edges = getEdgesByNode(input.nodeId);
    return JSON.stringify({
      nodeId: input.nodeId,
      edgeCount: edges.length,
      edges: edges.map((e) => ({
        id: e.data.id,
        source: e.data.source,
        target: e.data.target,
        type: e.data.type,
        label: e.data.label,
        confidence: e.data.confidence,
        isInferred: e.data.isInferred,
      })),
    });
  },
  {
    name: 'get_node_edges',
    description: 'Get all edges connected to a specific node.',
    schema: z.object({
      nodeId: z.string().describe('The node ID'),
    }),
  },
);

export const getFullGraph = tool(
  async (input) => {
    const data = getGraphData(
      input.minRiskScore !== undefined
        ? {
            entityTypes: [],
            edgeTypes: [],
            minRiskScore: input.minRiskScore,
            maxRiskScore: 100,
            search: '',
          }
        : undefined,
    );
    return JSON.stringify({
      nodeCount: data.nodes.length,
      edgeCount: data.edges.length,
      nodesByType: data.nodes.reduce(
        (acc, n) => {
          acc[n.data.type] = (acc[n.data.type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
      highRiskNodes: data.nodes
        .filter((n) => n.data.riskScore >= 70)
        .map((n) => ({
          id: n.data.id,
          label: n.data.label,
          riskScore: n.data.riskScore,
        })),
    });
  },
  {
    name: 'get_graph_overview',
    description: 'Get an overview of the full network graph with statistics.',
    schema: z.object({
      minRiskScore: z
        .number()
        .optional()
        .describe('Only include nodes above this risk score'),
    }),
  },
);

export const graphTools = [
  getNode,
  getConnections,
  findPathBetweenNodes,
  getNodeEdges,
  getFullGraph,
];

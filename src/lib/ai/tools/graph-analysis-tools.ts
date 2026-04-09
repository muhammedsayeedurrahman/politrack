/**
 * Graph Analysis Tools — Advanced graph algorithms for pattern detection.
 * Community detection (Louvain-approximate), centrality, hub detection.
 */

import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import { getGraphData } from '@/app/api/_lib/data';

export const detectCommunities = tool(
  async () => {
    const { nodes, edges } = getGraphData();

    // Build adjacency for community detection (simplified label propagation)
    const adj = new Map<string, Set<string>>();
    for (const node of nodes) {
      adj.set(node.data.id, new Set());
    }
    for (const edge of edges) {
      adj.get(edge.data.source)?.add(edge.data.target);
      adj.get(edge.data.target)?.add(edge.data.source);
    }

    // Label propagation community detection
    const labels = new Map<string, string>();
    for (const node of nodes) {
      labels.set(node.data.id, node.data.id);
    }

    for (let iteration = 0; iteration < 10; iteration++) {
      let changed = false;
      for (const node of nodes) {
        const neighbors = adj.get(node.data.id) ?? new Set();
        if (neighbors.size === 0) continue;

        const labelCounts = new Map<string, number>();
        for (const neighbor of neighbors) {
          const label = labels.get(neighbor) ?? neighbor;
          labelCounts.set(label, (labelCounts.get(label) ?? 0) + 1);
        }

        let maxLabel = labels.get(node.data.id)!;
        let maxCount = 0;
        for (const [label, count] of labelCounts) {
          if (count > maxCount) {
            maxCount = count;
            maxLabel = label;
          }
        }

        if (maxLabel !== labels.get(node.data.id)) {
          labels.set(node.data.id, maxLabel);
          changed = true;
        }
      }
      if (!changed) break;
    }

    // Group by community
    const communities = new Map<string, string[]>();
    for (const [nodeId, label] of labels) {
      if (!communities.has(label)) communities.set(label, []);
      communities.get(label)!.push(nodeId);
    }

    // Only return communities with 3+ members
    const significantCommunities = [...communities.entries()]
      .filter(([, members]) => members.length >= 3)
      .map(([id, members], idx) => {
        const memberNodes = members
          .map((mid) => nodes.find((n) => n.data.id === mid))
          .filter(Boolean);
        const avgRisk =
          memberNodes.reduce((s, n) => s + n!.data.riskScore, 0) / memberNodes.length;

        return {
          communityId: `community-${idx + 1}`,
          size: members.length,
          avgRiskScore: Math.round(avgRisk),
          members: memberNodes.slice(0, 8).map((n) => ({
            id: n!.data.id,
            label: n!.data.label,
            type: n!.data.type,
            riskScore: n!.data.riskScore,
          })),
        };
      })
      .sort((a, b) => b.avgRiskScore - a.avgRiskScore);

    return JSON.stringify({
      totalCommunities: significantCommunities.length,
      communities: significantCommunities.slice(0, 10),
    });
  },
  {
    name: 'detect_communities',
    description:
      'Run community detection on the network graph to find clusters of related entities.',
    schema: z.object({}),
  },
);

export const calculateCentrality = tool(
  async () => {
    const { nodes, edges } = getGraphData();

    // Degree centrality
    const degree = new Map<string, number>();
    for (const node of nodes) {
      degree.set(node.data.id, 0);
    }
    for (const edge of edges) {
      degree.set(edge.data.source, (degree.get(edge.data.source) ?? 0) + 1);
      degree.set(edge.data.target, (degree.get(edge.data.target) ?? 0) + 1);
    }

    const maxDegree = Math.max(...degree.values(), 1);

    const rankings = nodes
      .map((n) => ({
        id: n.data.id,
        label: n.data.label,
        type: n.data.type,
        riskScore: n.data.riskScore,
        degree: degree.get(n.data.id) ?? 0,
        normalizedCentrality: Number(
          ((degree.get(n.data.id) ?? 0) / maxDegree).toFixed(3),
        ),
      }))
      .sort((a, b) => b.degree - a.degree);

    return JSON.stringify({
      topByDegree: rankings.slice(0, 15),
      averageDegree: Number(
        (rankings.reduce((s, r) => s + r.degree, 0) / rankings.length).toFixed(1),
      ),
      maxDegree,
    });
  },
  {
    name: 'calculate_centrality',
    description:
      'Calculate degree centrality for all nodes. Identifies the most connected entities.',
    schema: z.object({}),
  },
);

export const detectHubs = tool(
  async (input) => {
    const { nodes, edges } = getGraphData();
    const threshold = input.minConnections ?? 8;

    const degree = new Map<string, number>();
    for (const edge of edges) {
      degree.set(edge.data.source, (degree.get(edge.data.source) ?? 0) + 1);
      degree.set(edge.data.target, (degree.get(edge.data.target) ?? 0) + 1);
    }

    const hubs = nodes
      .filter((n) => (degree.get(n.data.id) ?? 0) >= threshold)
      .map((n) => {
        const nodeEdges = edges.filter(
          (e) => e.data.source === n.data.id || e.data.target === n.data.id,
        );
        const connectedTypes = new Map<string, number>();
        for (const e of nodeEdges) {
          const otherId =
            e.data.source === n.data.id ? e.data.target : e.data.source;
          const other = nodes.find((nn) => nn.data.id === otherId);
          if (other) {
            connectedTypes.set(
              other.data.type,
              (connectedTypes.get(other.data.type) ?? 0) + 1,
            );
          }
        }

        return {
          id: n.data.id,
          label: n.data.label,
          type: n.data.type,
          riskScore: n.data.riskScore,
          connections: degree.get(n.data.id) ?? 0,
          connectedTypes: Object.fromEntries(connectedTypes),
        };
      })
      .sort((a, b) => b.connections - a.connections);

    return JSON.stringify({
      threshold,
      hubCount: hubs.length,
      hubs,
    });
  },
  {
    name: 'detect_hubs',
    description:
      'Find hub entities with connections above a threshold. Hubs are key nodes for information/fund flows.',
    schema: z.object({
      minConnections: z
        .number()
        .optional()
        .describe('Minimum connections to be considered a hub (default 8)'),
    }),
  },
);

export const graphAnalysisTools = [detectCommunities, calculateCentrality, detectHubs];

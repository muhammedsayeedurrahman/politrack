/**
 * Network Analyst Agent — Analyzes corruption network graph patterns.
 *
 * Pattern: Parallel + Generator-Critic
 * Tools: graph_traversal, graph_analysis, pattern_detector, risk_calculator
 * Replaces: Mock analyzeNetworkPatterns() and analyzeNode() in ai-analysis-service.ts
 */

import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { getLLM } from '../providers';
import { auditLog, generateTraceId } from '../audit';
import type { AINetworkPattern, AINodeExplanation } from '@/services/ai-analysis-service';

// ---------------------------------------------------------------------------
// System Prompts
// ---------------------------------------------------------------------------

const PATTERN_SYSTEM_PROMPT = `You are a network analysis expert for PolitiTrace anticorruption platform.

Analyze the graph data provided and identify corruption patterns.

You MUST respond with ONLY valid JSON array of patterns:
[
  {
    "id": "pattern-1",
    "type": "hub" | "cluster" | "chain" | "anomaly",
    "label": "Short descriptive label",
    "description": "Detailed description of the pattern and why it's suspicious",
    "entityIds": ["id1", "id2"],
    "severity": "critical" | "high" | "medium",
    "confidence": 85
  }
]

Pattern types to look for:
- hub: High-centrality entities that serve as nexus points
- cluster: Groups of high-risk entities with many inter-connections
- chain: Official-to-corporate chains suggesting conflict of interest
- anomaly: Low-confidence or unusual connection patterns`;

const NODE_SYSTEM_PROMPT = `You are a network analysis expert for PolitiTrace anticorruption platform.

Analyze the given entity node and its connections in the network graph.

You MUST respond with ONLY valid JSON:
{
  "summary": "2-3 sentence summary of the entity's network position and significance",
  "role": "Central hub" | "Significant connector" | "Peripheral node" | "Isolated node",
  "riskNarrative": "Detailed risk assessment based on connections and position",
  "relatedPatterns": ["Pattern 1", "Pattern 2"]
}

Be specific about connection types, risk implications, and investigation recommendations.`;

// ---------------------------------------------------------------------------
// Network Pattern Detection (with LLM enhancement)
// ---------------------------------------------------------------------------

export async function detectNetworkPatternsWithAgent(
  nodes: Array<{ data: { id: string; label: string; type: string; riskScore: number; connectionCount: number } }>,
  edges: Array<{ data: { source: string; target: string; type: string; confidence: number } }>,
): Promise<AINetworkPattern[]> {
  const traceId = generateTraceId();

  // Step 1: Algorithmic pattern detection (always runs — guaranteed results)
  const algorithmicPatterns = detectPatternsAlgorithmically(nodes, edges);

  auditLog({
    agentId: 'network-agent',
    action: 'tool_call',
    input: { nodeCount: nodes.length, edgeCount: edges.length },
    output: { patternsFound: algorithmicPatterns.length },
    reasoning: 'Algorithmic pattern detection completed',
    parentTraceId: traceId,
  });

  // Step 2: LLM enhancement (adds narrative quality — optional)
  try {
    const llm = getLLM();

    // Prepare a summary for the LLM (don't send the full graph)
    const degreeMap = new Map<string, number>();
    for (const edge of edges) {
      degreeMap.set(edge.data.source, (degreeMap.get(edge.data.source) ?? 0) + 1);
      degreeMap.set(edge.data.target, (degreeMap.get(edge.data.target) ?? 0) + 1);
    }

    const topNodes = nodes
      .sort((a, b) => (degreeMap.get(b.data.id) ?? 0) - (degreeMap.get(a.data.id) ?? 0))
      .slice(0, 20);

    const highRiskNodes = nodes.filter((n) => n.data.riskScore >= 70).slice(0, 15);

    const graphSummary = {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      topByConnections: topNodes.map((n) => ({
        id: n.data.id,
        label: n.data.label,
        type: n.data.type,
        riskScore: n.data.riskScore,
        connections: degreeMap.get(n.data.id) ?? 0,
      })),
      highRiskNodes: highRiskNodes.map((n) => ({
        id: n.data.id,
        label: n.data.label,
        type: n.data.type,
        riskScore: n.data.riskScore,
      })),
      officials: nodes.filter((n) => n.data.type === 'official').length,
      companies: nodes.filter((n) => n.data.type === 'company').length,
      algorithmicPatterns: algorithmicPatterns.map((p) => ({
        type: p.type,
        label: p.label,
        entityCount: p.entityIds.length,
      })),
    };

    const response = await llm.invoke([
      new SystemMessage(PATTERN_SYSTEM_PROMPT),
      new HumanMessage(
        `Analyze this graph data and enhance the pattern descriptions:\n\n${JSON.stringify(graphSummary, null, 2)}\n\nProvide enhanced patterns as JSON array.`,
      ),
    ]);

    const content = typeof response.content === 'string' ? response.content : '';
    let raw = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const llmPatterns = JSON.parse(raw) as AINetworkPattern[];

    // Merge: prefer algorithmic patterns but enhance descriptions from LLM
    const merged = algorithmicPatterns.map((ap) => {
      const llmMatch = llmPatterns.find((lp) => lp.type === ap.type);
      if (llmMatch && llmMatch.description.length > ap.description.length) {
        return { ...ap, description: llmMatch.description };
      }
      return ap;
    });

    // Add any new LLM-only patterns
    for (const lp of llmPatterns) {
      if (!merged.find((m) => m.type === lp.type && m.label === lp.label)) {
        // Validate LLM pattern has valid entity IDs
        const validIds = new Set(nodes.map((n) => n.data.id));
        const validEntityIds = (lp.entityIds ?? []).filter((id) => validIds.has(id));
        if (validEntityIds.length > 0) {
          merged.push({ ...lp, entityIds: validEntityIds });
        }
      }
    }

    auditLog({
      agentId: 'network-agent',
      action: 'decision',
      input: { algorithmicCount: algorithmicPatterns.length },
      output: { mergedCount: merged.length },
      reasoning: 'Enhanced patterns with LLM narratives',
      parentTraceId: traceId,
    });

    return merged;
  } catch {
    // LLM failed, return algorithmic patterns (still high quality)
    return algorithmicPatterns;
  }
}

// ---------------------------------------------------------------------------
// Node Explanation (with LLM)
// ---------------------------------------------------------------------------

export async function explainNodeWithAgent(
  nodeId: string,
  nodes: Array<{ data: { id: string; label: string; type: string; riskScore: number; connectionCount: number } }>,
  edges: Array<{ data: { source: string; target: string; label: string; type: string; confidence: number } }>,
): Promise<AINodeExplanation> {
  const traceId = generateTraceId();
  const node = nodes.find((n) => n.data.id === nodeId);

  if (!node) {
    return {
      summary: 'Entity not found in current graph data.',
      role: 'unknown',
      riskNarrative: '',
      relatedPatterns: [],
    };
  }

  // Gather connection data
  const connectedEdges = edges.filter(
    (e) => e.data.source === nodeId || e.data.target === nodeId,
  );
  const connectedNodeIds = new Set(
    connectedEdges.flatMap((e) => [e.data.source, e.data.target]).filter((id) => id !== nodeId),
  );
  const connectedNodes = nodes.filter((n) => connectedNodeIds.has(n.data.id));

  const typeBreakdown = connectedNodes.reduce(
    (acc, n) => {
      acc[n.data.type] = (acc[n.data.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const highRiskConnections = connectedNodes.filter((n) => n.data.riskScore >= 70).length;
  const financialEdges = connectedEdges.filter((e) => e.data.type === 'financial').length;

  // Try LLM analysis
  try {
    const llm = getLLM();
    const nodeContext = {
      node: node.data,
      connectionCount: connectedEdges.length,
      connectedTypes: typeBreakdown,
      highRiskConnections,
      financialEdges,
      topConnections: connectedNodes.slice(0, 10).map((n) => ({
        label: n.data.label,
        type: n.data.type,
        riskScore: n.data.riskScore,
      })),
    };

    const response = await llm.invoke([
      new SystemMessage(NODE_SYSTEM_PROMPT),
      new HumanMessage(
        `Analyze this entity:\n\n${JSON.stringify(nodeContext, null, 2)}\n\nProvide analysis as JSON.`,
      ),
    ]);

    const content = typeof response.content === 'string' ? response.content : '';
    let raw = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(raw);

    auditLog({
      agentId: 'network-agent',
      action: 'decision',
      input: { nodeId },
      output: { role: parsed.role },
      reasoning: 'LLM analyzed node with network context',
      parentTraceId: traceId,
    });

    return {
      summary: parsed.summary,
      role: parsed.role,
      riskNarrative: parsed.riskNarrative,
      relatedPatterns: parsed.relatedPatterns ?? [],
    };
  } catch {
    // Fallback to algorithmic analysis
    return explainNodeAlgorithmically(node, connectedEdges, connectedNodes, typeBreakdown);
  }
}

// ---------------------------------------------------------------------------
// Algorithmic helpers
// ---------------------------------------------------------------------------

function detectPatternsAlgorithmically(
  nodes: Array<{ data: { id: string; label: string; type: string; riskScore: number; connectionCount: number } }>,
  edges: Array<{ data: { source: string; target: string; type: string; confidence: number } }>,
): AINetworkPattern[] {
  const patterns: AINetworkPattern[] = [];

  // Hub detection
  const degreeMap = new Map<string, number>();
  for (const edge of edges) {
    degreeMap.set(edge.data.source, (degreeMap.get(edge.data.source) ?? 0) + 1);
    degreeMap.set(edge.data.target, (degreeMap.get(edge.data.target) ?? 0) + 1);
  }

  const hubs = nodes
    .filter((n) => (degreeMap.get(n.data.id) ?? 0) >= 8)
    .sort((a, b) => (degreeMap.get(b.data.id) ?? 0) - (degreeMap.get(a.data.id) ?? 0));

  if (hubs.length > 0) {
    patterns.push({
      id: 'pattern-hub-1',
      type: 'hub',
      label: 'High-Centrality Hub Entities',
      description: `${hubs.length} entities act as major network hubs. ${hubs[0].data.label} has the highest degree centrality with ${degreeMap.get(hubs[0].data.id)} connections, making it a critical node for information and fund flows.`,
      entityIds: hubs.slice(0, 5).map((h) => h.data.id),
      severity: hubs.some((h) => h.data.riskScore >= 70) ? 'critical' : 'high',
      confidence: 92,
    });
  }

  // High-risk cluster detection
  const highRiskNodes = nodes.filter((n) => n.data.riskScore >= 70);
  if (highRiskNodes.length >= 3) {
    const hrSet = new Set(highRiskNodes.map((n) => n.data.id));
    const connectedHR = edges.filter(
      (e) => hrSet.has(e.data.source) && hrSet.has(e.data.target),
    );

    if (connectedHR.length >= 2) {
      const involvedIds = new Set<string>();
      connectedHR.forEach((e) => {
        involvedIds.add(e.data.source);
        involvedIds.add(e.data.target);
      });

      const avgRisk = Math.round(
        highRiskNodes
          .filter((n) => involvedIds.has(n.data.id))
          .reduce((s, n) => s + n.data.riskScore, 0) / involvedIds.size,
      );

      patterns.push({
        id: 'pattern-cluster-1',
        type: 'cluster',
        label: 'High-Risk Entity Cluster',
        description: `${involvedIds.size} high-risk entities form a tightly connected cluster with ${connectedHR.length} inter-connections. Average risk score: ${avgRisk}. This concentration suggests coordinated activity.`,
        entityIds: [...involvedIds].slice(0, 8),
        severity: 'critical',
        confidence: 87,
      });
    }
  }

  // Official-corporate nexus
  const officials = new Set(nodes.filter((n) => n.data.type === 'official').map((n) => n.data.id));
  const companies = new Set(nodes.filter((n) => n.data.type === 'company').map((n) => n.data.id));

  const officialCompanyEdges = edges.filter(
    (e) =>
      (officials.has(e.data.source) && companies.has(e.data.target)) ||
      (officials.has(e.data.target) && companies.has(e.data.source)),
  );

  if (officialCompanyEdges.length >= 3) {
    const involvedIds = new Set<string>();
    officialCompanyEdges.forEach((e) => {
      involvedIds.add(e.data.source);
      involvedIds.add(e.data.target);
    });

    patterns.push({
      id: 'pattern-chain-1',
      type: 'chain',
      label: 'Official-Corporate Nexus',
      description: `${officialCompanyEdges.length} direct connections between government officials and corporate entities detected. ${involvedIds.size} entities involved in potential conflict-of-interest relationships.`,
      entityIds: [...involvedIds].slice(0, 8),
      severity: 'high',
      confidence: 78,
    });
  }

  // Low-confidence anomalies
  const lowConfEdges = edges.filter((e) => e.data.confidence < 0.4);
  if (lowConfEdges.length >= 3) {
    const involvedIds = new Set<string>();
    lowConfEdges.slice(0, 6).forEach((e) => {
      involvedIds.add(e.data.source);
      involvedIds.add(e.data.target);
    });

    patterns.push({
      id: 'pattern-anomaly-1',
      type: 'anomaly',
      label: 'Low-Confidence Inferred Connections',
      description: `${lowConfEdges.length} connections have confidence scores below 40%. These inferred relationships may indicate hidden connections requiring further verification through financial or documentary evidence.`,
      entityIds: [...involvedIds].slice(0, 6),
      severity: 'medium',
      confidence: 65,
    });
  }

  return patterns;
}

function explainNodeAlgorithmically(
  node: { data: { id: string; label: string; type: string; riskScore: number; connectionCount: number } },
  connectedEdges: Array<{ data: { source: string; target: string; label: string; type: string; confidence: number } }>,
  connectedNodes: Array<{ data: { id: string; label: string; type: string; riskScore: number; connectionCount: number } }>,
  typeBreakdown: Record<string, number>,
): AINodeExplanation {
  const highRiskConnections = connectedNodes.filter((n) => n.data.riskScore >= 70).length;
  const financialEdges = connectedEdges.filter((e) => e.data.type === 'financial').length;
  const avgConnectedRisk = connectedNodes.length > 0
    ? Math.round(connectedNodes.reduce((s, n) => s + n.data.riskScore, 0) / connectedNodes.length)
    : 0;

  const role = connectedEdges.length >= 10
    ? 'Central hub'
    : connectedEdges.length >= 5
      ? 'Significant connector'
      : connectedEdges.length >= 2
        ? 'Peripheral node'
        : 'Isolated node';

  const typeSummary = Object.entries(typeBreakdown)
    .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`)
    .join(', ');

  const summary = `**${node.data.label}** is a ${node.data.type} entity with ${connectedEdges.length} direct connections to ${typeSummary}. ` +
    (financialEdges > 0 ? `${financialEdges} of these are financial relationships. ` : '') +
    (highRiskConnections > 0 ? `${highRiskConnections} connected entities are in the high-risk category. ` : '') +
    `This entity serves as a **${role.toLowerCase()}** in the broader network.`;

  const riskNarrative = node.data.riskScore >= 70
    ? `This entity's risk score of ${node.data.riskScore} places it in the critical range. Combined with ${highRiskConnections} high-risk connections (avg connected risk: ${avgConnectedRisk}), this entity warrants priority investigation.`
    : node.data.riskScore >= 50
      ? `With a risk score of ${node.data.riskScore}, this entity is at elevated risk. ${highRiskConnections > 0 ? `The ${highRiskConnections} high-risk connections increase concern.` : 'Direct connections do not currently amplify the risk.'}`
      : `Risk score of ${node.data.riskScore} is within normal parameters. ${highRiskConnections > 0 ? `However, ${highRiskConnections} high-risk connections merit attention.` : 'No significant risk amplification from network position.'}`;

  const relatedPatterns: string[] = [];
  if (connectedEdges.length >= 8) relatedPatterns.push('High-centrality hub pattern');
  if (highRiskConnections >= 3) relatedPatterns.push('High-risk cluster member');
  if (node.data.type === 'official' && typeBreakdown['company'] >= 2) relatedPatterns.push('Official-corporate nexus');
  if (financialEdges >= 3) relatedPatterns.push('Financial transaction concentration');

  return { summary, role, riskNarrative, relatedPatterns };
}

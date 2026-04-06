import { Case, Entity, Alert } from '@/types';
import { mockEntities, mockAlerts } from './mock-data';
import { getRiskLevel } from '@/lib/constants';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AIRiskFactor {
  name: string;
  weight: number;
  score: number;
  description: string;
}

export interface AIRecommendation {
  text: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

export interface AICaseAnalysis {
  summary: string;
  riskFactors: AIRiskFactor[];
  recommendations: AIRecommendation[];
  confidence: number;
  patterns: string[];
  generatedAt: string;
}

export interface AITriageResult {
  alertId: string;
  recommendation: 'escalate' | 'investigate' | 'monitor' | 'auto-dismiss';
  reason: string;
  confidence: number;
}

export interface AIAlertCluster {
  id: string;
  label: string;
  alertIds: string[];
  sharedEntity: string;
  pattern: string;
  severity: 'critical' | 'high' | 'medium';
}

export interface AIAlertInsights {
  totalAnalyzed: number;
  clusters: AIAlertCluster[];
  trendSummary: string;
  topPattern: string;
  escalationCount: number;
}

export interface AINetworkPattern {
  id: string;
  type: 'hub' | 'cluster' | 'chain' | 'anomaly';
  label: string;
  description: string;
  entityIds: string[];
  severity: 'critical' | 'high' | 'medium';
  confidence: number;
}

export interface AINodeExplanation {
  summary: string;
  role: string;
  riskNarrative: string;
  relatedPatterns: string[];
}

export interface AIThreatBriefing {
  date: string;
  threatLevel: 'critical' | 'elevated' | 'moderate' | 'low';
  summary: string;
  keyFindings: { text: string; severity: 'critical' | 'high' | 'medium' }[];
  focusAreas: string[];
  predictions: { text: string; confidence: number }[];
  generatedAt: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getLinkedEntities(caseData: Case): Entity[] {
  return caseData.entityIds
    .map(id => mockEntities.find(e => e.id === id))
    .filter(Boolean) as Entity[];
}

function getLinkedAlerts(caseData: Case): Alert[] {
  return caseData.alertIds
    .map(id => mockAlerts.find(a => a.id === id))
    .filter(Boolean) as Alert[];
}

function seededScore(seed: string, min: number, max: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  return min + Math.abs(hash % (max - min + 1));
}

// ---------------------------------------------------------------------------
// Case Analysis
// ---------------------------------------------------------------------------

export function generateCaseAnalysis(caseData: Case): AICaseAnalysis {
  const entities = getLinkedEntities(caseData);
  const alerts = getLinkedAlerts(caseData);
  const avgRisk = entities.length > 0
    ? Math.round(entities.reduce((sum, e) => sum + e.riskScore, 0) / entities.length)
    : caseData.riskScore;

  const hasShellCompany = caseData.tags.includes('shell-company') || caseData.tags.includes('benami');
  const hasProcurement = caseData.tags.includes('procurement') || caseData.tags.includes('tender-fraud');
  const hasMoneyLaundering = caseData.tags.includes('money-laundering') || caseData.tags.includes('kickback');

  const riskFactors: AIRiskFactor[] = [
    {
      name: 'Transaction Anomalies',
      weight: 30,
      score: seededScore(caseData.id + 'txn', 40, 95),
      description: `${alerts.length} linked alerts indicate irregular transaction patterns across ${entities.filter(e => e.type === 'company').length} corporate entities.`,
    },
    {
      name: 'Network Centrality',
      weight: 25,
      score: seededScore(caseData.id + 'net', 35, 90),
      description: `Key entities show ${avgRisk > 60 ? 'high' : 'moderate'} degree centrality, connecting to ${entities.reduce((s, e) => s + e.connectionCount, 0)} total network nodes.`,
    },
    {
      name: 'Entity Risk Aggregation',
      weight: 20,
      score: avgRisk,
      description: `Average risk score of ${entities.length} linked entities is ${avgRisk}. ${entities.filter(e => e.riskScore >= 70).length} entities in critical range.`,
    },
    {
      name: 'Behavioral Indicators',
      weight: 15,
      score: seededScore(caseData.id + 'bhv', 30, 85),
      description: hasShellCompany
        ? 'Shell company patterns detected with zero operational footprint and shared registered addresses.'
        : hasProcurement
        ? 'Procurement irregularities including bid price clustering and tender specification manipulation.'
        : 'Behavioral signals suggest coordinated activity between linked entities.',
    },
    {
      name: 'Source Reliability',
      weight: 10,
      score: seededScore(caseData.id + 'src', 60, 95),
      description: `Evidence from ${new Set(caseData.evidence.map(e => e.source)).size} independent sources, including ${caseData.evidence.length} verified documents.`,
    },
  ];

  const highRiskEntities = entities.filter(e => e.riskScore >= 70);
  const entityNames = entities.slice(0, 3).map(e => e.name).join(', ');

  const summary = `AI analysis of "${caseData.title}" reveals ${getRiskLevel(caseData.riskScore)} risk patterns involving ${entities.length} entities. ` +
    `${highRiskEntities.length > 0 ? `${highRiskEntities.length} entities are in the critical risk range, including ${highRiskEntities[0]?.name}. ` : ''}` +
    `${hasMoneyLaundering ? 'Layered transaction flows suggest potential money laundering through intermediary accounts. ' : ''}` +
    `${hasShellCompany ? 'Shell company network detected with common directorships and shared infrastructure. ' : ''}` +
    `${hasProcurement ? 'Procurement data shows statistical anomalies consistent with bid manipulation. ' : ''}` +
    `Cross-referencing with ${alerts.length} linked alerts confirms systematic activity patterns.`;

  const baseRecommendations: AIRecommendation[] = [
    {
      text: `Deep-dive financial analysis on ${entityNames}`,
      priority: 'high',
      category: 'financial',
    },
    {
      text: 'Request FIU suspicious transaction reports for linked accounts',
      priority: 'high',
      category: 'intelligence',
    },
    {
      text: `Map extended network connections (depth-2) for all ${entities.length} entities`,
      priority: 'medium',
      category: 'network',
    },
    {
      text: 'Cross-reference with CAG audit findings and RTI disclosures',
      priority: 'medium',
      category: 'evidence',
    },
  ];

  if (hasShellCompany) {
    baseRecommendations.push({
      text: 'Verify company registrations through MCA portal for operational status',
      priority: 'high',
      category: 'verification',
    });
  }
  if (hasProcurement) {
    baseRecommendations.push({
      text: 'Obtain complete tender documentation and evaluation committee records',
      priority: 'high',
      category: 'procurement',
    });
  }

  const patterns: string[] = [];
  if (highRiskEntities.length >= 2) patterns.push('Multiple high-risk entities in same network cluster');
  if (hasShellCompany) patterns.push('Shell company intermediary pattern');
  if (hasProcurement) patterns.push('Bid clustering anomaly detected');
  if (hasMoneyLaundering) patterns.push('Layered transaction flow pattern');
  if (entities.some(e => e.type === 'official') && entities.some(e => e.type === 'company')) {
    patterns.push('Official-corporate nexus detected');
  }

  return {
    summary,
    riskFactors,
    recommendations: baseRecommendations,
    confidence: seededScore(caseData.id + 'conf', 72, 94),
    patterns,
    generatedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Alert Triage
// ---------------------------------------------------------------------------

export function triageAlert(alert: Alert): AITriageResult {
  const linkedEntity = mockEntities.find(e => e.id === alert.entityId);
  const entityRisk = linkedEntity?.riskScore ?? 0;
  const combinedScore = (alert.riskScore * 0.6 + entityRisk * 0.4);

  let recommendation: AITriageResult['recommendation'];
  let reason: string;
  let confidence: number;

  if (alert.priority === 'critical' || combinedScore >= 80) {
    recommendation = 'escalate';
    reason = `High combined risk score (${Math.round(combinedScore)}). ${alert.priority === 'critical' ? 'Critical priority alert.' : 'Entity risk amplifies alert severity.'}`;
    confidence = seededScore(alert.id + 'conf', 85, 96);
  } else if (alert.priority === 'high' || combinedScore >= 55) {
    recommendation = 'investigate';
    reason = `Moderate-high risk (${Math.round(combinedScore)}). ${linkedEntity ? `Linked entity "${linkedEntity.name}" has risk score ${entityRisk}.` : 'Requires manual review.'}`;
    confidence = seededScore(alert.id + 'conf', 75, 90);
  } else if (combinedScore >= 30) {
    recommendation = 'monitor';
    reason = `Below investigation threshold but above baseline. Monitor for escalation triggers.`;
    confidence = seededScore(alert.id + 'conf', 65, 85);
  } else {
    recommendation = 'auto-dismiss';
    reason = `Low risk score (${Math.round(combinedScore)}) with no high-risk entity connections. Safe to auto-dismiss.`;
    confidence = seededScore(alert.id + 'conf', 70, 92);
  }

  return { alertId: alert.id, recommendation, reason, confidence };
}

export function generateAlertInsights(alerts: Alert[]): AIAlertInsights {
  const nonDismissed = alerts.filter(a => !a.isDismissed);

  // Group alerts by category to find clusters
  const byCategory = nonDismissed.reduce((acc, a) => {
    if (!acc[a.category]) acc[a.category] = [];
    acc[a.category].push(a);
    return acc;
  }, {} as Record<string, Alert[]>);

  // Group by entity to find entity-based clusters
  const byEntity = nonDismissed.reduce((acc, a) => {
    if (!acc[a.entityId]) acc[a.entityId] = [];
    acc[a.entityId].push(a);
    return acc;
  }, {} as Record<string, Alert[]>);

  const clusters: AIAlertCluster[] = [];
  let clusterId = 0;

  // Entity-based clusters (3+ alerts on same entity)
  for (const [entityId, entityAlerts] of Object.entries(byEntity)) {
    if (entityAlerts.length >= 3) {
      const entity = mockEntities.find(e => e.id === entityId);
      const maxPriority = entityAlerts.some(a => a.priority === 'critical') ? 'critical'
        : entityAlerts.some(a => a.priority === 'high') ? 'high' : 'medium';

      clusters.push({
        id: `cluster-${++clusterId}`,
        label: `${entityAlerts.length} alerts around ${entity?.name ?? 'Unknown Entity'}`,
        alertIds: entityAlerts.map(a => a.id),
        sharedEntity: entity?.name ?? entityId,
        pattern: `Multiple alerts (${new Set(entityAlerts.map(a => a.category)).size} categories) targeting the same entity`,
        severity: maxPriority,
      });
    }
  }

  // Category-based clusters (5+ alerts in same category)
  for (const [category, catAlerts] of Object.entries(byCategory)) {
    if (catAlerts.length >= 5) {
      const topEntity = mockEntities.find(e =>
        catAlerts.some(a => a.entityId === e.id),
      );

      clusters.push({
        id: `cluster-${++clusterId}`,
        label: `${catAlerts.length} related ${category} alerts`,
        alertIds: catAlerts.slice(0, 10).map(a => a.id),
        sharedEntity: topEntity?.name ?? 'Multiple entities',
        pattern: `Concentrated ${category.toLowerCase()} pattern across ${new Set(catAlerts.map(a => a.entityId)).size} entities`,
        severity: catAlerts.some(a => a.priority === 'critical') ? 'critical' : 'high',
      });
    }
  }

  const topCategory = Object.entries(byCategory)
    .sort(([, a], [, b]) => b.length - a.length)[0];

  const triaged = nonDismissed.map(triageAlert);
  const escalationCount = triaged.filter(t => t.recommendation === 'escalate').length;

  return {
    totalAnalyzed: nonDismissed.length,
    clusters: clusters.slice(0, 5),
    trendSummary: `${topCategory[0]} is the dominant alert category with ${topCategory[1].length} alerts. Alert volume is ${nonDismissed.length > 80 ? 'above' : 'at'} normal levels.`,
    topPattern: topCategory[0],
    escalationCount,
  };
}

// ---------------------------------------------------------------------------
// Network Pattern Detection
// ---------------------------------------------------------------------------

export function detectNetworkPatterns(
  nodes: { data: { id: string; label: string; type: string; riskScore: number; connectionCount: number } }[],
  edges: { data: { source: string; target: string; type: string; confidence: number } }[],
): AINetworkPattern[] {
  const patterns: AINetworkPattern[] = [];

  // Find hub entities (high degree centrality)
  const degreeMap = new Map<string, number>();
  for (const edge of edges) {
    degreeMap.set(edge.data.source, (degreeMap.get(edge.data.source) ?? 0) + 1);
    degreeMap.set(edge.data.target, (degreeMap.get(edge.data.target) ?? 0) + 1);
  }

  const hubs = nodes
    .filter(n => (degreeMap.get(n.data.id) ?? 0) >= 8)
    .sort((a, b) => (degreeMap.get(b.data.id) ?? 0) - (degreeMap.get(a.data.id) ?? 0));

  if (hubs.length > 0) {
    patterns.push({
      id: 'pattern-hub-1',
      type: 'hub',
      label: 'High-Centrality Hub Entities',
      description: `${hubs.length} entities act as major network hubs. ${hubs[0].data.label} has the highest degree centrality with ${degreeMap.get(hubs[0].data.id)} connections, making it a critical node for information and fund flows.`,
      entityIds: hubs.slice(0, 5).map(h => h.data.id),
      severity: hubs.some(h => h.data.riskScore >= 70) ? 'critical' : 'high',
      confidence: 92,
    });
  }

  // Find clusters of high-risk entities
  const highRiskNodes = nodes.filter(n => n.data.riskScore >= 70);
  if (highRiskNodes.length >= 3) {
    // Find connected subgroups among high-risk nodes
    const hrSet = new Set(highRiskNodes.map(n => n.data.id));
    const connectedHR = edges.filter(
      e => hrSet.has(e.data.source) && hrSet.has(e.data.target),
    );

    if (connectedHR.length >= 2) {
      const involvedIds = new Set<string>();
      connectedHR.forEach(e => {
        involvedIds.add(e.data.source);
        involvedIds.add(e.data.target);
      });

      patterns.push({
        id: 'pattern-cluster-1',
        type: 'cluster',
        label: 'High-Risk Entity Cluster',
        description: `${involvedIds.size} high-risk entities form a tightly connected cluster with ${connectedHR.length} inter-connections. This concentration suggests coordinated activity. Average risk score: ${Math.round(highRiskNodes.filter(n => involvedIds.has(n.data.id)).reduce((s, n) => s + n.data.riskScore, 0) / involvedIds.size)}.`,
        entityIds: [...involvedIds].slice(0, 8),
        severity: 'critical',
        confidence: 87,
      });
    }
  }

  // Find official->company chains (suspicious procurement patterns)
  const officials = new Set(nodes.filter(n => n.data.type === 'official').map(n => n.data.id));
  const companies = new Set(nodes.filter(n => n.data.type === 'company').map(n => n.data.id));

  const officialCompanyEdges = edges.filter(
    e => (officials.has(e.data.source) && companies.has(e.data.target)) ||
         (officials.has(e.data.target) && companies.has(e.data.source)),
  );

  if (officialCompanyEdges.length >= 3) {
    const involvedIds = new Set<string>();
    officialCompanyEdges.forEach(e => {
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

  // Find low-confidence connections (anomalies)
  const lowConfEdges = edges.filter(e => e.data.confidence < 0.4);
  if (lowConfEdges.length >= 3) {
    const involvedIds = new Set<string>();
    lowConfEdges.slice(0, 6).forEach(e => {
      involvedIds.add(e.data.source);
      involvedIds.add(e.data.target);
    });

    patterns.push({
      id: 'pattern-anomaly-1',
      type: 'anomaly',
      label: 'Low-Confidence Inferred Connections',
      description: `${lowConfEdges.length} connections have confidence scores below 40%. These inferred relationships may indicate hidden connections that require further verification through financial or documentary evidence.`,
      entityIds: [...involvedIds].slice(0, 6),
      severity: 'medium',
      confidence: 65,
    });
  }

  return patterns;
}

export function explainNode(
  nodeId: string,
  nodes: { data: { id: string; label: string; type: string; riskScore: number; connectionCount: number } }[],
  edges: { data: { source: string; target: string; label: string; type: string; confidence: number } }[],
): AINodeExplanation {
  const node = nodes.find(n => n.data.id === nodeId);
  if (!node) {
    return {
      summary: 'Entity not found in current graph data.',
      role: 'unknown',
      riskNarrative: '',
      relatedPatterns: [],
    };
  }

  const connectedEdges = edges.filter(
    e => e.data.source === nodeId || e.data.target === nodeId,
  );
  const connectedNodeIds = new Set(
    connectedEdges.flatMap(e => [e.data.source, e.data.target]).filter(id => id !== nodeId),
  );
  const connectedNodes = nodes.filter(n => connectedNodeIds.has(n.data.id));

  const typeBreakdown = connectedNodes.reduce((acc, n) => {
    acc[n.data.type] = (acc[n.data.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const financialEdges = connectedEdges.filter(e => e.data.type === 'financial').length;
  const highRiskConnections = connectedNodes.filter(n => n.data.riskScore >= 70).length;
  const avgConnectedRisk = connectedNodes.length > 0
    ? Math.round(connectedNodes.reduce((s, n) => s + n.data.riskScore, 0) / connectedNodes.length)
    : 0;

  const role = connectedEdges.length >= 10 ? 'Central hub'
    : connectedEdges.length >= 5 ? 'Significant connector'
    : connectedEdges.length >= 2 ? 'Peripheral node'
    : 'Isolated node';

  const typeSummary = Object.entries(typeBreakdown)
    .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`)
    .join(', ');

  const summary = `**${node.data.label}** is a ${node.data.type} entity with ${connectedEdges.length} direct connections to ${typeSummary}. ` +
    `${financialEdges > 0 ? `${financialEdges} of these are financial relationships. ` : ''}` +
    `${highRiskConnections > 0 ? `${highRiskConnections} connected entities are in the high-risk category. ` : ''}` +
    `This entity serves as a **${role.toLowerCase()}** in the broader network.`;

  const riskNarrative = node.data.riskScore >= 70
    ? `This entity's risk score of ${node.data.riskScore} places it in the critical range. Combined with ${highRiskConnections} high-risk connections (avg connected risk: ${avgConnectedRisk}), this entity warrants priority investigation. The network position suggests potential involvement in coordinated activities.`
    : node.data.riskScore >= 50
    ? `With a risk score of ${node.data.riskScore}, this entity is at elevated risk. ${highRiskConnections > 0 ? `The ${highRiskConnections} high-risk connections increase concern.` : 'Direct connections do not currently amplify the risk.'} Recommend adding to active monitoring list.`
    : `Risk score of ${node.data.riskScore} is within normal parameters. ${highRiskConnections > 0 ? `However, ${highRiskConnections} high-risk connections merit attention.` : 'No significant risk amplification from network position.'}`;

  const relatedPatterns: string[] = [];
  if (connectedEdges.length >= 8) relatedPatterns.push('High-centrality hub pattern');
  if (highRiskConnections >= 3) relatedPatterns.push('High-risk cluster member');
  if (node.data.type === 'official' && typeBreakdown['company'] >= 2) relatedPatterns.push('Official-corporate nexus');
  if (financialEdges >= 3) relatedPatterns.push('Financial transaction concentration');

  return { summary, role, riskNarrative, relatedPatterns };
}

// ---------------------------------------------------------------------------
// Threat Briefing
// ---------------------------------------------------------------------------

export function generateThreatBriefing(): AIThreatBriefing {
  const criticalAlerts = mockAlerts.filter(a => a.priority === 'critical');
  const highAlerts = mockAlerts.filter(a => a.priority === 'high');
  const unreadAlerts = mockAlerts.filter(a => !a.isRead);
  const highRiskEntities = mockEntities.filter(e => e.riskScore >= 70);

  const byCategory = mockAlerts.reduce((acc, a) => {
    acc[a.category] = (acc[a.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(byCategory)
    .sort(([, a], [, b]) => b - a);

  const threatLevel: AIThreatBriefing['threatLevel'] = criticalAlerts.length >= 5
    ? 'critical'
    : criticalAlerts.length >= 3 || highAlerts.length >= 10
    ? 'elevated'
    : highAlerts.length >= 5
    ? 'moderate'
    : 'low';

  return {
    date: new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    threatLevel,
    summary: `PolitiTrace is tracking ${mockEntities.length} entities with ${unreadAlerts.length} unread alerts. ${criticalAlerts.length} critical and ${highAlerts.length} high-priority alerts demand attention. ${highRiskEntities.length} entities are flagged as high-risk across the monitored network.`,
    keyFindings: [
      {
        text: `${topCategories[0][0]} alerts dominate with ${topCategories[0][1]} incidents — up from baseline`,
        severity: 'high',
      },
      {
        text: `${highRiskEntities.length} entities in critical risk range, ${highRiskEntities.filter(e => e.type === 'official').length} are government officials`,
        severity: 'critical',
      },
      {
        text: `${topCategories[1]?.[0] ?? 'Secondary'} category shows ${topCategories[1]?.[1] ?? 0} alerts with cross-entity correlation`,
        severity: 'medium',
      },
      {
        text: `Shell company detection triggered ${byCategory['Shell Company Activity'] ?? 0} alerts linking to infrastructure contracts`,
        severity: 'high',
      },
    ],
    focusAreas: [
      `Review ${criticalAlerts.length} critical alerts — prioritize those linked to active cases`,
      `Investigate bid rigging pattern in infrastructure sector tenders`,
      `Monitor newly flagged entity connections in western region cluster`,
      `Follow up on pending FIU reports for high-risk entities`,
    ],
    predictions: [
      { text: 'Procurement irregularity alerts likely to increase in Q2 budget cycle', confidence: 82 },
      { text: 'Shell company network in real-estate sector shows expansion signals', confidence: 74 },
      { text: 'Fund diversion risk elevated for rural development schemes', confidence: 68 },
    ],
    generatedAt: new Date().toISOString(),
  };
}

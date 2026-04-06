import { mockEntities, mockAlerts, mockCases } from './mock-data';
import { getRiskLevel } from '@/lib/constants';
import type { Case, Entity, Alert } from '@/types';

// ---------------------------------------------------------------------------
// Context-aware AI response engine (simulated)
// ---------------------------------------------------------------------------

interface AIContext {
  page: string;
  entityId?: string | null;
  caseId?: string | null;
  alertId?: string | null;
}

function getEntity(id: string): Entity | undefined {
  return mockEntities.find(e => e.id === id);
}

function getCase(id: string): Case | undefined {
  return mockCases.find(c => c.id === id);
}

function getAlert(id: string): Alert | undefined {
  return mockAlerts.find(a => a.id === id);
}

function getLinkedEntities(caseData: Case): Entity[] {
  return caseData.entityIds
    .map(id => mockEntities.find(e => e.id === id))
    .filter(Boolean) as Entity[];
}

// ---------------------------------------------------------------------------
// Response templates keyed by context
// ---------------------------------------------------------------------------

function generateDashboardResponse(query: string): string {
  const criticalAlerts = mockAlerts.filter(a => a.priority === 'critical');
  const highRiskEntities = mockEntities.filter(e => e.riskScore >= 70);
  const activeCases = mockCases.filter(c => c.status === 'in_progress');

  if (query.toLowerCase().includes('summary') || query.toLowerCase().includes('overview')) {
    return `**Platform Intelligence Summary**\n\nCurrently tracking **${mockEntities.length} entities** across the network with **${mockAlerts.length} active alerts**.\n\n**Key Findings:**\n- ${criticalAlerts.length} critical alerts require immediate attention\n- ${highRiskEntities.length} entities flagged as high-risk (score >= 70)\n- ${activeCases.length} active investigations in progress\n- Highest risk entity: **${highRiskEntities[0]?.name}** (score: ${highRiskEntities[0]?.riskScore})\n\n**Recommended Actions:**\n1. Review the ${criticalAlerts.length} critical alerts, prioritizing those linked to active investigations\n2. Investigate the cluster of shell company alerts detected in the western region\n3. Cross-reference new transaction patterns with existing case files`;
  }

  if (query.toLowerCase().includes('risk') || query.toLowerCase().includes('threat')) {
    return `**Threat Assessment**\n\nThe current threat level is **elevated** based on recent alert patterns.\n\n**Risk Distribution:**\n- Critical: ${criticalAlerts.length} alerts\n- High: ${mockAlerts.filter(a => a.priority === 'high').length} alerts\n- Medium: ${mockAlerts.filter(a => a.priority === 'medium').length} alerts\n- Low: ${mockAlerts.filter(a => a.priority === 'low').length} alerts\n\n**Emerging Patterns:**\n- Bid rigging alerts have increased 40% in the infrastructure sector\n- New shell company network detected linking ${highRiskEntities.slice(0, 3).map(e => e.name).join(', ')}\n- Fund diversion patterns correlating with contract award timelines`;
  }

  return `Based on the current dashboard data, I can see **${mockAlerts.filter(a => !a.isRead).length} unread alerts** and **${activeCases.length} active cases**.\n\nThe most pressing items are:\n1. **${criticalAlerts[0]?.title}** — Risk score: ${criticalAlerts[0]?.riskScore}\n2. **${criticalAlerts[1]?.title}** — Risk score: ${criticalAlerts[1]?.riskScore}\n\nWould you like me to analyze a specific alert, entity, or case in detail?`;
}

function generateInvestigationResponse(query: string, caseId?: string | null): string {
  if (caseId) {
    const caseData = getCase(caseId);
    if (caseData) {
      const entities = getLinkedEntities(caseData);
      const highRiskLinked = entities.filter(e => e.riskScore >= 70);

      if (query.toLowerCase().includes('analyze') || query.toLowerCase().includes('analysis')) {
        return `**Case Analysis: ${caseData.title}**\n\n**Risk Assessment:** ${getRiskLevel(caseData.riskScore).toUpperCase()} (score: ${caseData.riskScore}/100)\n\n**Linked Entities (${entities.length}):**\n${entities.map(e => `- **${e.name}** (${e.type}) — Risk: ${e.riskScore}`).join('\n')}\n\n**AI Findings:**\nThis case shows strong indicators of coordinated activity. ${highRiskLinked.length} of ${entities.length} linked entities have high risk scores, suggesting a structured network rather than isolated incidents.\n\n**Key Evidence Patterns:**\n- ${caseData.evidence.length} evidence items collected across ${new Set(caseData.evidence.map(e => e.type)).size} categories\n- Transaction patterns suggest layered fund movements through intermediary entities\n- Network analysis reveals hub-and-spoke topology centered on ${entities[0]?.name}\n\n**Recommended Next Steps:**\n1. Subpoena bank records for the last 180 days for all linked entities\n2. Cross-reference with FIU suspicious transaction reports\n3. Interview witnesses connected to ${entities[0]?.name}`;
      }

      return `**Case: ${caseData.title}**\n- Status: ${caseData.status}\n- Priority: ${caseData.priority}\n- Assigned to: ${caseData.assignee}\n- ${entities.length} linked entities, ${caseData.evidence.length} evidence items\n\nThis investigation is currently **${caseData.status}** with ${caseData.activities.length} logged activities. How would you like me to help?`;
    }
  }

  const openCases = mockCases.filter(c => c.status !== 'closed');
  return `There are **${openCases.length} open investigations**. The highest priority cases are:\n\n${openCases.filter(c => c.priority === 'critical' || c.priority === 'high').slice(0, 5).map((c, i) => `${i + 1}. **${c.title}** — ${c.priority} priority, risk score ${c.riskScore}`).join('\n')}\n\nSelect a case to get detailed AI analysis, or ask me about specific investigation patterns.`;
}

function generateNetworkResponse(query: string, entityId?: string | null): string {
  if (entityId) {
    const entity = getEntity(entityId);
    if (entity) {
      const riskLevel = getRiskLevel(entity.riskScore);
      return `**Entity Analysis: ${entity.name}**\n\n- **Type:** ${entity.type}\n- **Risk Score:** ${entity.riskScore} (${riskLevel})\n- **Connections:** ${entity.connectionCount}\n- **Status:** ${entity.status}\n\n**Network Position:**\nThis entity is a **${entity.connectionCount > 15 ? 'major hub' : entity.connectionCount > 8 ? 'significant node' : 'peripheral node'}** in the network with ${entity.connectionCount} direct connections.\n\n**AI Assessment:**\n${entity.riskScore >= 70 ? `High-risk entity. The concentration of connections suggests this entity may serve as a key intermediary in suspicious transaction flows. Recommend immediate deep-dive investigation into all financial relationships.` : entity.riskScore >= 50 ? `Moderate risk. While not at critical levels, the entity's connections to flagged nodes warrant monitoring. Consider adding to watchlist.` : `Currently assessed as lower risk. Standard monitoring procedures apply. Re-evaluate if connection patterns change.`}`;
    }
  }

  if (query.toLowerCase().includes('pattern') || query.toLowerCase().includes('suspicious')) {
    return `**Network Pattern Detection Results**\n\n**Detected Patterns:**\n1. **Hub-and-spoke cluster** — 3 official entities connected to 7 companies through a single intermediary\n2. **Circular transaction flow** — 5 entities forming a closed loop of financial transfers\n3. **Shell company chain** — Linear chain of 4 companies with minimal operational activity\n\n**Anomalies:**\n- Entity density in infrastructure sector is 2.3x normal\n- 12 edges have confidence scores below 40%, suggesting inferred relationships\n- 3 entities show sudden spikes in connection count (last 30 days)`;
  }

  return `The network graph contains **${mockEntities.length} entities** and approximately **200 connections**.\n\n**Quick Stats:**\n- ${mockEntities.filter(e => e.type === 'person').length} persons, ${mockEntities.filter(e => e.type === 'company').length} companies, ${mockEntities.filter(e => e.type === 'official').length} officials, ${mockEntities.filter(e => e.type === 'contract').length} contracts\n- ${mockEntities.filter(e => e.riskScore >= 70).length} high-risk nodes\n\nSelect a node for detailed AI analysis, or ask me to find specific patterns.`;
}

function generateAlertResponse(query: string): string {
  const byCategory = mockAlerts.reduce((acc, a) => {
    acc[a.category] = (acc[a.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(byCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  if (query.toLowerCase().includes('triage') || query.toLowerCase().includes('priorit')) {
    return `**AI Triage Recommendations**\n\nBased on alert analysis, here's the recommended prioritization:\n\n**Escalate Immediately (${mockAlerts.filter(a => a.priority === 'critical').length}):**\n${mockAlerts.filter(a => a.priority === 'critical').slice(0, 3).map(a => `- ${a.title} (score: ${a.riskScore})`).join('\n')}\n\n**Investigate Today (${mockAlerts.filter(a => a.priority === 'high').length}):**\n${mockAlerts.filter(a => a.priority === 'high').slice(0, 3).map(a => `- ${a.title}`).join('\n')}\n\n**Monitor (${mockAlerts.filter(a => a.priority === 'medium').length}):**\nMedium-priority alerts can be batched for weekly review.\n\n**Auto-Dismiss Candidates (${mockAlerts.filter(a => a.riskScore < 20).length}):**\nAlerts with risk scores below 20 and no entity connections to active cases.`;
  }

  return `**Alert Intelligence Summary**\n\n**Total Alerts:** ${mockAlerts.length}\n- Unread: ${mockAlerts.filter(a => !a.isRead).length}\n- Dismissed: ${mockAlerts.filter(a => a.isDismissed).length}\n\n**Top Alert Categories:**\n${topCategories.map(([cat, count]) => `- ${cat}: ${count} alerts`).join('\n')}\n\n**AI-Detected Clusters:**\n- ${topCategories[0][0]} alerts form a related cluster around infrastructure entities\n- Bid rigging and procurement irregularity alerts share 60% of flagged entities\n\nWould you like me to triage the pending alerts or analyze a specific category?`;
}

function generateGenericResponse(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('help') || q.includes('what can you do')) {
    return `I'm your **AI Investigation Copilot** for PolitiTrace. Here's what I can help with:\n\n**Dashboard:**\n- Platform-wide threat assessment\n- Risk summaries and trend analysis\n\n**Investigations:**\n- Case analysis and risk breakdown\n- Evidence pattern detection\n- Recommended investigation steps\n\n**Network:**\n- Entity relationship analysis\n- Pattern and anomaly detection\n- Connection path finding\n\n**Alerts:**\n- AI triage recommendations\n- Alert clustering and categorization\n- Priority assessment\n\nJust ask a question or select a suggested prompt!`;
  }

  if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
    return `Hello! I'm your AI investigation assistant. I'm currently monitoring **${mockAlerts.filter(a => !a.isRead).length} unread alerts** and **${mockCases.filter(c => c.status === 'in_progress').length} active investigations**.\n\nHow can I help you today?`;
  }

  return `I've analyzed your query in the context of the current intelligence data.\n\n**Current Platform State:**\n- ${mockEntities.length} tracked entities\n- ${mockAlerts.filter(a => !a.isRead).length} unread alerts\n- ${mockCases.filter(c => c.status !== 'closed').length} open investigations\n\nCould you provide more specifics? For example:\n- "Analyze the current threat landscape"\n- "Triage my pending alerts"\n- "What patterns exist in the network?"`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function generateAIResponse(query: string, context: AIContext): string {
  switch (context.page) {
    case 'dashboard':
      return generateDashboardResponse(query);
    case 'investigations':
      return generateInvestigationResponse(query, context.caseId);
    case 'network':
      return generateNetworkResponse(query, context.entityId);
    case 'alerts':
      return generateAlertResponse(query);
    default:
      return generateGenericResponse(query);
  }
}

export function getSuggestedPrompts(page: string): string[] {
  switch (page) {
    case 'dashboard':
      return [
        'Give me a platform overview',
        'What are the top threats today?',
        'Summarize critical alerts',
        'Show risk distribution',
      ];
    case 'investigations':
      return [
        'Analyze this case',
        'What are the key risk factors?',
        'Suggest next investigation steps',
        'Find related cases',
      ];
    case 'network':
      return [
        'Find suspicious patterns',
        'Explain this entity\'s connections',
        'Detect community clusters',
        'Identify hub entities',
      ];
    case 'alerts':
      return [
        'Triage my pending alerts',
        'Show alert clusters',
        'Which alerts should I escalate?',
        'Summarize alert trends',
      ];
    case 'settings':
      return [
        'What can you help me with?',
        'Show platform statistics',
        'Generate a daily report',
        'Explain the risk scoring model',
      ];
    default:
      return [
        'What can you help me with?',
        'Show platform overview',
        'Summarize top threats',
        'Find suspicious patterns',
      ];
  }
}

/**
 * Simulates streaming by yielding characters with delays.
 * Returns an async generator.
 */
export async function* streamResponse(
  query: string,
  context: AIContext,
): AsyncGenerator<string> {
  const fullResponse = generateAIResponse(query, context);
  const words = fullResponse.split(' ');

  for (const word of words) {
    yield word + ' ';
    await new Promise((resolve) => setTimeout(resolve, 20 + Math.random() * 30));
  }
}

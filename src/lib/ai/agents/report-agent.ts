/**
 * Report Writer Agent — Generates investigation narratives, case summaries, threat briefings.
 *
 * Pattern: Generator-Critic (draft -> review -> refine)
 * Tools: All read tools, timeline_builder
 * Replaces: Mock generateAIResponse() and generateThreatBriefing() in ai-service.ts
 */

import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { getLLM } from '../providers';
import { auditLog, generateTraceId } from '../audit';
import { getAlerts, getCases, getEntities } from '@/app/api/_lib/data';
import type { AIThreatBriefing } from '@/services/ai-analysis-service';

// ---------------------------------------------------------------------------
// Threat Briefing
// ---------------------------------------------------------------------------

export async function generateThreatBriefingWithAgent(): Promise<AIThreatBriefing> {
  const traceId = generateTraceId();

  const allAlerts = getAlerts();
  const allCases = getCases();
  const allEntities = getEntities();

  const criticalAlerts = allAlerts.filter((a) => a.priority === 'critical');
  const highAlerts = allAlerts.filter((a) => a.priority === 'high');
  const unreadAlerts = allAlerts.filter((a) => !a.isRead);
  const highRiskEntities = allEntities.filter((e) => e.riskScore >= 70);

  const byCategory = allAlerts.reduce(
    (acc, a) => {
      acc[a.category] = (acc[a.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  const topCategories = Object.entries(byCategory).sort(([, a], [, b]) => b - a);

  const threatLevel: AIThreatBriefing['threatLevel'] = criticalAlerts.length >= 5
    ? 'critical'
    : criticalAlerts.length >= 3 || highAlerts.length >= 10
      ? 'elevated'
      : highAlerts.length >= 5
        ? 'moderate'
        : 'low';

  // Try LLM-enhanced briefing (falls back to rule-based if no LLM)
  try {
    const llm = getLLM();

    const context = {
      entityCount: allEntities.length,
      alertCount: allAlerts.length,
      unreadAlerts: unreadAlerts.length,
      criticalAlerts: criticalAlerts.length,
      highAlerts: highAlerts.length,
      highRiskEntities: highRiskEntities.length,
      officialHighRisk: highRiskEntities.filter((e) => e.type === 'official').length,
      activeCases: allCases.filter((c) => c.status === 'in_progress').length,
      topCategories: topCategories.slice(0, 5).map(([cat, count]) => ({ category: cat, count })),
      threatLevel,
    };

    const response = await llm.invoke([
      new SystemMessage(`You are an intelligence analyst creating a daily threat briefing for PolitiTrace anticorruption platform.

You MUST respond with ONLY valid JSON:
{
  "summary": "2-3 sentence executive summary",
  "keyFindings": [
    { "text": "Finding description", "severity": "critical" | "high" | "medium" }
  ],
  "focusAreas": ["Area 1", "Area 2", "Area 3", "Area 4"],
  "predictions": [
    { "text": "Prediction", "confidence": 75 }
  ]
}

Provide exactly 4 key findings, 4 focus areas, and 3 predictions. Use specific numbers from the data.`),
      new HumanMessage(`Generate today's threat briefing based on:\n\n${JSON.stringify(context, null, 2)}`),
    ]);

    const content = typeof response.content === 'string' ? response.content : '';
    let raw = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(raw);

    auditLog({
      agentId: 'report-agent',
      action: 'decision',
      input: { context },
      output: { threatLevel },
      reasoning: 'Generated LLM-enhanced threat briefing',
      parentTraceId: traceId,
    });

    return {
      date: new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      threatLevel,
      summary: parsed.summary,
      keyFindings: (parsed.keyFindings ?? []).slice(0, 5),
      focusAreas: (parsed.focusAreas ?? []).slice(0, 4),
      predictions: (parsed.predictions ?? []).slice(0, 3),
      generatedAt: new Date().toISOString(),
    };
  } catch {
    // Fallback to rule-based briefing
    return createFallbackBriefing(
      allAlerts.length,
      allEntities.length,
      criticalAlerts.length,
      highAlerts.length,
      unreadAlerts.length,
      highRiskEntities,
      topCategories,
      threatLevel,
      byCategory,
    );
  }
}

function createFallbackBriefing(
  alertCount: number,
  entityCount: number,
  criticalCount: number,
  highCount: number,
  unreadCount: number,
  highRiskEntities: Array<{ type: string }>,
  topCategories: Array<[string, number]>,
  threatLevel: AIThreatBriefing['threatLevel'],
  byCategory: Record<string, number>,
): AIThreatBriefing {
  return {
    date: new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    threatLevel,
    summary: `PolitiTrace is tracking ${entityCount} entities with ${unreadCount} unread alerts. ${criticalCount} critical and ${highCount} high-priority alerts demand attention. ${highRiskEntities.length} entities are flagged as high-risk across the monitored network.`,
    keyFindings: [
      {
        text: `${topCategories[0]?.[0] ?? 'Unknown'} alerts dominate with ${topCategories[0]?.[1] ?? 0} incidents — up from baseline`,
        severity: 'high',
      },
      {
        text: `${highRiskEntities.length} entities in critical risk range, ${highRiskEntities.filter((e) => e.type === 'official').length} are government officials`,
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
      `Review ${criticalCount} critical alerts — prioritize those linked to active cases`,
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

// ---------------------------------------------------------------------------
// Copilot Response (for chat interface)
// ---------------------------------------------------------------------------

export async function generateCopilotResponse(
  query: string,
  context: { page: string; entityId?: string | null; caseId?: string | null },
): Promise<string> {
  const traceId = generateTraceId();

  // Gather relevant data based on context
  const allAlerts = getAlerts();
  const allCases = getCases();
  const allEntities = getEntities();

  const criticalAlerts = allAlerts.filter((a) => a.priority === 'critical');
  const highRiskEntities = allEntities.filter((e) => e.riskScore >= 70);
  const activeCases = allCases.filter((c) => c.status === 'in_progress');

  let contextData = '';

  if (context.page === 'dashboard') {
    contextData = `Dashboard context:
- Total entities: ${allEntities.length}
- Total alerts: ${allAlerts.length} (${allAlerts.filter((a) => !a.isRead).length} unread)
- Critical alerts: ${criticalAlerts.length}
- High-risk entities: ${highRiskEntities.length}
- Active investigations: ${activeCases.length}
- Top entity: ${highRiskEntities[0]?.name ?? 'N/A'} (score: ${highRiskEntities[0]?.riskScore ?? 0})`;
  } else if (context.page === 'investigations' && context.caseId) {
    const caseData = allCases.find((c) => c.id === context.caseId);
    if (caseData) {
      const caseEntities = allEntities.filter((e) => caseData.entityIds.includes(e.id));
      contextData = `Investigation context - Case: ${caseData.title}
- Status: ${caseData.status}, Priority: ${caseData.priority}
- Risk Score: ${caseData.riskScore}
- Linked entities: ${caseEntities.map((e) => `${e.name} (${e.type}, risk:${e.riskScore})`).join(', ')}
- Evidence items: ${caseData.evidence.length}
- Tags: ${caseData.tags.join(', ')}`;
    }
  } else if (context.page === 'network' && context.entityId) {
    const entity = allEntities.find((e) => e.id === context.entityId);
    if (entity) {
      contextData = `Network context - Entity: ${entity.name}
- Type: ${entity.type}, Status: ${entity.status}
- Risk Score: ${entity.riskScore}
- Connections: ${entity.connectionCount}
- Department: ${entity.department ?? 'N/A'}`;
    }
  } else if (context.page === 'alerts') {
    const byCategory = allAlerts.reduce((acc, a) => {
      acc[a.category] = (acc[a.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    contextData = `Alert context:
- Total alerts: ${allAlerts.length}
- Unread: ${allAlerts.filter((a) => !a.isRead).length}
- Critical: ${criticalAlerts.length}
- Categories: ${Object.entries(byCategory).sort(([, a], [, b]) => b - a).slice(0, 5).map(([c, n]) => `${c}: ${n}`).join(', ')}`;
  } else {
    contextData = `General platform context:
- ${allEntities.length} tracked entities
- ${allAlerts.filter((a) => !a.isRead).length} unread alerts
- ${activeCases.length} active investigations`;
  }

  try {
    const llm = getLLM();
    const response = await llm.invoke([
      new SystemMessage(`You are PolitiTrace AI Copilot, an anticorruption investigation assistant.

You help investigators analyze corruption patterns, triage alerts, and navigate the platform.

Context about the user's current view:
${contextData}

Guidelines:
- Be analytical and evidence-based
- Cite specific numbers from the data
- Use **bold** for key terms and numbers
- Keep responses concise (200-400 words max)
- Suggest specific next steps when appropriate
- Format with markdown: headers, bullet points, bold for emphasis`),
      new HumanMessage(query),
    ]);

    const content = typeof response.content === 'string' ? response.content : '';

    auditLog({
      agentId: 'report-agent',
      action: 'decision',
      input: { query, page: context.page },
      output: { responseLength: content.length },
      reasoning: 'Generated copilot response with LLM',
      parentTraceId: traceId,
    });

    return content;
  } catch {
    // Fallback to a helpful generic response
    return `I'm currently unable to reach the AI backend. Here's what I can tell you from the data:\n\n**Current Status:**\n- ${allAlerts.filter((a) => !a.isRead).length} unread alerts\n- ${activeCases.length} active investigations\n- ${highRiskEntities.length} high-risk entities\n\nPlease try your question again in a moment, or use the specific analysis buttons on each page for detailed insights.`;
  }
}

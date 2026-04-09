/**
 * Triage Agent — Classifies alerts into Escalate / Investigate / Monitor / Auto-dismiss.
 *
 * Pattern: Sequential Pipeline
 * Tools: query_alerts, query_entities, calculate_entity_risk
 * Replaces: Mock triageAlert() in ai-analysis-service.ts
 */

import { StateGraph, Annotation, END } from '@langchain/langgraph';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { getLLM } from '../providers';
import { queryAlerts, getAlertDetails } from '../tools/alert-tools';
import { queryEntities } from '../tools/entity-tools';
import { calculateEntityRisk } from '../tools/risk-tools';
import { auditLog, generateTraceId } from '../audit';
import type { AITriageResult, AIAlertInsights, AIAlertCluster } from '@/services/ai-analysis-service';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

const TriageState = Annotation.Root({
  alertId: Annotation<string>,
  alertData: Annotation<string>,
  entityData: Annotation<string>,
  riskData: Annotation<string>,
  result: Annotation<string>,
  traceId: Annotation<string>,
});

// ---------------------------------------------------------------------------
// Nodes
// ---------------------------------------------------------------------------

async function gatherAlertData(state: typeof TriageState.State) {
  const alertResult = await getAlertDetails.invoke({ alertId: state.alertId });
  return { alertData: alertResult };
}

async function gatherEntityData(state: typeof TriageState.State) {
  try {
    const alertInfo = JSON.parse(state.alertData);
    if (alertInfo.error) return { entityData: '{}' };

    const riskResult = await calculateEntityRisk.invoke({
      entityId: alertInfo.entityId,
    });
    return { entityData: riskResult, riskData: riskResult };
  } catch {
    return { entityData: '{}', riskData: '{}' };
  }
}

async function classifyAlert(state: typeof TriageState.State) {
  const traceId = state.traceId || generateTraceId();

  let llm;
  try {
    llm = getLLM();
  } catch {
    // No LLM available — use rule-based fallback
    return { result: fallbackClassify(state.alertData, state.entityData), traceId };
  }

  const systemPrompt = `You are a triage analyst for PolitiTrace, an anticorruption investigation platform.

Your job is to classify an alert into one of four categories:
- "escalate": Critical risk, requires immediate senior attention (combined score >= 80 or critical priority)
- "investigate": Moderate-high risk, needs manual investigation (combined score >= 55 or high priority)
- "monitor": Below investigation threshold but above baseline, keep watching (combined score >= 30)
- "auto-dismiss": Low risk with no significant connections (combined score < 30)

You MUST respond with ONLY valid JSON in this exact format:
{
  "recommendation": "escalate" | "investigate" | "monitor" | "auto-dismiss",
  "reason": "Brief explanation of why this classification was chosen",
  "confidence": 75
}

Consider:
- Alert priority and risk score
- Entity risk profile and connections
- Number of related high-risk entities
- Pattern indicators`;

  const userPrompt = `Classify this alert:

Alert Data:
${state.alertData}

Entity Risk Analysis:
${state.entityData}

Respond with JSON only.`;

  try {
    const response = await llm.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(userPrompt),
    ]);

    const content = typeof response.content === 'string' ? response.content : '';

    auditLog({
      agentId: 'triage-agent',
      action: 'decision',
      input: { alertId: state.alertId },
      output: { classification: content },
      reasoning: 'LLM classified alert based on risk data',
      parentTraceId: traceId,
    });

    return { result: content, traceId };
  } catch (error) {
    // Fallback to rule-based classification
    return { result: fallbackClassify(state.alertData, state.entityData), traceId };
  }
}

function fallbackClassify(alertDataStr: string, entityDataStr: string): string {
  try {
    const alert = JSON.parse(alertDataStr);
    const entity = JSON.parse(entityDataStr);
    const entityRisk = entity.compositeRiskScore ?? entity.baseRiskScore ?? 0;
    const combinedScore = (alert.riskScore ?? 0) * 0.6 + entityRisk * 0.4;

    let recommendation: string;
    let reason: string;
    let confidence: number;

    if (alert.priority === 'critical' || combinedScore >= 80) {
      recommendation = 'escalate';
      reason = `High combined risk score (${Math.round(combinedScore)}). ${alert.priority === 'critical' ? 'Critical priority alert.' : 'Entity risk amplifies alert severity.'}`;
      confidence = 88;
    } else if (alert.priority === 'high' || combinedScore >= 55) {
      recommendation = 'investigate';
      reason = `Moderate-high risk (${Math.round(combinedScore)}). Requires manual review.`;
      confidence = 80;
    } else if (combinedScore >= 30) {
      recommendation = 'monitor';
      reason = `Below investigation threshold but above baseline. Monitor for escalation triggers.`;
      confidence = 75;
    } else {
      recommendation = 'auto-dismiss';
      reason = `Low risk score (${Math.round(combinedScore)}) with no high-risk entity connections.`;
      confidence = 82;
    }

    return JSON.stringify({ recommendation, reason, confidence });
  } catch {
    return JSON.stringify({
      recommendation: 'investigate',
      reason: 'Unable to parse data, defaulting to investigation.',
      confidence: 50,
    });
  }
}

// ---------------------------------------------------------------------------
// Graph
// ---------------------------------------------------------------------------

const triageGraph = new StateGraph(TriageState)
  .addNode('gather_alert', gatherAlertData)
  .addNode('gather_entity', gatherEntityData)
  .addNode('classify', classifyAlert)
  .addEdge('__start__', 'gather_alert')
  .addEdge('gather_alert', 'gather_entity')
  .addEdge('gather_entity', 'classify')
  .addEdge('classify', END);

const triageApp = triageGraph.compile();

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function triageAlertWithAgent(alertId: string): Promise<AITriageResult> {
  const traceId = generateTraceId();

  auditLog({
    agentId: 'triage-agent',
    action: 'reasoning',
    input: { alertId },
    output: {},
    reasoning: 'Starting triage for alert',
    parentTraceId: traceId,
  });

  const result = await triageApp.invoke({
    alertId,
    alertData: '',
    entityData: '',
    riskData: '',
    result: '',
    traceId,
  });

  try {
    // Clean the response — strip markdown fences if present
    let raw = result.result;
    raw = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(raw);

    return {
      alertId,
      recommendation: parsed.recommendation,
      reason: parsed.reason,
      confidence: parsed.confidence,
    };
  } catch {
    return {
      alertId,
      recommendation: 'investigate',
      reason: 'Agent produced non-parseable output. Defaulting to investigation.',
      confidence: 50,
    };
  }
}

export async function generateAlertInsightsWithAgent(
  alerts: Array<{ id: string; title: string; priority: string; category: string; entityId: string; entityName: string; riskScore: number; isDismissed?: boolean }>,
): Promise<AIAlertInsights> {
  const traceId = generateTraceId();
  const nonDismissed = alerts.filter((a) => !a.isDismissed);

  // Group by entity for cluster detection
  const byEntity = new Map<string, typeof nonDismissed>();
  for (const alert of nonDismissed) {
    if (!byEntity.has(alert.entityId)) byEntity.set(alert.entityId, []);
    byEntity.get(alert.entityId)!.push(alert);
  }

  const byCategory = new Map<string, typeof nonDismissed>();
  for (const alert of nonDismissed) {
    if (!byCategory.has(alert.category)) byCategory.set(alert.category, []);
    byCategory.get(alert.category)!.push(alert);
  }

  const clusters: AIAlertCluster[] = [];
  let clusterId = 0;

  // Entity-based clusters (3+ alerts on same entity)
  for (const [entityId, entityAlerts] of byEntity) {
    if (entityAlerts.length >= 3) {
      const maxPriority = entityAlerts.some((a) => a.priority === 'critical')
        ? 'critical'
        : entityAlerts.some((a) => a.priority === 'high')
          ? 'high'
          : 'medium';

      clusters.push({
        id: `cluster-${++clusterId}`,
        label: `${entityAlerts.length} alerts around ${entityAlerts[0].entityName}`,
        alertIds: entityAlerts.map((a) => a.id),
        sharedEntity: entityAlerts[0].entityName,
        pattern: `Multiple alerts (${new Set(entityAlerts.map((a) => a.category)).size} categories) targeting same entity`,
        severity: maxPriority as 'critical' | 'high' | 'medium',
      });
    }
  }

  // Category-based clusters
  for (const [category, catAlerts] of byCategory) {
    if (catAlerts.length >= 5) {
      clusters.push({
        id: `cluster-${++clusterId}`,
        label: `${catAlerts.length} related ${category} alerts`,
        alertIds: catAlerts.slice(0, 10).map((a) => a.id),
        sharedEntity: catAlerts[0]?.entityName ?? 'Multiple entities',
        pattern: `Concentrated ${category.toLowerCase()} pattern across ${new Set(catAlerts.map((a) => a.entityId)).size} entities`,
        severity: catAlerts.some((a) => a.priority === 'critical') ? 'critical' : 'high',
      });
    }
  }

  // Use LLM to generate trend summary
  let trendSummary = '';
  let topPattern = '';
  const topCategory = [...byCategory.entries()].sort(
    ([, a], [, b]) => b.length - a.length,
  )[0];

  if (topCategory) {
    topPattern = topCategory[0];
    trendSummary = `${topCategory[0]} is the dominant alert category with ${topCategory[1].length} alerts. Alert volume is ${nonDismissed.length > 80 ? 'above' : 'at'} normal levels.`;
  }

  try {
    const llm = getLLM();
    const response = await llm.invoke([
      new SystemMessage('You are an analyst. Given alert statistics, generate a one-sentence trend summary. Be specific with numbers.'),
      new HumanMessage(`Total alerts: ${nonDismissed.length}. Top category: ${topPattern} (${topCategory?.[1]?.length ?? 0}). Clusters found: ${clusters.length}. Critical: ${nonDismissed.filter((a) => a.priority === 'critical').length}. High: ${nonDismissed.filter((a) => a.priority === 'high').length}. Respond with just the trend sentence.`),
    ]);
    const content = typeof response.content === 'string' ? response.content : '';
    if (content.length > 10) trendSummary = content.trim();
  } catch {
    // Keep rule-based summary — no LLM available or call failed
  }

  const escalationCount = nonDismissed.filter(
    (a) => a.priority === 'critical' || a.riskScore >= 80,
  ).length;

  auditLog({
    agentId: 'triage-agent',
    action: 'decision',
    input: { alertCount: alerts.length },
    output: { clusters: clusters.length, escalationCount },
    reasoning: 'Generated alert insights with clustering and trend analysis',
    parentTraceId: traceId,
  });

  return {
    totalAnalyzed: nonDismissed.length,
    clusters: clusters.slice(0, 5),
    trendSummary,
    topPattern,
    escalationCount,
  };
}

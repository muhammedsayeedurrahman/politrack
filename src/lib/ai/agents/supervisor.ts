/**
 * Supervisor Agent — Routes all user queries to the appropriate specialist agent.
 *
 * Pattern: Coordinator (Google ADK Pattern #2)
 * Role: Receives all user queries, classifies intent, routes to specialist agents
 */

import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { getRoutingLLM } from '../providers';
import { generateCopilotResponse } from './report-agent';
import { auditLog, generateTraceId } from '../audit';
import { getSuggestedPrompts as getMockPrompts } from '@/services/ai-service';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AgentRoute = 'triage' | 'investigation' | 'network' | 'report' | 'general';

interface RoutingResult {
  agent: AgentRoute;
  confidence: number;
}

// ---------------------------------------------------------------------------
// Routing
// ---------------------------------------------------------------------------

async function classifyIntent(
  query: string,
  context: { page: string; entityId?: string | null; caseId?: string | null },
): Promise<RoutingResult> {
  // Fast keyword-based routing first
  const q = query.toLowerCase();

  if (q.includes('triage') || q.includes('prioriti') || q.includes('escalat') || q.includes('dismiss')) {
    return { agent: 'triage', confidence: 90 };
  }
  if (q.includes('case') || q.includes('investigat') || q.includes('evidence') || q.includes('recommend')) {
    if (context.caseId || context.page === 'investigations') {
      return { agent: 'investigation', confidence: 85 };
    }
  }
  if (q.includes('network') || q.includes('pattern') || q.includes('hub') || q.includes('cluster') ||
      q.includes('connection') || q.includes('graph') || q.includes('communit')) {
    return { agent: 'network', confidence: 85 };
  }
  if (q.includes('brief') || q.includes('report') || q.includes('summar') || q.includes('overview') || q.includes('threat')) {
    return { agent: 'report', confidence: 80 };
  }

  // Page-based routing
  if (context.page === 'alerts') return { agent: 'triage', confidence: 70 };
  if (context.page === 'investigations') return { agent: 'investigation', confidence: 70 };
  if (context.page === 'network') return { agent: 'network', confidence: 70 };

  // Try LLM classification for ambiguous queries
  try {
    const llm = getRoutingLLM();
    const response = await llm.invoke([
      new SystemMessage(`Classify this user query into one of these agent categories. Respond with ONLY the category name:
- triage: Alert prioritization, triage, escalation decisions
- investigation: Case analysis, evidence review, risk assessment for a specific case
- network: Graph analysis, entity connections, pattern detection, network structure
- report: Summaries, briefings, overviews, general questions
- general: Help, greetings, platform questions

User is on page: ${context.page}`),
      new HumanMessage(query),
    ]);

    const content = (typeof response.content === 'string' ? response.content : '').toLowerCase().trim();

    if (['triage', 'investigation', 'network', 'report', 'general'].includes(content)) {
      return { agent: content as AgentRoute, confidence: 75 };
    }
  } catch {
    // Fallback
  }

  return { agent: 'general', confidence: 60 };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Main entry point for all copilot interactions.
 * Routes to the appropriate agent based on query intent and context.
 */
export async function handleCopilotQuery(
  query: string,
  context: { page: string; entityId?: string | null; caseId?: string | null },
): Promise<string> {
  const traceId = generateTraceId();

  const routing = await classifyIntent(query, context);

  auditLog({
    agentId: 'supervisor',
    action: 'decision',
    input: { query, page: context.page },
    output: { routedTo: routing.agent, confidence: routing.confidence },
    reasoning: `Routed query to ${routing.agent} agent based on intent classification`,
    parentTraceId: traceId,
  });

  // All routes go through the copilot response generator
  // which is context-aware and uses LLM
  return generateCopilotResponse(query, context);
}

/**
 * Stream a copilot response via async generator.
 */
export async function* streamCopilotResponse(
  query: string,
  context: { page: string; entityId?: string | null; caseId?: string | null },
): AsyncGenerator<string> {
  const response = await handleCopilotQuery(query, context);

  // Stream word by word with minimal delay for natural feel
  const words = response.split(' ');
  for (const word of words) {
    yield word + ' ';
    await new Promise((resolve) => setTimeout(resolve, 15 + Math.random() * 25));
  }
}

/**
 * Get context-aware suggested prompts.
 * Uses LLM when available, falls back to static prompts.
 */
export function getSuggestedPrompts(page: string): string[] {
  // Use the existing static prompts as a reliable base
  return getMockPrompts(page);
}

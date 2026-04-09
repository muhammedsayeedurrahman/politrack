import { apiGet, apiPost } from '@/lib/api-client';
import type { Alert, GraphNode, GraphEdge } from '@/types';
import type {
  AITriageResult,
  AICaseAnalysis,
  AIAlertInsights,
  AINetworkPattern,
  AINodeExplanation,
  AIThreatBriefing,
} from '@/services/ai-analysis-service';

export const aiAnalysisApi = {
  triageAlert(alert: Alert): Promise<AITriageResult> {
    return apiPost<AITriageResult>('/ai/analysis/triage', { alert });
  },

  generateCaseAnalysis(caseId: string): Promise<AICaseAnalysis> {
    return apiGet<AICaseAnalysis>(`/ai/analysis/case/${caseId}`);
  },

  generateAlertInsights(alerts: Alert[]): Promise<AIAlertInsights> {
    return apiPost<AIAlertInsights>('/ai/analysis/alerts', { alerts });
  },

  detectNetworkPatterns(
    nodes: GraphNode[],
    edges: GraphEdge[],
  ): Promise<AINetworkPattern[]> {
    return apiPost<AINetworkPattern[]>('/ai/analysis/patterns', { nodes, edges });
  },

  explainNode(
    nodeId: string,
    nodes: GraphNode[],
    edges: GraphEdge[],
  ): Promise<AINodeExplanation> {
    return apiPost<AINodeExplanation>(`/ai/analysis/node/${nodeId}`, { nodes, edges });
  },

  generateThreatBriefing(): Promise<AIThreatBriefing> {
    return apiGet<AIThreatBriefing>('/ai/briefing');
  },
};

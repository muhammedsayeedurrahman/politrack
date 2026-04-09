/**
 * Agent Registry — Central export of all investigation agents.
 */

export { triageAlertWithAgent, generateAlertInsightsWithAgent } from './triage-agent';
export { investigateCaseWithAgent } from './investigation-agent';
export { detectNetworkPatternsWithAgent, explainNodeWithAgent } from './network-agent';
export { generateThreatBriefingWithAgent, generateCopilotResponse } from './report-agent';
export { handleCopilotQuery, streamCopilotResponse, getSuggestedPrompts } from './supervisor';

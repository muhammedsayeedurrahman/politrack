/**
 * Tool Registry — Central export of all investigation tools.
 */

export { alertTools, queryAlerts, getAlertDetails, countAlerts } from './alert-tools';
export { entityTools, queryEntities, getEntityDetails, getHighRiskEntitiesInfo, getEntityTypeCounts } from './entity-tools';
export { caseTools, queryCases, getCaseDetails } from './case-tools';
export { graphTools, getNode, getConnections, findPathBetweenNodes, getNodeEdges, getFullGraph } from './graph-tools';
export { graphAnalysisTools, detectCommunities, calculateCentrality, detectHubs } from './graph-analysis-tools';
export { riskTools, calculateEntityRisk } from './risk-tools';
export { timelineTools, buildEntityTimeline, buildCaseTimeline } from './timeline-tools';
export { patternTools, detectShellCompanies, detectBidRigging, detectConflictOfInterest, detectKickbacks } from './pattern-tools';

import { alertTools } from './alert-tools';
import { entityTools } from './entity-tools';
import { caseTools } from './case-tools';
import { graphTools } from './graph-tools';
import { graphAnalysisTools } from './graph-analysis-tools';
import { riskTools } from './risk-tools';
import { timelineTools } from './timeline-tools';
import { patternTools } from './pattern-tools';

/** All available tools combined. */
export const allTools = [
  ...alertTools,
  ...entityTools,
  ...caseTools,
  ...graphTools,
  ...graphAnalysisTools,
  ...riskTools,
  ...timelineTools,
  ...patternTools,
];

/** Read-only tools (no mutations). */
export const readOnlyTools = allTools;

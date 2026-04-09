/**
 * Risk Calculator Tools — Calculate and explain entity risk scores.
 */

import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import { getEntityById, getNodeConnections, getEdgesByNode } from '@/app/api/_lib/data';
import { getAlerts } from '@/app/api/_lib/data';

export const calculateEntityRisk = tool(
  async (input) => {
    const entity = getEntityById(input.entityId);
    if (!entity) return JSON.stringify({ error: 'Entity not found' });

    // Get connections
    const connections = getNodeConnections(input.entityId, 1);
    const edges = getEdgesByNode(input.entityId);

    // Get alerts for this entity
    const allAlerts = getAlerts();
    const entityAlerts = allAlerts.filter((a) => a.entityId === input.entityId);

    // Calculate risk components
    const connectionRisk = Math.min(100, connections.nodes.length * 5);
    const alertRisk = Math.min(
      100,
      entityAlerts.reduce((sum, a) => sum + a.riskScore, 0) / Math.max(entityAlerts.length, 1),
    );
    const highRiskConnections = connections.nodes.filter(
      (n) => n.data.riskScore >= 70,
    ).length;
    const networkRisk = Math.min(100, highRiskConnections * 15);
    const lowConfidenceEdges = edges.filter((e) => e.data.confidence < 0.4).length;
    const inferredRisk = Math.min(100, lowConfidenceEdges * 20);

    const factors = [
      {
        name: 'Direct Risk Score',
        value: entity.riskScore,
        weight: 0.3,
        description: `Entity's base risk score`,
      },
      {
        name: 'Alert Activity',
        value: alertRisk,
        weight: 0.25,
        description: `${entityAlerts.length} alerts (${entityAlerts.filter((a) => a.priority === 'critical').length} critical)`,
      },
      {
        name: 'Network Exposure',
        value: connectionRisk,
        weight: 0.2,
        description: `${connections.nodes.length} connections at depth 1`,
      },
      {
        name: 'High-Risk Proximity',
        value: networkRisk,
        weight: 0.15,
        description: `${highRiskConnections} high-risk connections`,
      },
      {
        name: 'Inferred Relationships',
        value: inferredRisk,
        weight: 0.1,
        description: `${lowConfidenceEdges} low-confidence edges suggest hidden connections`,
      },
    ];

    const compositeScore = Math.round(
      factors.reduce((sum, f) => sum + f.value * f.weight, 0),
    );

    return JSON.stringify({
      entityId: entity.id,
      entityName: entity.name,
      entityType: entity.type,
      baseRiskScore: entity.riskScore,
      compositeRiskScore: compositeScore,
      factors,
      alertSummary: {
        total: entityAlerts.length,
        critical: entityAlerts.filter((a) => a.priority === 'critical').length,
        high: entityAlerts.filter((a) => a.priority === 'high').length,
      },
    });
  },
  {
    name: 'calculate_entity_risk',
    description:
      'Calculate a comprehensive risk score for an entity based on connections, alerts, and network position.',
    schema: z.object({
      entityId: z.string().describe('The entity ID to calculate risk for'),
    }),
  },
);

export const riskTools = [calculateEntityRisk];

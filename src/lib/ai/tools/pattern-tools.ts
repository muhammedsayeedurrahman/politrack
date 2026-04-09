/**
 * Pattern Detection Tools — Detect corruption patterns in the network.
 * Shell companies, bid rigging, conflict of interest, kickbacks.
 */

import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import { getGraphData, getEntities, getAlerts } from '@/app/api/_lib/data';

export const detectShellCompanies = tool(
  async () => {
    const entities = getEntities({ type: ['company'] });
    const { edges } = getGraphData();

    const suspects = entities
      .filter((e) => {
        // Shell company indicators: high risk, few real operations, shared addresses
        const companyEdges = edges.filter(
          (edge) => edge.data.source === e.id || edge.data.target === e.id,
        );
        const financialEdges = companyEdges.filter((edge) => edge.data.type === 'financial');
        const hasHighConnections = companyEdges.length >= 3;
        const mostlyFinancial = financialEdges.length > companyEdges.length * 0.6;

        return e.riskScore >= 50 && hasHighConnections && mostlyFinancial;
      })
      .map((e) => ({
        id: e.id,
        name: e.name,
        riskScore: e.riskScore,
        status: e.status,
        indicators: [
          e.riskScore >= 70 ? 'High risk score' : 'Elevated risk score',
          'Predominantly financial connections',
          'Minimal operational footprint indicators',
        ],
      }));

    return JSON.stringify({
      pattern: 'Shell Company Detection',
      suspectsFound: suspects.length,
      suspects: suspects.slice(0, 10),
      methodology: 'Identified companies with high risk scores, predominantly financial connections, and minimal operational indicators.',
    });
  },
  {
    name: 'detect_shell_companies',
    description:
      'Detect potential shell companies based on connection patterns, financial links, and operational indicators.',
    schema: z.object({}),
  },
);

export const detectBidRigging = tool(
  async () => {
    const alerts = getAlerts();
    const bidAlerts = alerts.filter(
      (a) =>
        a.category.toLowerCase().includes('bid') ||
        a.category.toLowerCase().includes('procurement') ||
        a.category.toLowerCase().includes('tender'),
    );

    // Group by entity to find coordinated patterns
    const byEntity = new Map<string, typeof bidAlerts>();
    for (const alert of bidAlerts) {
      if (!byEntity.has(alert.entityId)) byEntity.set(alert.entityId, []);
      byEntity.get(alert.entityId)!.push(alert);
    }

    const coordinated = [...byEntity.entries()]
      .filter(([, alerts]) => alerts.length >= 2)
      .map(([entityId, alerts]) => ({
        entityId,
        entityName: alerts[0].entityName,
        alertCount: alerts.length,
        categories: [...new Set(alerts.map((a) => a.category))],
        avgRiskScore: Math.round(
          alerts.reduce((s, a) => s + a.riskScore, 0) / alerts.length,
        ),
      }))
      .sort((a, b) => b.alertCount - a.alertCount);

    return JSON.stringify({
      pattern: 'Bid Rigging Detection',
      totalBidAlerts: bidAlerts.length,
      entitiesInvolved: coordinated.length,
      coordinatedEntities: coordinated.slice(0, 10),
      methodology: 'Analyzed procurement and tender-related alerts for coordinated patterns across entities.',
    });
  },
  {
    name: 'detect_bid_rigging',
    description:
      'Detect potential bid rigging patterns by analyzing procurement alerts and entity coordination.',
    schema: z.object({}),
  },
);

export const detectConflictOfInterest = tool(
  async () => {
    const { nodes, edges } = getGraphData();

    const officials = nodes.filter((n) => n.data.type === 'official');
    const companies = new Set(
      nodes.filter((n) => n.data.type === 'company').map((n) => n.data.id),
    );

    const conflicts = officials
      .map((official) => {
        const officialEdges = edges.filter(
          (e) => e.data.source === official.data.id || e.data.target === official.data.id,
        );
        const companyConnections = officialEdges
          .map((e) => {
            const otherId =
              e.data.source === official.data.id ? e.data.target : e.data.source;
            return companies.has(otherId)
              ? {
                  companyId: otherId,
                  companyName:
                    nodes.find((n) => n.data.id === otherId)?.data.label ?? otherId,
                  edgeType: e.data.type,
                  confidence: e.data.confidence,
                }
              : null;
          })
          .filter(Boolean);

        return {
          officialId: official.data.id,
          officialName: official.data.label,
          officialRisk: official.data.riskScore,
          companyConnections,
          riskLevel:
            companyConnections.length >= 5
              ? 'critical'
              : companyConnections.length >= 3
                ? 'high'
                : 'medium',
        };
      })
      .filter((c) => c.companyConnections.length >= 2)
      .sort((a, b) => b.companyConnections.length - a.companyConnections.length);

    return JSON.stringify({
      pattern: 'Conflict of Interest Detection',
      officialCorporateNexus: conflicts.length,
      conflicts: conflicts.slice(0, 10),
      methodology: 'Identified government officials with multiple direct connections to corporate entities.',
    });
  },
  {
    name: 'detect_conflict_of_interest',
    description:
      'Detect potential conflicts of interest between officials and corporate entities.',
    schema: z.object({}),
  },
);

export const detectKickbacks = tool(
  async () => {
    const alerts = getAlerts();
    const financialAlerts = alerts.filter(
      (a) =>
        a.category.toLowerCase().includes('fund') ||
        a.category.toLowerCase().includes('financial') ||
        a.category.toLowerCase().includes('transaction') ||
        a.category.toLowerCase().includes('kickback'),
    );

    const suspicious = financialAlerts
      .filter((a) => a.riskScore >= 60)
      .map((a) => ({
        alertId: a.id,
        title: a.title,
        entityName: a.entityName,
        entityId: a.entityId,
        category: a.category,
        riskScore: a.riskScore,
        timestamp: a.timestamp,
      }))
      .sort((a, b) => b.riskScore - a.riskScore);

    return JSON.stringify({
      pattern: 'Kickback/Fund Diversion Detection',
      suspiciousTransactions: suspicious.length,
      transactions: suspicious.slice(0, 15),
      methodology: 'Analyzed financial and fund-related alerts for high-risk transaction patterns.',
    });
  },
  {
    name: 'detect_kickbacks',
    description:
      'Detect potential kickback or fund diversion patterns from financial alerts.',
    schema: z.object({}),
  },
);

export const patternTools = [
  detectShellCompanies,
  detectBidRigging,
  detectConflictOfInterest,
  detectKickbacks,
];

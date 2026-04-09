/**
 * Timeline Builder Tools — Build chronological event timelines.
 */

import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import { getCaseById, getAlerts, getEntityById } from '@/app/api/_lib/data';

export const buildEntityTimeline = tool(
  async (input) => {
    const entity = getEntityById(input.entityId);
    if (!entity) return JSON.stringify({ error: 'Entity not found' });

    const allAlerts = getAlerts();
    const entityAlerts = allAlerts
      .filter((a) => a.entityId === input.entityId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const events = entityAlerts.map((a) => ({
      date: a.timestamp,
      type: 'alert' as const,
      title: a.title,
      description: a.description,
      priority: a.priority,
      riskScore: a.riskScore,
    }));

    return JSON.stringify({
      entityId: entity.id,
      entityName: entity.name,
      eventCount: events.length,
      timeline: events,
      dateRange: {
        earliest: events[0]?.date ?? null,
        latest: events[events.length - 1]?.date ?? null,
      },
    });
  },
  {
    name: 'build_entity_timeline',
    description:
      'Build a chronological timeline of all events related to an entity.',
    schema: z.object({
      entityId: z.string().describe('The entity ID'),
    }),
  },
);

export const buildCaseTimeline = tool(
  async (input) => {
    const caseData = getCaseById(input.caseId);
    if (!caseData) return JSON.stringify({ error: 'Case not found' });

    const activities = caseData.activities
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map((a) => ({
        date: a.timestamp,
        type: a.type,
        description: a.description,
        user: a.user,
      }));

    const evidenceEvents = caseData.evidence
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map((e) => ({
        date: e.timestamp,
        type: 'evidence_added',
        description: `${e.type}: ${e.title}`,
        source: e.source,
      }));

    return JSON.stringify({
      caseId: caseData.id,
      caseTitle: caseData.title,
      activities,
      evidence: evidenceEvents,
      totalEvents: activities.length + evidenceEvents.length,
    });
  },
  {
    name: 'build_case_timeline',
    description:
      'Build a chronological timeline of all activities and evidence for a case.',
    schema: z.object({
      caseId: z.string().describe('The case ID'),
    }),
  },
);

export const timelineTools = [buildEntityTimeline, buildCaseTimeline];

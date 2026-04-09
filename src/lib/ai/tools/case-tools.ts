/**
 * Case Tools — MCP-compatible tools for investigation case operations.
 */

import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import { getCases, getCaseById } from '@/app/api/_lib/data';
import type { CaseStatus, AlertPriority } from '@/types';

export const queryCases = tool(
  async (input) => {
    const filter: {
      status?: CaseStatus[];
      priority?: AlertPriority[];
      search?: string;
      tags?: string[];
    } = {};

    if (input.status) {
      filter.status = [input.status as CaseStatus];
    }
    if (input.priority) {
      filter.priority = [input.priority as AlertPriority];
    }
    if (input.search) {
      filter.search = input.search;
    }
    if (input.tags) {
      filter.tags = input.tags;
    }

    const cases = getCases(filter);
    const limited = cases.slice(0, input.limit ?? 15);

    return JSON.stringify({
      total: cases.length,
      returned: limited.length,
      cases: limited.map((c) => ({
        id: c.id,
        title: c.title,
        status: c.status,
        priority: c.priority,
        assignee: c.assignee,
        riskScore: c.riskScore,
        entityCount: c.entityIds.length,
        alertCount: c.alertIds.length,
        evidenceCount: c.evidence.length,
        tags: c.tags,
      })),
    });
  },
  {
    name: 'query_cases',
    description:
      'Search investigation cases by status, priority, or keywords. Returns case summaries.',
    schema: z.object({
      status: z
        .enum(['new', 'in_progress', 'pending', 'closed'])
        .optional()
        .describe('Filter by case status'),
      priority: z
        .enum(['critical', 'high', 'medium', 'low'])
        .optional()
        .describe('Filter by case priority'),
      search: z.string().optional().describe('Search cases by title or summary'),
      tags: z
        .array(z.string())
        .optional()
        .describe('Filter by case tags'),
      limit: z.number().optional().describe('Max results (default 15)'),
    }),
  },
);

export const getCaseDetails = tool(
  async (input) => {
    const caseData = getCaseById(input.caseId);
    if (!caseData) return JSON.stringify({ error: 'Case not found' });

    return JSON.stringify({
      id: caseData.id,
      title: caseData.title,
      status: caseData.status,
      priority: caseData.priority,
      assignee: caseData.assignee,
      riskScore: caseData.riskScore,
      summary: caseData.summary,
      entityIds: caseData.entityIds,
      alertIds: caseData.alertIds,
      tags: caseData.tags,
      evidence: caseData.evidence.map((e) => ({
        id: e.id,
        type: e.type,
        title: e.title,
        source: e.source,
        timestamp: e.timestamp,
      })),
      recentActivities: caseData.activities.slice(-10).map((a) => ({
        type: a.type,
        description: a.description,
        user: a.user,
        timestamp: a.timestamp,
      })),
    });
  },
  {
    name: 'get_case_details',
    description: 'Get full details of a specific investigation case by ID.',
    schema: z.object({
      caseId: z.string().describe('The case ID to look up'),
    }),
  },
);

export const caseTools = [queryCases, getCaseDetails];

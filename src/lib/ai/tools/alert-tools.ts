/**
 * Alert Tools — MCP-compatible tools for alert operations.
 */

import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import { getAlerts, getAlertById, getUnreadAlertCount } from '@/app/api/_lib/data';
import type { AlertPriority } from '@/types';

export const queryAlerts = tool(
  async (input) => {
    const filter: {
      priority?: AlertPriority[];
      isRead?: boolean;
      search?: string;
    } = {};

    if (input.priority) {
      filter.priority = [input.priority as AlertPriority];
    }
    if (input.unreadOnly) {
      filter.isRead = false;
    }
    if (input.search) {
      filter.search = input.search;
    }

    const alerts = getAlerts(filter);
    const limited = alerts.slice(0, input.limit ?? 20);

    return JSON.stringify({
      total: alerts.length,
      returned: limited.length,
      alerts: limited.map((a) => ({
        id: a.id,
        title: a.title,
        priority: a.priority,
        category: a.category,
        entityName: a.entityName,
        entityId: a.entityId,
        riskScore: a.riskScore,
        timestamp: a.timestamp,
        isRead: a.isRead,
        isDismissed: a.isDismissed,
      })),
    });
  },
  {
    name: 'query_alerts',
    description:
      'Search and filter alerts by priority, entity, category, or date. Returns alert summaries.',
    schema: z.object({
      priority: z
        .enum(['critical', 'high', 'medium', 'low'])
        .optional()
        .describe('Filter by priority level'),
      search: z.string().optional().describe('Search alerts by title or entity name'),
      unreadOnly: z.boolean().optional().describe('Only return unread alerts'),
      limit: z.number().optional().describe('Max results to return (default 20)'),
    }),
  },
);

export const getAlertDetails = tool(
  async (input) => {
    const alert = getAlertById(input.alertId);
    if (!alert) return JSON.stringify({ error: 'Alert not found' });
    return JSON.stringify(alert);
  },
  {
    name: 'get_alert_details',
    description: 'Get full details of a specific alert by its ID.',
    schema: z.object({
      alertId: z.string().describe('The alert ID to look up'),
    }),
  },
);

export const countAlerts = tool(
  async () => {
    const unread = getUnreadAlertCount();
    const all = getAlerts();
    const critical = all.filter((a) => a.priority === 'critical').length;
    const high = all.filter((a) => a.priority === 'high').length;

    return JSON.stringify({
      total: all.length,
      unread,
      critical,
      high,
      medium: all.filter((a) => a.priority === 'medium').length,
      low: all.filter((a) => a.priority === 'low').length,
    });
  },
  {
    name: 'count_alerts',
    description: 'Get alert counts broken down by priority level and read status.',
    schema: z.object({}),
  },
);

export const alertTools = [queryAlerts, getAlertDetails, countAlerts];

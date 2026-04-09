/**
 * Entity Tools — MCP-compatible tools for entity operations.
 */

import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import {
  getEntities,
  getEntityById,
  searchEntities,
  getHighRiskEntities,
  getEntitiesByType,
} from '@/app/api/_lib/data';

export const queryEntities = tool(
  async (input) => {
    if (input.search) {
      const results = searchEntities(input.search);
      return JSON.stringify({
        total: results.length,
        entities: results.map((e) => ({
          id: e.id,
          name: e.name,
          type: e.type,
          riskScore: e.riskScore,
          status: e.status,
          connectionCount: e.connectionCount,
          department: e.department,
        })),
      });
    }

    const filter: {
      type?: Array<'person' | 'company' | 'official' | 'contract'>;
      minRiskScore?: number;
      maxRiskScore?: number;
    } = {};

    if (input.entityType) {
      filter.type = [input.entityType as 'person' | 'company' | 'official' | 'contract'];
    }
    if (input.minRiskScore !== undefined) {
      filter.minRiskScore = input.minRiskScore;
    }

    const entities = getEntities(filter);
    const limited = entities.slice(0, input.limit ?? 20);

    return JSON.stringify({
      total: entities.length,
      returned: limited.length,
      entities: limited.map((e) => ({
        id: e.id,
        name: e.name,
        type: e.type,
        riskScore: e.riskScore,
        status: e.status,
        connectionCount: e.connectionCount,
        department: e.department,
        designation: e.designation,
      })),
    });
  },
  {
    name: 'query_entities',
    description:
      'Search entities by name, type, or risk score. Returns entity summaries.',
    schema: z.object({
      search: z.string().optional().describe('Search entities by name'),
      entityType: z
        .enum(['person', 'company', 'official', 'contract'])
        .optional()
        .describe('Filter by entity type'),
      minRiskScore: z.number().optional().describe('Minimum risk score filter'),
      limit: z.number().optional().describe('Max results (default 20)'),
    }),
  },
);

export const getEntityDetails = tool(
  async (input) => {
    const entity = getEntityById(input.entityId);
    if (!entity) return JSON.stringify({ error: 'Entity not found' });
    return JSON.stringify(entity);
  },
  {
    name: 'get_entity_details',
    description: 'Get full details of a specific entity by ID.',
    schema: z.object({
      entityId: z.string().describe('The entity ID to look up'),
    }),
  },
);

export const getHighRiskEntitiesInfo = tool(
  async (input) => {
    const entities = getHighRiskEntities(input.threshold ?? 70);
    return JSON.stringify({
      total: entities.length,
      threshold: input.threshold ?? 70,
      entities: entities.slice(0, 15).map((e) => ({
        id: e.id,
        name: e.name,
        type: e.type,
        riskScore: e.riskScore,
        status: e.status,
        connectionCount: e.connectionCount,
      })),
    });
  },
  {
    name: 'get_high_risk_entities',
    description: 'Get entities with risk scores above a threshold.',
    schema: z.object({
      threshold: z
        .number()
        .optional()
        .describe('Risk score threshold (default 70)'),
    }),
  },
);

export const getEntityTypeCounts = tool(
  async () => {
    const counts = getEntitiesByType();
    return JSON.stringify(counts);
  },
  {
    name: 'get_entity_type_counts',
    description: 'Get the count of entities broken down by type.',
    schema: z.object({}),
  },
);

export const entityTools = [
  queryEntities,
  getEntityDetails,
  getHighRiskEntitiesInfo,
  getEntityTypeCounts,
];

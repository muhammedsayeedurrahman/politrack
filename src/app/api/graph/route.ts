import type { NextRequest } from 'next/server';
import { ok, parseSearchParams, parseArray, parseNumber } from '../_lib/response';
import { getGraphData } from '../_lib/data';
import type { EntityType, GraphEdge } from '@/types';

export async function GET(req: NextRequest) {
  const params = parseSearchParams(req);

  const entityTypes = parseArray(params, 'entityTypes') as EntityType[] | undefined;
  const edgeTypes = parseArray(params, 'edgeTypes') as GraphEdge['data']['type'][] | undefined;
  const minRiskScore = parseNumber(params, 'minRiskScore');
  const maxRiskScore = parseNumber(params, 'maxRiskScore');

  const hasFilter = entityTypes || edgeTypes || minRiskScore !== undefined || maxRiskScore !== undefined || params.search;

  const data = getGraphData(
    hasFilter
      ? {
          entityTypes: entityTypes ?? [],
          edgeTypes: edgeTypes ?? [],
          minRiskScore: minRiskScore ?? 0,
          maxRiskScore: maxRiskScore ?? 100,
          search: params.search ?? '',
        }
      : undefined,
  );

  return ok(data);
}

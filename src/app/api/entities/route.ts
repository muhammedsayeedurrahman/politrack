import type { NextRequest } from 'next/server';
import { ok, parseSearchParams, parseArray, parseNumber } from '../_lib/response';
import { getEntities } from '../_lib/data';
import type { EntityType } from '@/types';

export async function GET(req: NextRequest) {
  const params = parseSearchParams(req);

  const entities = getEntities({
    type: parseArray(params, 'type') as EntityType[] | undefined,
    status: parseArray(params, 'status') as Array<'active' | 'flagged' | 'cleared' | 'under_investigation'> | undefined,
    minRiskScore: parseNumber(params, 'minRiskScore'),
    maxRiskScore: parseNumber(params, 'maxRiskScore'),
    department: params.department || undefined,
    search: params.search || undefined,
  });

  return ok(entities);
}

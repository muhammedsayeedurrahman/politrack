import type { NextRequest } from 'next/server';
import { ok, parseSearchParams, parseNumber } from '../../_lib/response';
import { getHighRiskEntities } from '../../_lib/data';

export async function GET(req: NextRequest) {
  const params = parseSearchParams(req);
  const threshold = parseNumber(params, 'threshold') ?? 70;
  return ok(getHighRiskEntities(threshold));
}

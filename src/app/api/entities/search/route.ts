import type { NextRequest } from 'next/server';
import { ok, parseSearchParams } from '../../_lib/response';
import { searchEntities } from '../../_lib/data';

export async function GET(req: NextRequest) {
  const params = parseSearchParams(req);
  const results = searchEntities(params.q ?? '');
  return ok(results);
}

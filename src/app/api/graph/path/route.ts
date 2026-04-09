import type { NextRequest } from 'next/server';
import { ok, err, parseSearchParams } from '../../_lib/response';
import { findPath } from '../../_lib/data';

export async function GET(req: NextRequest) {
  const params = parseSearchParams(req);
  const { source, target } = params;

  if (!source || !target) {
    return err('"source" and "target" query params are required.', 400);
  }

  const result = findPath(source, target);
  if (!result) return ok(null);
  return ok(result);
}

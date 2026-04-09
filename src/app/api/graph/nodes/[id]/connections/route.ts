import type { NextRequest } from 'next/server';
import { ok, parseSearchParams, parseNumber } from '../../../../_lib/response';
import { getNodeConnections } from '../../../../_lib/data';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const qp = parseSearchParams(req);
  const depth = parseNumber(qp, 'depth') ?? 1;
  return ok(getNodeConnections(id, depth));
}

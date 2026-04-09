import type { NextRequest } from 'next/server';
import { ok } from '../../../_lib/response';
import { getEdgesByNode } from '../../../_lib/data';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ nodeId: string }> },
) {
  const { nodeId } = await params;
  return ok(getEdgesByNode(nodeId));
}

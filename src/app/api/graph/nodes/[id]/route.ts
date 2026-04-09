import type { NextRequest } from 'next/server';
import { ok, err } from '../../../_lib/response';
import { getNodeById } from '../../../_lib/data';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const node = getNodeById(id);
  if (!node) return err('Node not found', 404);
  return ok(node);
}

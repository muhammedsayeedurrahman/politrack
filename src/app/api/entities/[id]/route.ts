import type { NextRequest } from 'next/server';
import { ok, err } from '../../_lib/response';
import { getEntityById } from '../../_lib/data';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const entity = getEntityById(id);
  if (!entity) return err('Entity not found', 404);
  return ok(entity);
}

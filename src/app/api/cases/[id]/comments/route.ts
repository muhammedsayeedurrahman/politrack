import type { NextRequest } from 'next/server';
import { ok, err } from '../../../_lib/response';
import { addCaseComment } from '../../../_lib/data';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json() as { comment: string; user: string };

  if (!body.comment || !body.user) {
    return err('"comment" and "user" are required.', 400);
  }

  const updated = addCaseComment(id, body.comment, body.user);
  if (!updated) return err('Case not found', 404);
  return ok(updated);
}

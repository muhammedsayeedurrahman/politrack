import type { NextRequest } from 'next/server';
import { ok, err } from '../../_lib/response';
import { getCaseById, updateCaseStatus, updateCasePriority } from '../../_lib/data';
import type { CaseStatus, AlertPriority } from '@/types';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const caseData = getCaseById(id);
  if (!caseData) return err('Case not found', 404);
  return ok(caseData);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json() as { status?: CaseStatus; priority?: AlertPriority };

  if (body.status) {
    const updated = updateCaseStatus(id, body.status);
    if (!updated) return err('Case not found', 404);
    return ok(updated);
  }

  if (body.priority) {
    const updated = updateCasePriority(id, body.priority);
    if (!updated) return err('Case not found', 404);
    return ok(updated);
  }

  return err('Provide "status" or "priority" to update.', 400);
}

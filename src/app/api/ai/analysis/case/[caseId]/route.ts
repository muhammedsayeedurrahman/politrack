import type { NextRequest } from 'next/server';
import { ok, err } from '../../../../_lib/response';
import { getCaseById } from '../../../../_lib/data';
import { investigateCaseWithAgent } from '@/lib/ai/agents';

export const maxDuration = 60;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> },
) {
  const { caseId } = await params;
  const caseData = getCaseById(caseId);
  if (!caseData) return err('Case not found', 404);

  try {
    const analysis = await investigateCaseWithAgent(caseId);
    return ok(analysis);
  } catch (error) {
    return err(
      error instanceof Error ? error.message : 'Case analysis failed',
      500,
    );
  }
}

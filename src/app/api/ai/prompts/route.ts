import type { NextRequest } from 'next/server';
import { ok, parseSearchParams } from '../../_lib/response';
import { getSuggestedPrompts } from '@/lib/ai/agents';

export async function GET(req: NextRequest) {
  const params = parseSearchParams(req);
  const page = params.page ?? 'dashboard';
  return ok(getSuggestedPrompts(page));
}

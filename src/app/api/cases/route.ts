import type { NextRequest } from 'next/server';
import { ok, parseSearchParams, parseArray } from '../_lib/response';
import { getCases } from '../_lib/data';
import type { CaseStatus, AlertPriority } from '@/types';

export async function GET(req: NextRequest) {
  const params = parseSearchParams(req);

  const cases = getCases({
    status: parseArray(params, 'status') as CaseStatus[] | undefined,
    priority: parseArray(params, 'priority') as AlertPriority[] | undefined,
    assignee: params.assignee || undefined,
    search: params.search || undefined,
    tags: parseArray(params, 'tags'),
  });

  return ok(cases);
}

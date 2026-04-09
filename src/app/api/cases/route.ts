import type { NextRequest } from 'next/server';
import { ok, err, parseSearchParams, parseArray } from '../_lib/response';
import { getCases, createCase } from '../_lib/data';
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, summary, priority } = body;

    if (!title || !summary) {
      return err('Title and summary are required', 400);
    }

    const newCase = createCase({
      title,
      summary,
      priority: priority ?? 'medium',
      assignee: body.assignee,
      tags: body.tags,
    });

    return ok(newCase);
  } catch {
    return err('Failed to create case', 500);
  }
}

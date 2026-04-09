import type { NextRequest } from 'next/server';
import { ok, parseSearchParams, parseArray } from '../_lib/response';
import { getAlerts } from '../_lib/data';
import type { AlertPriority, EntityType } from '@/types';

export async function GET(req: NextRequest) {
  const params = parseSearchParams(req);

  const alerts = getAlerts({
    priority: parseArray(params, 'priority') as AlertPriority[] | undefined,
    entityType: parseArray(params, 'entityType') as EntityType[] | undefined,
    isRead: params.isRead !== undefined ? params.isRead === 'true' : undefined,
    search: params.search || undefined,
  });

  return ok(alerts);
}

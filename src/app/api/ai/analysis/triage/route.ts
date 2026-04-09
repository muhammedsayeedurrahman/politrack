import type { NextRequest } from 'next/server';
import { ok, err } from '../../../_lib/response';
import { triageAlertWithAgent } from '@/lib/ai/agents';
import type { Alert } from '@/types';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const body = await req.json() as { alert: Alert };

  if (!body.alert?.id) {
    return err('"alert" object with "id" is required.', 400);
  }

  try {
    const result = await triageAlertWithAgent(body.alert.id);
    return ok(result);
  } catch (error) {
    return err(
      error instanceof Error ? error.message : 'Triage failed',
      500,
    );
  }
}

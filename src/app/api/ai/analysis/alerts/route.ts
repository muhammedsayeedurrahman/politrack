import type { NextRequest } from 'next/server';
import { ok, err } from '../../../_lib/response';
import { generateAlertInsightsWithAgent } from '@/lib/ai/agents';
import type { Alert } from '@/types';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const body = await req.json() as { alerts: Alert[] };

  if (!Array.isArray(body.alerts)) {
    return err('"alerts" array is required.', 400);
  }

  try {
    const insights = await generateAlertInsightsWithAgent(body.alerts);
    return ok(insights);
  } catch (error) {
    return err(
      error instanceof Error ? error.message : 'Alert insights failed',
      500,
    );
  }
}

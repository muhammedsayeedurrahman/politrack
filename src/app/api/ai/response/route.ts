import type { NextRequest } from 'next/server';
import { ok, err } from '../../_lib/response';
import { handleCopilotQuery } from '@/lib/ai/agents';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    query: string;
    context: { page: string; entityId?: string | null; caseId?: string | null; alertId?: string | null };
  };

  if (!body.query) {
    return err('"query" is required.', 400);
  }

  try {
    const response = await handleCopilotQuery(
      body.query,
      body.context ?? { page: 'dashboard' },
    );
    return ok({ response });
  } catch (error) {
    return err(
      error instanceof Error ? error.message : 'AI response generation failed',
      500,
    );
  }
}

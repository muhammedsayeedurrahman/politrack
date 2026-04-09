import type { NextRequest } from 'next/server';
import { streamCopilotResponse } from '@/lib/ai/agents';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    query: string;
    context: { page: string; entityId?: string | null; caseId?: string | null };
  };

  if (!body.query) {
    return new Response(
      JSON.stringify({ success: false, data: null, error: '"query" is required.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const context = body.context ?? { page: 'dashboard' };
  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamCopilotResponse(body.query, context)) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Stream failed';
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(`\n\n*Error: ${msg}*`)}\n\n`),
        );
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

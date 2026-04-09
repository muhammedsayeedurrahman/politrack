import type { NextRequest } from 'next/server';
import { ok, err } from '../../../_lib/response';
import { detectNetworkPatternsWithAgent } from '@/lib/ai/agents';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    nodes: { data: { id: string; label: string; type: string; riskScore: number; connectionCount: number } }[];
    edges: { data: { source: string; target: string; type: string; confidence: number } }[];
  };

  if (!Array.isArray(body.nodes) || !Array.isArray(body.edges)) {
    return err('"nodes" and "edges" arrays are required.', 400);
  }

  try {
    const patterns = await detectNetworkPatternsWithAgent(body.nodes, body.edges);
    return ok(patterns);
  } catch (error) {
    return err(
      error instanceof Error ? error.message : 'Pattern detection failed',
      500,
    );
  }
}

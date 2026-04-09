import type { NextRequest } from 'next/server';
import { ok, err } from '../../../../_lib/response';
import { explainNodeWithAgent } from '@/lib/ai/agents';

export const maxDuration = 60;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ nodeId: string }> },
) {
  const { nodeId } = await params;
  const body = await req.json() as {
    nodes: { data: { id: string; label: string; type: string; riskScore: number; connectionCount: number } }[];
    edges: { data: { source: string; target: string; label: string; type: string; confidence: number } }[];
  };

  if (!Array.isArray(body.nodes) || !Array.isArray(body.edges)) {
    return err('"nodes" and "edges" arrays are required.', 400);
  }

  try {
    const explanation = await explainNodeWithAgent(nodeId, body.nodes, body.edges);
    return ok(explanation);
  } catch (error) {
    return err(
      error instanceof Error ? error.message : 'Node analysis failed',
      500,
    );
  }
}

import { ok, err } from '../../_lib/response';
import { generateThreatBriefingWithAgent } from '@/lib/ai/agents';

export const maxDuration = 60;

export async function GET() {
  try {
    const briefing = await generateThreatBriefingWithAgent();
    return ok(briefing);
  } catch (error) {
    return err(
      error instanceof Error ? error.message : 'Briefing generation failed',
      500,
    );
  }
}

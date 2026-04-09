import { NextRequest } from 'next/server';
import { ok, err } from '@/app/api/_lib/response';
import { getEntityById } from '@/app/api/_lib/data';

function seeded(entityId: string): number {
  let hash = 0;
  for (let i = 0; i < entityId.length; i++) {
    hash = ((hash << 5) - hash + entityId.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ entityId: string }> },
) {
  const { entityId } = await params;
  const entity = getEntityById(entityId);

  if (!entity) {
    return err('Entity not found', 404);
  }

  const hash = seeded(entityId);
  const isOfficial = entity.type === 'official';
  const hasMatch = hash % 4 === 0;

  const result = {
    entityId,
    entityName: entity.name,
    sanctions: [
      {
        list: 'OFAC SDN',
        match: hasMatch,
        confidence: 85 + (hash % 12),
        details: hasMatch ? 'Partial name match found — manual review recommended' : undefined,
      },
      {
        list: 'EU Sanctions List',
        match: false,
        confidence: 92 + (hash % 6),
      },
      {
        list: 'UN Security Council',
        match: false,
        confidence: 95 + (hash % 4),
      },
    ],
    pep: {
      isPep: isOfficial || hash % 3 === 0,
      role: isOfficial
        ? entity.designation ?? 'Government Official'
        : hash % 3 === 0
        ? 'Former Committee Member'
        : undefined,
      jurisdiction: isOfficial || hash % 3 === 0 ? 'India' : undefined,
      since: isOfficial ? '2019' : undefined,
      confidence: 78 + (hash % 18),
    },
    adverseMedia: [
      {
        headline: `${entity.name} linked to procurement irregularities in government audit`,
        source: 'The Economic Times',
        date: '2026-02-15',
        sentiment: 'negative',
        relevance: 82,
      },
      {
        headline: `Investigation reveals financial discrepancies involving ${entity.name}`,
        source: 'NDTV',
        date: '2025-11-03',
        sentiment: 'negative',
        relevance: 74,
      },
      {
        headline: `${entity.name} appears in CAG report on infrastructure spending`,
        source: 'Indian Express',
        date: '2025-08-22',
        sentiment: 'neutral',
        relevance: 56,
      },
    ],
    compositeRisk: hasMatch ? 78 : isOfficial ? 62 : 35 + (hash % 25),
    screenedAt: new Date().toISOString(),
  };

  return ok(result);
}

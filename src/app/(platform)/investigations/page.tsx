'use client';

import { useState, useEffect, useMemo } from 'react';
import { CaseQueue } from '@/components/investigation/case-queue';
import { EvidenceCanvas } from '@/components/investigation/evidence-canvas';
import { IntelSummary } from '@/components/investigation/intel-summary';
import { ActivityLog } from '@/components/investigation/activity-log';
import { useInvestigationStore } from '@/stores/investigation-store';
import { Case } from '@/types';
import { caseService } from '@/services/case-service';

export default function InvestigationsPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const { activeCaseId } = useInvestigationStore();

  useEffect(() => {
    caseService.getCases().then(setCases);
  }, []);

  const activeCase = useMemo(
    () => cases.find(c => c.id === activeCaseId) ?? null,
    [cases, activeCaseId]
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Investigations</h1>
        <p className="text-sm text-muted-foreground">Manage and investigate corruption cases</p>
      </div>
      <div className="flex h-[calc(100vh-12rem)] border rounded-lg overflow-hidden bg-card">
        <div className="w-72 shrink-0">
          <CaseQueue cases={cases} />
        </div>
        <EvidenceCanvas caseData={activeCase} />
        <IntelSummary caseData={activeCase} />
      </div>
      <ActivityLog caseData={activeCase} />
    </div>
  );
}

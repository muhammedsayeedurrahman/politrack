'use client';

import { useState, useEffect, useMemo } from 'react';
import { CaseQueue } from '@/components/investigation/case-queue';
import { EvidenceCanvas } from '@/components/investigation/evidence-canvas';
import { IntelSummary } from '@/components/investigation/intel-summary';
import { ActivityLog } from '@/components/investigation/activity-log';
import { useInvestigationStore } from '@/stores/investigation-store';
import { Case } from '@/types';
import { caseApi } from '@/services/api/case-api';
import { FadeIn } from '@/components/motion';
import BlurText from '@/components/reactbits/blur-text';

export default function InvestigationsPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const { activeCaseId } = useInvestigationStore();

  useEffect(() => {
    caseApi.getCases().then(setCases);
  }, []);

  const activeCase = useMemo(
    () => cases.find(c => c.id === activeCaseId) ?? null,
    [cases, activeCaseId]
  );

  return (
    <div className="space-y-4">
      <FadeIn direction="none">
        <div>
          <BlurText
            text="Investigations"
            className="text-2xl font-bold tracking-tight"
            delay={80}
            animateBy="letters"
          />
          <p className="text-sm text-muted-foreground">Manage and investigate corruption cases</p>
        </div>
      </FadeIn>
      <FadeIn direction="up" delay={0.1}>
        <div className="flex h-[calc(100vh-12rem)] border rounded-lg overflow-hidden bg-card">
          <div className="w-72 shrink-0">
            <CaseQueue cases={cases} />
          </div>
          <EvidenceCanvas caseData={activeCase} />
          <IntelSummary caseData={activeCase} />
        </div>
      </FadeIn>
      <FadeIn direction="up" delay={0.15}>
        <ActivityLog caseData={activeCase} />
      </FadeIn>
    </div>
  );
}

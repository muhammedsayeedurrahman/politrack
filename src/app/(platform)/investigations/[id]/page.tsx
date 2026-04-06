'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useInvestigationStore } from '@/stores/investigation-store';

export default function InvestigationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const setActiveCaseId = useInvestigationStore((s) => s.setActiveCaseId);

  useEffect(() => {
    if (params.id && typeof params.id === 'string') {
      setActiveCaseId(params.id);
    }
    router.replace('/investigations');
  }, [params.id, setActiveCaseId, router]);

  return null;
}

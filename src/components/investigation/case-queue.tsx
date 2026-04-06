'use client';

import { useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CaseCard } from './case-card';
import { EmptyState } from '@/components/shared/empty-state';
import { useInvestigationStore } from '@/stores/investigation-store';
import { Case, CaseStatus } from '@/types';
import { CASE_STATUS_CONFIG } from '@/lib/constants';
import { Search, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CaseQueueProps {
  cases: Case[];
}

const STATUS_ORDER: Record<CaseStatus, number> = { new: 0, in_progress: 1, pending: 2, closed: 3 };
const PRIORITY_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

export function CaseQueue({ cases }: CaseQueueProps) {
  const { activeCaseId, setActiveCaseId, caseFilter, setCaseSearch, toggleStatusFilter } = useInvestigationStore();

  const filtered = useMemo(() => {
    let result = [...cases];
    if (caseFilter.status.length > 0) {
      result = result.filter(c => caseFilter.status.includes(c.status));
    }
    if (caseFilter.search) {
      const s = caseFilter.search.toLowerCase();
      result = result.filter(c => c.title.toLowerCase().includes(s) || c.summary.toLowerCase().includes(s));
    }
    result.sort((a, b) => {
      if (caseFilter.sortBy === 'priority') return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      if (caseFilter.sortBy === 'status') return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
    return result;
  }, [cases, caseFilter]);

  const statusOptions: CaseStatus[] = ['new', 'in_progress', 'pending', 'closed'];

  return (
    <div className="flex flex-col h-full border-r">
      <div className="p-3 space-y-2 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Cases ({filtered.length})</h3>
          <Button size="sm" className="h-7 text-xs" aria-label="Create new case"><Plus size={12} className="mr-1" aria-hidden="true" /> New</Button>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-2.5 text-muted-foreground" aria-hidden="true" />
          <Input placeholder="Search cases..." value={caseFilter.search} onChange={(e) => setCaseSearch(e.target.value)} className="pl-8 h-9 text-sm" aria-label="Search cases" />
        </div>
        <div className="flex gap-1 flex-wrap" role="group" aria-label="Filter by case status">
          {statusOptions.map(s => (
            <Button key={s} size="sm" variant={caseFilter.status.includes(s) ? 'default' : 'outline'} className="h-6 text-[10px]" onClick={() => toggleStatusFilter(s)} aria-pressed={caseFilter.status.includes(s)}>
              {CASE_STATUS_CONFIG[s].label}
            </Button>
          ))}
        </div>
      </div>
      <ScrollArea className="flex-1" aria-label="Case list">
        <div className="p-3 space-y-2" role="list" aria-label="Investigation cases">
          {filtered.length === 0 ? (
            <EmptyState title="No cases" description="No matching cases found" className="py-8" />
          ) : (
            filtered.map(c => (
              <div key={c.id} role="listitem">
                <CaseCard caseItem={c} isActive={c.id === activeCaseId} onClick={() => setActiveCaseId(c.id)} />
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

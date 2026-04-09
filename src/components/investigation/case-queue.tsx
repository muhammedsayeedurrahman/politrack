'use client';

import { useMemo, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CaseCard } from './case-card';
import { EmptyState } from '@/components/shared/empty-state';
import { useInvestigationStore } from '@/stores/investigation-store';
import { Case, CaseStatus, AlertPriority } from '@/types';
import { CASE_STATUS_CONFIG } from '@/lib/constants';
import { Search, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CaseQueueProps {
  cases: Case[];
  onCaseCreated?: (newCase: Case) => void;
}

const STATUS_ORDER: Record<CaseStatus, number> = { new: 0, in_progress: 1, pending: 2, closed: 3 };
const PRIORITY_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

const PRIORITY_OPTIONS: { value: AlertPriority; label: string }[] = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export function CaseQueue({ cases, onCaseCreated }: CaseQueueProps) {
  const { activeCaseId, setActiveCaseId, caseFilter, setCaseSearch, toggleStatusFilter } = useInvestigationStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [newPriority, setNewPriority] = useState<AlertPriority>('medium');

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

  const handleCreate = async () => {
    if (!newTitle.trim() || !newSummary.trim()) return;
    setIsCreating(true);
    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, summary: newSummary, priority: newPriority }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        onCaseCreated?.(json.data);
        setActiveCaseId(json.data.id);
        setNewTitle('');
        setNewSummary('');
        setNewPriority('medium');
        setDialogOpen(false);
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col h-full border-r">
      <div className="p-3 space-y-2 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Cases ({filtered.length})</h3>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-7 text-xs" aria-label="Create new case">
                <Plus size={12} className="mr-1" aria-hidden="true" /> New
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Case</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <label className="text-sm font-medium mb-1 block">Title</label>
                  <Input
                    placeholder="e.g., Suspicious procurement in Dept. of Works"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Summary</label>
                  <Textarea
                    placeholder="Brief description of the case..."
                    value={newSummary}
                    onChange={(e) => setNewSummary(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Priority</label>
                  <div className="flex gap-2">
                    {PRIORITY_OPTIONS.map((opt) => (
                      <Button
                        key={opt.value}
                        size="sm"
                        variant={newPriority === opt.value ? 'default' : 'outline'}
                        className="text-xs flex-1"
                        onClick={() => setNewPriority(opt.value)}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <Button
                  onClick={handleCreate}
                  disabled={isCreating || !newTitle.trim() || !newSummary.trim()}
                  className="w-full gap-1.5"
                >
                  {isCreating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  Create Case
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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

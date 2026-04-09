'use client';
import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCard } from './alert-card';
import { FilterChips } from '@/components/shared/filter-chips';
import { EmptyState } from '@/components/shared/empty-state';
import { alertApi } from '@/services/api/alert-api';
import { useDashboardStore } from '@/stores/dashboard-store';
import { AlertPriority } from '@/types';
import { Bell, Filter } from 'lucide-react';

export function AnomalyFeed() {
  const { selectedPriorities, selectedEntityTypes, togglePriority, resetFilters } = useDashboardStore();
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['alerts', selectedPriorities, selectedEntityTypes],
    queryFn: () => alertApi.getAlerts({
      priority: selectedPriorities.length > 0 ? selectedPriorities : undefined,
      entityType: selectedEntityTypes.length > 0 ? selectedEntityTypes : undefined,
    }),
  });

  const chips = [
    ...selectedPriorities.map(p => ({ id: `p-${p}`, label: p, category: 'Priority' })),
    ...selectedEntityTypes.map(t => ({ id: `t-${t}`, label: t, category: 'Type' })),
  ];

  const handleDismiss = useCallback(async (id: string) => {
    await alertApi.dismiss(id);
    queryClient.invalidateQueries({ queryKey: ['alerts'] });
  }, [queryClient]);

  const priorityOptions: AlertPriority[] = ['critical', 'high', 'medium', 'low'];

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Bell size={16} />
            Live Anomaly Feed
            <span className="text-xs bg-critical/10 text-critical px-2 py-0.5 rounded-full font-normal" aria-live="polite">
              <span className="sr-only">Active alerts: </span>{alerts.filter(a => !a.isDismissed).length} active
            </span>
          </CardTitle>
          <div className="flex gap-1" role="group" aria-label="Filter by priority">
            {priorityOptions.map(p => (
              <Button key={p} size="sm" variant={selectedPriorities.includes(p) ? "default" : "outline"} className="h-6 text-xs capitalize" onClick={() => togglePriority(p)} aria-pressed={selectedPriorities.includes(p)}>
                {p}
              </Button>
            ))}
          </div>
        </div>
        <FilterChips chips={chips} onRemove={(id) => {
          const [type, value] = id.split('-');
          if (type === 'p') togglePriority(value as AlertPriority);
        }} onClearAll={resetFilters} />
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[600px] px-4 pb-4" aria-label="Anomaly alerts feed">
          <div role="log" aria-live="polite" aria-label="Live anomaly alerts">
            {isLoading ? (
              <div className="space-y-3" aria-busy="true" aria-label="Loading alerts">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-40 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ) : alerts.filter(a => !a.isDismissed).length === 0 ? (
              <EmptyState title="No alerts" description="No matching alerts found. Adjust filters or check back later." />
            ) : (
              <div className="space-y-3">
                {alerts.filter(a => !a.isDismissed).slice(0, 50).map(alert => (
                  <AlertCard key={alert.id} alert={alert} onDismiss={handleDismiss} onInvestigate={() => {}} />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

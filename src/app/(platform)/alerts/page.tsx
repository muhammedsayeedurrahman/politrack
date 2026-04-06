'use client';

import { useState, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { alertService } from '@/services/alert-service';
import { DataTable, Column } from '@/components/shared/data-table';
import { PriorityBadge } from '@/components/shared/priority-badge';
import { EntityIcon } from '@/components/shared/entity-icon';
import { RiskIndicator } from '@/components/shared/risk-indicator';
import { TimeAgo } from '@/components/shared/time-ago';
import { TriageBadge } from '@/components/ai/triage-badge';
import { AlertInsights } from '@/components/ai/alert-insights';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertPriority } from '@/types';
import { triageAlert } from '@/services/ai-analysis-service';
import { Search, Download } from 'lucide-react';
import { useDebounce } from '@/lib/hooks/use-debounce';

export default function AlertsPage() {
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<AlertPriority[]>([]);
  const debouncedSearch = useDebounce(search);
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['alerts', 'all', priorityFilter, debouncedSearch],
    queryFn: () =>
      alertService.getAlerts({
        priority: priorityFilter.length > 0 ? priorityFilter : undefined,
        search: debouncedSearch || undefined,
      }),
  });

  // Pre-compute triage results for visible alerts
  const triageMap = useMemo(() => {
    const map = new Map<string, ReturnType<typeof triageAlert>>();
    for (const alert of alerts) {
      if (!alert.isDismissed) {
        map.set(alert.id, triageAlert(alert));
      }
    }
    return map;
  }, [alerts]);

  const togglePriority = (p: AlertPriority) => {
    setPriorityFilter((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const handleDismiss = useCallback(
    async (id: string) => {
      await alertService.dismiss(id);
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
    [queryClient]
  );

  const columns: Column<Alert>[] = [
    {
      key: 'priority',
      header: 'Priority',
      render: (a) => <PriorityBadge priority={a.priority} />,
      sortable: true,
      sortValue: (a) => {
        const order = { critical: 0, high: 1, medium: 2, low: 3 };
        return order[a.priority];
      },
      className: 'w-28',
    },
    {
      key: 'title',
      header: 'Alert',
      render: (a) => (
        <div>
          <p className="text-sm font-medium line-clamp-1">{a.title}</p>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {a.description}
          </p>
        </div>
      ),
    },
    {
      key: 'triage',
      header: 'AI Triage',
      render: (a) => {
        const triage = triageMap.get(a.id);
        if (!triage) return null;
        return (
          <TriageBadge
            recommendation={triage.recommendation}
            confidence={triage.confidence}
            reason={triage.reason}
          />
        );
      },
      sortable: true,
      sortValue: (a) => {
        const triage = triageMap.get(a.id);
        const order = { escalate: 0, investigate: 1, monitor: 2, 'auto-dismiss': 3 };
        return triage ? order[triage.recommendation] : 4;
      },
      className: 'w-40',
    },
    {
      key: 'entity',
      header: 'Entity',
      render: (a) => (
        <div className="flex items-center gap-2">
          <EntityIcon type={a.entityType} size={14} className="text-muted-foreground" />
          <span className="text-sm">{a.entityName}</span>
        </div>
      ),
    },
    {
      key: 'risk',
      header: 'Risk',
      render: (a) => <RiskIndicator score={a.riskScore} showLabel size="sm" className="w-24" />,
      sortable: true,
      sortValue: (a) => a.riskScore,
      className: 'w-36',
    },
    {
      key: 'time',
      header: 'Time',
      render: (a) => <TimeAgo timestamp={a.timestamp} />,
      sortable: true,
      sortValue: (a) => new Date(a.timestamp).getTime(),
      className: 'w-24',
    },
    {
      key: 'actions',
      header: '',
      render: (a) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss(a.id);
          }}
        >
          Dismiss
        </Button>
      ),
      className: 'w-20',
    },
  ];

  const priorities: AlertPriority[] = ['critical', 'high', 'medium', 'low'];
  const visibleAlerts = alerts.filter((a) => !a.isDismissed);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Alerts</h1>
          <p className="text-sm text-muted-foreground">
            All corruption alerts — {visibleAlerts.length} total
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Download size={14} className="mr-1" /> Export
        </Button>
      </div>

      {/* AI Insights Section */}
      {!isLoading && alerts.length > 0 && <AlertInsights alerts={alerts} />}

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-2.5 top-2.5 text-muted-foreground" />
          <Input
            placeholder="Search alerts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
        <div className="flex gap-1">
          {priorities.map((p) => (
            <Button
              key={p}
              size="sm"
              variant={priorityFilter.includes(p) ? 'default' : 'outline'}
              className="h-8 text-xs capitalize"
              onClick={() => togglePriority(p)}
            >
              {p}
            </Button>
          ))}
        </div>
      </div>

      <DataTable
        data={visibleAlerts}
        columns={columns}
        keyExtractor={(a) => a.id}
        pageSize={15}
        emptyMessage="No alerts match your filters"
      />
    </div>
  );
}

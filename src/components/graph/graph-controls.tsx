'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useGraphStore } from '@/stores/graph-store';
import { GraphLayout, EntityType } from '@/types';
import { ENTITY_TYPE_CONFIG } from '@/lib/constants';
import { EntityIcon } from '@/components/shared/entity-icon';
import { SlidersHorizontal, RotateCcw, Search, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { cn } from '@/lib/utils';

const LAYOUTS: { value: GraphLayout; label: string }[] = [
  { value: 'fcose', label: 'Force-directed' },
  { value: 'circle', label: 'Circle' },
  { value: 'grid', label: 'Grid' },
  { value: 'breadthfirst', label: 'Hierarchical' },
  { value: 'concentric', label: 'Concentric' },
];

const ENTITY_TYPES: EntityType[] = ['person', 'company', 'official', 'contract'];
const EDGE_TYPES = ['financial', 'organizational', 'familial', 'contractual'] as const;

export function GraphControls() {
  const {
    layout, setLayout,
    entityTypeFilters, toggleEntityTypeFilter,
    edgeTypeFilters, toggleEdgeTypeFilter,
    riskScoreRange, setRiskScoreRange,
    searchQuery, setSearchQuery,
    resetFilters,
  } = useGraphStore();

  return (
    <Card className="w-72 shrink-0 overflow-auto">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <SlidersHorizontal size={16} />
          Graph Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-2.5 text-muted-foreground" />
          <Input placeholder="Search nodes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8 h-9 text-sm" />
        </div>

        <Separator />

        {/* Layout */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Layout</h4>
          <div className="grid grid-cols-2 gap-1">
            {LAYOUTS.map(l => (
              <Button key={l.value} size="sm" variant={layout === l.value ? 'default' : 'outline'} className="h-7 text-xs" onClick={() => setLayout(l.value)}>
                {l.label}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Entity Types */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Entity Types</h4>
          <div className="space-y-1.5">
            {ENTITY_TYPES.map(type => (
              <label key={type} className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={entityTypeFilters.includes(type)} onChange={() => toggleEntityTypeFilter(type)} className="rounded" />
                <EntityIcon type={type} size={14} />
                {ENTITY_TYPE_CONFIG[type].label}
              </label>
            ))}
          </div>
        </div>

        <Separator />

        {/* Edge Types */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Relationship Types</h4>
          <div className="space-y-1.5">
            {EDGE_TYPES.map(type => (
              <label key={type} className="flex items-center gap-2 cursor-pointer text-sm capitalize">
                <input type="checkbox" checked={edgeTypeFilters.includes(type)} onChange={() => toggleEdgeTypeFilter(type)} className="rounded" />
                {type}
              </label>
            ))}
          </div>
        </div>

        <Separator />

        {/* Risk Score Range */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Risk Score Range</h4>
          <div className="flex items-center gap-2">
            <Input type="number" min={0} max={100} value={riskScoreRange[0]} onChange={(e) => setRiskScoreRange([Number(e.target.value), riskScoreRange[1]])} className="h-8 text-sm w-16" />
            <span className="text-xs text-muted-foreground">to</span>
            <Input type="number" min={0} max={100} value={riskScoreRange[1]} onChange={(e) => setRiskScoreRange([riskScoreRange[0], Number(e.target.value)])} className="h-8 text-sm w-16" />
          </div>
        </div>

        <Separator />

        <Button variant="outline" size="sm" className="w-full text-xs" onClick={resetFilters}>
          <RotateCcw size={12} className="mr-1" /> Reset Filters
        </Button>
      </CardContent>
    </Card>
  );
}

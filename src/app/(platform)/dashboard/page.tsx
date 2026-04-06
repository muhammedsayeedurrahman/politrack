'use client';

import { StatsGrid } from '@/components/dashboard/stats-grid';
import { SystemHealth } from '@/components/dashboard/system-health';
import { AnomalyFeed } from '@/components/dashboard/anomaly-feed';
import { TrendChart } from '@/components/dashboard/trend-chart';
import { MorningBrief } from '@/components/dashboard/morning-brief';
import { ThreatBriefing } from '@/components/ai/threat-briefing';
import { RiskMap } from '@/components/dashboard/risk-map';
import { LeafletCSS } from '@/components/dashboard/leaflet-css';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <LeafletCSS />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Real-time corruption intelligence monitoring</p>
      </div>

      <ThreatBriefing />
      <MorningBrief />
      <StatsGrid />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <TrendChart />
          <RiskMap />
        </div>
        <div className="space-y-6">
          <SystemHealth />
          <AnomalyFeed />
        </div>
      </div>
    </div>
  );
}

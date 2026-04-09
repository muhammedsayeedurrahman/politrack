'use client';

import { CardContent } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { MdWarningAmber, MdFolderOpen, MdPeople, MdTrendingUp } from 'react-icons/md';
import { cn } from '@/lib/utils';
import { StaggerList, StaggerItem } from '@/components/motion';
import CountUp from '@/components/reactbits/count-up';
import { MorphCard } from '@/components/motion';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  delta: number;
  deltaLabel: string;
  suffix?: string;
}

function StatCard({ title, value, icon, delta, deltaLabel, suffix }: StatCardProps) {
  const isPositive = delta >= 0;
  return (
    <StaggerItem>
      <MorphCard className="h-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">{title}</span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary text-xl" aria-hidden="true">{icon}</div>
          </div>
          <div className="text-3xl font-bold tracking-tight mb-1">
            <CountUp to={value} duration={1.5} separator="," />
            {suffix && <span>{suffix}</span>}
          </div>
          <div className="flex items-center gap-1 text-xs">
            {isPositive ? (
              <ArrowUpRight size={14} className="text-critical" aria-hidden="true" />
            ) : (
              <ArrowDownRight size={14} className="text-low" aria-hidden="true" />
            )}
            <span className="sr-only">{isPositive ? 'Increased' : 'Decreased'} by</span>
            <span className={cn(isPositive ? 'text-critical' : 'text-low')}>
              {Math.abs(delta)}%
            </span>
            <span className="text-muted-foreground">{deltaLabel}</span>
          </div>
        </CardContent>
      </MorphCard>
    </StaggerItem>
  );
}

export function StatsGrid() {
  return (
    <StaggerList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Active Alerts" value={47} icon={<MdWarningAmber />} delta={12} deltaLabel="vs last week" />
      <StatCard title="Open Cases" value={23} icon={<MdFolderOpen />} delta={-5} deltaLabel="vs last week" />
      <StatCard title="Entities Tracked" value={156} icon={<MdPeople />} delta={8} deltaLabel="vs last month" />
      <StatCard title="Avg Risk Score" value={42} icon={<MdTrendingUp />} delta={3} deltaLabel="vs last week" suffix="/100" />
    </StaggerList>
  );
}

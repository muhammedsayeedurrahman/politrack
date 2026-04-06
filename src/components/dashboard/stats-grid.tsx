'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, FolderOpen, Users, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  delta: number; // percentage change
  deltaLabel: string;
  format?: (n: number) => string;
}

function AnimatedNumber({ value, format }: { value: number; format?: (n: number) => string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const startTime = Date.now();
    function step() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, [value]);
  return <>{format ? format(display) : display}</>;
}

function StatCard({ title, value, icon, delta, deltaLabel, format }: StatCardProps) {
  const isPositive = delta >= 0;
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          <div className="p-2 rounded-lg bg-primary/10 text-primary" aria-hidden="true">{icon}</div>
        </div>
        <div className="text-3xl font-bold tracking-tight mb-1">
          <AnimatedNumber value={value} format={format} />
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
    </Card>
  );
}

export function StatsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Active Alerts" value={47} icon={<AlertTriangle size={20} />} delta={12} deltaLabel="vs last week" />
      <StatCard title="Open Cases" value={23} icon={<FolderOpen size={20} />} delta={-5} deltaLabel="vs last week" />
      <StatCard title="Entities Tracked" value={156} icon={<Users size={20} />} delta={8} deltaLabel="vs last month" />
      <StatCard title="Avg Risk Score" value={42} icon={<TrendingUp size={20} />} delta={3} deltaLabel="vs last week" format={(n) => `${n}/100`} />
    </div>
  );
}

'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDashboardStore } from '@/stores/dashboard-store';
import { Sunrise, ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function MorningBrief() {
  const [expanded, setExpanded] = useState(true);
  const { briefingDismissed, dismissBriefing } = useDashboardStore();

  if (briefingDismissed) return null;

  return (
    <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Sunrise size={16} className="text-primary" />
            Morning Intelligence Brief
          </CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setExpanded(!expanded)}>
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={dismissBriefing}>
              Dismiss
            </Button>
          </div>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Overnight Summary</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-semibold text-critical">3</span> critical alerts detected</p>
                <p><span className="font-semibold text-high">7</span> high-priority items pending</p>
                <p><span className="font-semibold text-low">12</span> alerts auto-resolved</p>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Priority Cases</h4>
              <div className="space-y-1.5">
                {['Infrastructure bid rigging in Lucknow', 'Shell company network in Gujarat', 'Procurement fraud - Ministry of Health'].map((c, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <AlertTriangle size={12} className="text-high shrink-0" />
                    <span className="truncate">{c}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Streak</h4>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={20} className="text-low" />
                <div>
                  <p className="text-2xl font-bold">7 days</p>
                  <p className="text-xs text-muted-foreground">All critical alerts reviewed within SLA</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2 pt-2 border-t">
            <Button size="sm" className="text-xs">
              Review Critical Alerts <ArrowRight size={12} className="ml-1" />
            </Button>
            <Button size="sm" variant="outline" className="text-xs">
              View Full Report
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

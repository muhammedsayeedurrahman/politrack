'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { generateThreatBriefing, type AIThreatBriefing } from '@/services/ai-analysis-service';
import { Sparkles, ShieldAlert, ChevronDown, ChevronUp, AlertTriangle, Target, TrendingUp, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const THREAT_LEVEL_CONFIG = {
  critical: { label: 'CRITICAL', className: 'bg-critical/10 text-critical border-critical/30', dotClass: 'bg-critical animate-pulse' },
  elevated: { label: 'ELEVATED', className: 'bg-high/10 text-high border-high/30', dotClass: 'bg-high' },
  moderate: { label: 'MODERATE', className: 'bg-medium/10 text-medium border-medium/30', dotClass: 'bg-medium' },
  low: { label: 'LOW', className: 'bg-low/10 text-low border-low/30', dotClass: 'bg-low' },
};

const SEVERITY_ICON_COLORS = {
  critical: 'text-critical',
  high: 'text-high',
  medium: 'text-medium',
};

export function ThreatBriefing() {
  const [expanded, setExpanded] = useState(true);

  const briefing: AIThreatBriefing = useMemo(() => generateThreatBriefing(), []);

  const levelConfig = THREAT_LEVEL_CONFIG[briefing.threatLevel];

  return (
    <Card className="bg-gradient-to-r from-primary/5 via-background to-secondary/5 border-primary/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ShieldAlert size={16} className="text-primary" />
            AI Threat Briefing
            <Badge
              variant="outline"
              className={cn('ml-2 text-[10px] font-bold uppercase gap-1', levelConfig.className)}
            >
              <span className={cn('h-1.5 w-1.5 rounded-full', levelConfig.dotClass)} />
              {levelConfig.label}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Sparkles size={10} className="text-primary" />
              AI-Generated
            </span>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setExpanded(!expanded)}>
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </Button>
          </div>
        </div>
        {!expanded && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{briefing.summary}</p>
        )}
      </CardHeader>
      {expanded && (
        <CardContent className="space-y-4">
          {/* What is this */}
          <div className="rounded-lg bg-muted/40 px-3 py-2">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">What is this?</strong> The AI scans all current alerts, entities, and cases to generate this daily threat briefing. It highlights what&apos;s most important, predicts emerging risks, and tells you where to focus today — so you don&apos;t have to read through every alert manually.
            </p>
          </div>

          {/* Summary */}
          <p className="text-sm leading-relaxed">{briefing.summary}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Key Findings */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle size={10} />
                Key Findings
              </h4>
              <div className="space-y-2">
                {briefing.keyFindings.map((finding, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <AlertTriangle
                      size={12}
                      className={cn('mt-0.5 shrink-0', SEVERITY_ICON_COLORS[finding.severity])}
                    />
                    <span className="text-xs leading-relaxed">{finding.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Focus Areas */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Target size={10} />
                Recommended Focus
              </h4>
              <div className="space-y-1.5">
                {briefing.focusAreas.map((area, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <span className="font-semibold text-primary shrink-0">{i + 1}.</span>
                    <span className="leading-relaxed">{area}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Predictions */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp size={10} />
                AI Predictions
              </h4>
              <div className="space-y-3">
                {briefing.predictions.map((prediction, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-xs leading-relaxed">{prediction.text}</p>
                    <div className="flex items-center gap-2">
                      <Progress value={prediction.confidence} className="h-1 flex-1" />
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {prediction.confidence}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t">
            <Button size="sm" className="text-xs">
              Review Critical Alerts <ArrowRight size={12} className="ml-1" />
            </Button>
            <Button size="sm" variant="outline" className="text-xs">
              Full Threat Report
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { aiAnalysisApi } from '@/services/api/ai-analysis-api';
import { ChevronDown, ChevronUp, Shield, Wrench } from 'lucide-react';
import { MdShield, MdAutoAwesome, MdWarning, MdGpsFixed, MdTrendingUp, MdArrowForward } from 'react-icons/md';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { motion as motionTokens } from '@/lib/design-tokens';
import ShinyText from '@/components/reactbits/shiny-text';

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

  const { data: briefing } = useQuery({
    queryKey: ['ai', 'threat-briefing'],
    queryFn: () => aiAnalysisApi.generateThreatBriefing(),
  });

  if (!briefing) return null;

  const levelConfig = THREAT_LEVEL_CONFIG[briefing.threatLevel];

  return (
    <Card className="bg-gradient-to-r from-primary/5 via-background to-secondary/5 border-primary/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MdShield size={16} className="text-primary" />
            <ShinyText
              text="AI Threat Briefing"
              speed={4}
              color="var(--foreground)"
              shineColor="var(--primary)"
              className="text-sm font-medium"
            />
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
              <Shield size={10} className="text-primary" />
              Report Writer Agent
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
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={motionTokens.normal}
          >
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-primary/5 border border-primary/15 px-3 py-2 space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">Report Writer Agent</strong> scans all current alerts, entities, and cases to generate this daily threat briefing using LLM-powered analysis.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {['query_alerts', 'query_entities', 'query_cases', 'calculate_entity_risk', 'build_entity_timeline'].map((tool) => (
                    <span key={tool} className="inline-flex items-center gap-0.5 rounded bg-muted px-1.5 py-0.5 text-[8px] font-mono text-muted-foreground">
                      <Wrench size={7} />
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-sm leading-relaxed">{briefing.summary}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <MdWarning size={10} />
                    Key Findings
                  </h4>
                  <div className="space-y-2">
                    {briefing.keyFindings.map((finding, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * i, ...motionTokens.normal }}
                        className="flex items-start gap-2"
                      >
                        <MdWarning
                          size={12}
                          className={cn('mt-0.5 shrink-0', SEVERITY_ICON_COLORS[finding.severity])}
                        />
                        <span className="text-xs leading-relaxed">{finding.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <MdGpsFixed size={10} />
                    Recommended Focus
                  </h4>
                  <div className="space-y-1.5">
                    {briefing.focusAreas.map((area, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * i, ...motionTokens.normal }}
                        className="flex items-start gap-2 text-xs"
                      >
                        <span className="font-semibold text-primary shrink-0">{i + 1}.</span>
                        <span className="leading-relaxed">{area}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <MdTrendingUp size={10} />
                    AI Predictions
                  </h4>
                  <div className="space-y-3">
                    {briefing.predictions.map((prediction, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 * i, ...motionTokens.normal }}
                        className="space-y-1"
                      >
                        <p className="text-xs leading-relaxed">{prediction.text}</p>
                        <div className="flex items-center gap-2">
                          <Progress value={prediction.confidence} className="h-1 flex-1" />
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {prediction.confidence}%
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <Button size="sm" className="text-xs">
                  Review Critical Alerts <MdArrowForward size={12} className="ml-1" />
                </Button>
                <Button size="sm" variant="outline" className="text-xs">
                  Full Threat Report
                </Button>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

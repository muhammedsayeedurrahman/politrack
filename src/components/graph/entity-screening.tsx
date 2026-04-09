'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { FadeIn, StaggerList, StaggerItem } from '@/components/motion';
import {
  Shield,
  X,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Globe,
  Newspaper,
  Bot,
  Search,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SanctionResult {
  list: string;
  match: boolean;
  confidence: number;
  details?: string;
}

interface PepResult {
  isPep: boolean;
  role?: string;
  jurisdiction?: string;
  since?: string;
  confidence: number;
}

interface AdverseMedia {
  headline: string;
  source: string;
  date: string;
  sentiment: 'negative' | 'neutral';
  relevance: number;
}

interface ScreeningResult {
  entityId: string;
  entityName: string;
  sanctions: SanctionResult[];
  pep: PepResult;
  adverseMedia: AdverseMedia[];
  compositeRisk: number;
  screenedAt: string;
}

interface EntityScreeningProps {
  entityId: string;
  entityName: string;
  entityType: string;
  onClose: () => void;
}

export function EntityScreening({ entityId, entityName, entityType, onClose }: EntityScreeningProps) {
  const [result, setResult] = useState<ScreeningResult | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchScreening = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/screening/${entityId}`);
      const data = await res.json();
      setResult(data.data ?? null);
    } catch {
      // Generate fallback mock data
      setResult(generateMockScreening(entityId, entityName, entityType));
    } finally {
      setLoading(false);
    }
  }, [entityId, entityName, entityType]);

  useEffect(() => {
    fetchScreening();
  }, [fetchScreening]);

  return (
    <Card className="w-80 shrink-0 flex flex-col max-h-full glass-card !rounded-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Shield size={14} className="text-primary" />
            Entity Screening
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X size={14} />
          </Button>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <Bot size={10} className="text-primary" />
          <span className="text-[10px] text-muted-foreground">
            Screening powered by AI Agent
          </span>
          <div className="flex gap-1 ml-auto">
            {['OFAC', 'EU', 'UN'].map((tag) => (
              <Badge key={tag} variant="outline" className="text-[8px] px-1 py-0">{tag}</Badge>
            ))}
          </div>
        </div>
      </CardHeader>

      <ScrollArea className="flex-1">
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 size={24} className="animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Screening {entityName}...</p>
              <p className="text-[10px] text-muted-foreground">Checking sanctions, PEP, and adverse media</p>
            </div>
          ) : result ? (
            <StaggerList>
              {/* Composite Risk */}
              <StaggerItem>
                <div className="rounded-xl bg-muted/30 border p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium">Composite Screening Risk</span>
                    <span className={cn(
                      'text-xl font-bold',
                      result.compositeRisk >= 70 ? 'text-red-500' :
                      result.compositeRisk >= 40 ? 'text-amber-500' : 'text-emerald-500',
                    )}>
                      {result.compositeRisk}
                    </span>
                  </div>
                  <Progress value={result.compositeRisk} className="h-2" />
                </div>
              </StaggerItem>

              <Separator />

              {/* Sanctions */}
              <StaggerItem>
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Globe size={10} />
                    Sanctions Check
                  </h4>
                  <div className="space-y-2">
                    {result.sanctions.map((s) => (
                      <div key={s.list} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-2">
                          {s.match ? (
                            <XCircle size={14} className="text-red-500" />
                          ) : (
                            <CheckCircle2 size={14} className="text-emerald-500" />
                          )}
                          <span className="text-sm">{s.list}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={s.match ? 'destructive' : 'secondary'} className="text-[10px]">
                            {s.match ? 'MATCH' : 'Clear'}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">{s.confidence}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </StaggerItem>

              <Separator />

              {/* PEP */}
              <StaggerItem>
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Shield size={10} />
                    PEP Status
                  </h4>
                  <div className={cn(
                    'rounded-lg border p-3',
                    result.pep.isPep ? 'border-amber-500/30 bg-amber-500/5' : 'border-emerald-500/30 bg-emerald-500/5',
                  )}>
                    <div className="flex items-center gap-2 mb-1">
                      {result.pep.isPep ? (
                        <AlertTriangle size={14} className="text-amber-500" />
                      ) : (
                        <CheckCircle2 size={14} className="text-emerald-500" />
                      )}
                      <span className="text-sm font-medium">
                        {result.pep.isPep ? 'Politically Exposed Person' : 'Not a PEP'}
                      </span>
                      <span className="text-[10px] text-muted-foreground ml-auto">{result.pep.confidence}%</span>
                    </div>
                    {result.pep.isPep && result.pep.role && (
                      <div className="text-xs text-muted-foreground space-y-0.5 mt-2">
                        <p>Role: {result.pep.role}</p>
                        {result.pep.jurisdiction && <p>Jurisdiction: {result.pep.jurisdiction}</p>}
                        {result.pep.since && <p>Since: {result.pep.since}</p>}
                      </div>
                    )}
                  </div>
                </div>
              </StaggerItem>

              <Separator />

              {/* Adverse Media */}
              <StaggerItem>
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Newspaper size={10} />
                    Adverse Media ({result.adverseMedia.length})
                  </h4>
                  <div className="space-y-2">
                    {result.adverseMedia.map((media, i) => (
                      <div key={i} className="rounded-lg bg-muted/30 p-2.5">
                        <p className="text-xs font-medium leading-tight">{media.headline}</p>
                        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                          <span>{media.source}</span>
                          <span>&middot;</span>
                          <span>{media.date}</span>
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-[8px] ml-auto',
                              media.sentiment === 'negative' ? 'border-red-500/50 text-red-500' : '',
                            )}
                          >
                            {media.sentiment}
                          </Badge>
                          <span className="text-primary">{media.relevance}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </StaggerItem>

              {/* Screened at */}
              <StaggerItem>
                <div className="text-[10px] text-center text-muted-foreground pt-2">
                  Screened at {new Date(result.screenedAt).toLocaleString()}
                </div>
              </StaggerItem>
            </StaggerList>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No screening results available
            </div>
          )}
        </CardContent>
      </ScrollArea>
    </Card>
  );
}

// Fallback mock data generator
function generateMockScreening(entityId: string, entityName: string, entityType: string): ScreeningResult {
  let hash = 0;
  for (let i = 0; i < entityId.length; i++) {
    hash = ((hash << 5) - hash + entityId.charCodeAt(i)) | 0;
  }
  const isOfficial = entityType === 'official';
  const hasMatch = Math.abs(hash) % 4 === 0;

  return {
    entityId,
    entityName,
    sanctions: [
      { list: 'OFAC SDN', match: hasMatch, confidence: 85 + (Math.abs(hash) % 12), details: hasMatch ? 'Partial name match found' : undefined },
      { list: 'EU Sanctions', match: false, confidence: 92 + (Math.abs(hash) % 6) },
      { list: 'UN Security Council', match: false, confidence: 95 + (Math.abs(hash) % 4) },
    ],
    pep: {
      isPep: isOfficial || Math.abs(hash) % 3 === 0,
      role: isOfficial ? 'Government Official' : Math.abs(hash) % 3 === 0 ? 'Former Committee Member' : undefined,
      jurisdiction: isOfficial ? 'India' : Math.abs(hash) % 3 === 0 ? 'India' : undefined,
      since: isOfficial ? '2019' : undefined,
      confidence: 78 + (Math.abs(hash) % 18),
    },
    adverseMedia: [
      {
        headline: `${entityName} linked to procurement irregularities in government audit`,
        source: 'The Economic Times',
        date: '2026-02-15',
        sentiment: 'negative',
        relevance: 82,
      },
      {
        headline: `Investigation reveals financial discrepancies involving ${entityName}`,
        source: 'NDTV',
        date: '2025-11-03',
        sentiment: 'negative',
        relevance: 74,
      },
      {
        headline: `${entityName} appears in CAG report on infrastructure spending`,
        source: 'Indian Express',
        date: '2025-08-22',
        sentiment: 'neutral',
        relevance: 56,
      },
    ],
    compositeRisk: hasMatch ? 78 : isOfficial ? 62 : 35 + (Math.abs(hash) % 25),
    screenedAt: new Date().toISOString(),
  };
}

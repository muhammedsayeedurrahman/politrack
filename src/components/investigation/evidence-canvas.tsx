'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useInvestigationStore } from '@/stores/investigation-store';
import { Case } from '@/types';
import { FileText, Network, Clock, File, MessageSquare, Receipt, BarChart3, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TimeAgo } from '@/components/shared/time-ago';
import { EmptyState } from '@/components/shared/empty-state';
import { CaseTimeline } from '@/components/investigation/case-timeline';
import { cn } from '@/lib/utils';

const EVIDENCE_ICONS = {
  document: FileText,
  transaction: Receipt,
  communication: MessageSquare,
  report: BarChart3,
};

interface EvidenceCanvasProps {
  caseData: Case | null;
}

export function EvidenceCanvas({ caseData }: EvidenceCanvasProps) {
  const { activeTab, setActiveTab } = useInvestigationStore();

  if (!caseData) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState title="Select a case" description="Choose a case from the queue to view its evidence" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="p-4 border-b">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold">{caseData.title}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{caseData.summary}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs shrink-0"
            onClick={() => {
              fetch(`/api/reports/case/${caseData.id}`)
                .then((res) => res.blob())
                .then((blob) => {
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `PolitiTrace-${caseData.id}-Report.pdf`;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  URL.revokeObjectURL(url);
                });
            }}
          >
            <FileDown size={12} />
            View Full Report
          </Button>
        </div>
      </div>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-2 w-fit" aria-label="Evidence views">
          <TabsTrigger value="documents" className="text-xs gap-1"><FileText size={14} aria-hidden="true" /> Documents ({caseData.evidence.length})</TabsTrigger>
          <TabsTrigger value="graph" className="text-xs gap-1"><Network size={14} aria-hidden="true" /> Graph</TabsTrigger>
          <TabsTrigger value="timeline" className="text-xs gap-1"><Clock size={14} aria-hidden="true" /> Timeline</TabsTrigger>
        </TabsList>
        <TabsContent value="documents" className="flex-1 m-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-3">
              {caseData.evidence.length === 0 ? (
                <EmptyState title="No evidence" description="No evidence documents attached to this case" />
              ) : (
                caseData.evidence.map(ev => {
                  const Icon = EVIDENCE_ICONS[ev.type];
                  return (
                    <Card key={ev.id} className="hover:shadow-sm transition-shadow cursor-pointer focus-within:ring-2 focus-within:ring-ring" role="button" tabIndex={0} aria-label={`Evidence: ${ev.title}, type: ${ev.type}`}>
                      <CardContent className="p-3 flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <Icon size={16} className="text-muted-foreground" aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium">{ev.title}</h4>
                            <Badge variant="outline" className="text-[10px] capitalize">{ev.type}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{ev.description}</p>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                            <span>Source: {ev.source}</span>
                            <TimeAgo timestamp={ev.timestamp} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="graph" className="flex-1 m-0 p-4">
          <div className="h-full rounded-lg border bg-muted/30 flex items-center justify-center">
            <EmptyState title="Case Network" description="Relationship graph for entities involved in this case" icon={<Network size={48} className="text-muted-foreground/30" />} />
          </div>
        </TabsContent>
        <TabsContent value="timeline" className="flex-1 m-0">
          <CaseTimeline caseData={caseData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

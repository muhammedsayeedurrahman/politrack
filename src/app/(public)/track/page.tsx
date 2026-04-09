'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FadeIn } from '@/components/motion';
import {
  Shield,
  ArrowLeft,
  Search,
  CheckCircle2,
  Clock,
  FileSearch,
  AlertTriangle,
  XCircle,
  FileDown,
  Loader2,
  Zap,
  Brain,
  Network,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import GradientText from '@/components/reactbits/gradient-text';
import { cn } from '@/lib/utils';

type ComplaintStatus = 'received' | 'under_review' | 'investigating' | 'resolved' | 'dismissed';

interface TimelineEntry {
  status: ComplaintStatus;
  timestamp: string;
  note: string;
}

interface TrackingData {
  trackingCode: string;
  category: string;
  status: ComplaintStatus;
  submittedAt: string;
  updatedAt: string;
  timeline: TimelineEntry[];
}

const STATUS_CONFIG: Record<ComplaintStatus, { label: string; icon: React.ReactNode; color: string; bgColor: string }> = {
  received: { label: 'Received', icon: <CheckCircle2 size={16} />, color: 'text-blue-500', bgColor: 'bg-blue-500/10 border-blue-500/20' },
  under_review: { label: 'Under Review', icon: <FileSearch size={16} />, color: 'text-amber-500', bgColor: 'bg-amber-500/10 border-amber-500/20' },
  investigating: { label: 'Under Investigation', icon: <Search size={16} />, color: 'text-orange-500', bgColor: 'bg-orange-500/10 border-orange-500/20' },
  resolved: { label: 'Resolved', icon: <CheckCircle2 size={16} />, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10 border-emerald-500/20' },
  dismissed: { label: 'Dismissed', icon: <XCircle size={16} />, color: 'text-gray-500', bgColor: 'bg-gray-500/10 border-gray-500/20' },
};

const CATEGORY_LABELS: Record<string, string> = {
  bribery: 'Bribery',
  procurement_fraud: 'Procurement Fraud',
  conflict_of_interest: 'Conflict of Interest',
  embezzlement: 'Embezzlement',
  other: 'Other',
};

const AGENT_STEPS = [
  { agent: 'Triage Agent', icon: <Zap size={14} />, action: 'Classifying report category and severity...' },
  { agent: 'Investigation Agent', icon: <Brain size={14} />, action: 'Cross-referencing entities and existing cases...' },
  { agent: 'Network Agent', icon: <Network size={14} />, action: 'Analyzing connection patterns and relationships...' },
  { agent: 'Report Agent', icon: <FileText size={14} />, action: 'Compiling findings and generating report...' },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function TrackPage() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState(searchParams.get('code') ?? '');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<TrackingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [agentStep, setAgentStep] = useState(-1);
  const [showResults, setShowResults] = useState(false);

  const handleTrack = useCallback(async (trackingCode?: string) => {
    const searchCode = (trackingCode ?? code).trim().toUpperCase();
    if (!searchCode) return;

    setIsLoading(true);
    setError(null);
    setData(null);
    setShowResults(false);
    setAgentStep(0);

    try {
      const res = await fetch(`/api/complaints/track?code=${encodeURIComponent(searchCode)}`);
      const json = await res.json();

      if (!json.success || !json.data) {
        setError(json.error ?? 'Report not found');
        setAgentStep(-1);
        setIsLoading(false);
        return;
      }

      // Simulate agent processing steps
      for (let i = 0; i < AGENT_STEPS.length; i++) {
        setAgentStep(i);
        await new Promise((resolve) => setTimeout(resolve, 600));
      }

      setData(json.data);
      setAgentStep(-1);
      setIsLoading(false);

      // Small delay before showing results for animation
      setTimeout(() => setShowResults(true), 100);
    } catch {
      setError('Failed to connect to server. Please try again.');
      setAgentStep(-1);
      setIsLoading(false);
    }
  }, [code]);

  // Auto-track if code is in URL
  useEffect(() => {
    const urlCode = searchParams.get('code');
    if (urlCode) {
      setCode(urlCode);
      handleTrack(urlCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownloadPdf = () => {
    if (!data) return;
    fetch(`/api/reports/complaint?code=${encodeURIComponent(data.trackingCode)}`)
      .then((res) => res.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `PolitiTrace-${data.trackingCode}-Report.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      });
  };

  const statusConfig = data ? STATUS_CONFIG[data.status] : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b glass-header">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <GradientText
              colors={['#4A90D9', '#38B2AC', '#4A90D9']}
              animationSpeed={6}
              className="text-sm font-bold tracking-tight"
            >
              PolitiTrace
            </GradientText>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/report">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                <Shield size={14} /> Submit Report
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                <ArrowLeft size={14} /> Back to Platform
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Title */}
        <FadeIn direction="none">
          <div className="text-center space-y-3">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Search size={28} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Track Your Report</h1>
            <p className="text-muted-foreground max-w-md mx-auto text-sm">
              Enter your anonymous tracking code to check the status of your whistleblower report.
              No login required.
            </p>
          </div>
        </FadeIn>

        {/* Search */}
        <FadeIn direction="up" delay={0.1}>
          <Card className="glass-card !rounded-2xl max-w-lg mx-auto">
            <CardContent className="p-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleTrack();
                }}
                className="flex gap-3"
              >
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Enter tracking code (e.g., WB-2026-ABC123)"
                  className="font-mono text-sm tracking-wider"
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading || !code.trim()} className="gap-1.5 shrink-0">
                  {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                  Track
                </Button>
              </form>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Agent Processing Animation */}
        {isLoading && agentStep >= 0 && (
          <FadeIn direction="up">
            <Card className="glass-card !rounded-2xl max-w-lg mx-auto">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Loader2 size={14} className="animate-spin text-primary" />
                  AI Agent Pipeline Processing...
                </div>
                <div className="space-y-3">
                  {AGENT_STEPS.map((step, i) => (
                    <div
                      key={i}
                      className={cn(
                        'flex items-center gap-3 rounded-lg border px-3 py-2 transition-all duration-300',
                        i < agentStep
                          ? 'bg-emerald-500/5 border-emerald-500/20'
                          : i === agentStep
                          ? 'bg-primary/5 border-primary/30 animate-pulse'
                          : 'bg-muted/30 border-transparent opacity-40',
                      )}
                    >
                      <div className={cn(
                        'shrink-0',
                        i < agentStep ? 'text-emerald-500' : i === agentStep ? 'text-primary' : 'text-muted-foreground',
                      )}>
                        {i < agentStep ? <CheckCircle2 size={14} /> : step.icon}
                      </div>
                      <div className="flex-1">
                        <span className="text-xs font-semibold">{step.agent}</span>
                        <p className="text-[11px] text-muted-foreground">{step.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        )}

        {/* Error */}
        {error && (
          <FadeIn direction="up">
            <Card className="glass-card !rounded-2xl max-w-lg mx-auto border-red-500/20">
              <CardContent className="p-6 text-center space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle size={24} className="text-red-500" />
                </div>
                <p className="text-sm font-medium">Report Not Found</p>
                <p className="text-xs text-muted-foreground">{error}</p>
              </CardContent>
            </Card>
          </FadeIn>
        )}

        {/* Results */}
        {data && showResults && statusConfig && (
          <FadeIn direction="up">
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Status Card */}
              <Card className="glass-card !rounded-2xl">
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Tracking Code</p>
                      <code className="text-lg font-bold font-mono tracking-wider text-primary">{data.trackingCode}</code>
                    </div>
                    <Badge className={cn('border', statusConfig.bgColor, statusConfig.color, 'gap-1')}>
                      {statusConfig.icon}
                      {statusConfig.label}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-lg bg-muted/30 p-3">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Category</p>
                      <p className="text-sm font-medium capitalize">{CATEGORY_LABELS[data.category] ?? data.category}</p>
                    </div>
                    <div className="rounded-lg bg-muted/30 p-3">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Submitted</p>
                      <p className="text-sm font-medium">{formatDate(data.submittedAt)}</p>
                    </div>
                    <div className="rounded-lg bg-muted/30 p-3">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Last Updated</p>
                      <p className="text-sm font-medium">{formatDate(data.updatedAt)}</p>
                    </div>
                  </div>

                  {/* Status Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      {(['received', 'under_review', 'investigating', 'resolved'] as ComplaintStatus[]).map((status, i) => {
                        const statusCfg = STATUS_CONFIG[status];
                        const isActive = ['received', 'under_review', 'investigating', 'resolved'].indexOf(data.status) >= i;
                        const isCurrent = data.status === status;
                        return (
                          <div key={status} className="flex flex-col items-center flex-1">
                            <div className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all mb-1',
                              isCurrent
                                ? `${statusCfg.color} border-current bg-current/10`
                                : isActive
                                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                                : 'border-muted text-muted-foreground',
                            )}>
                              {isActive && !isCurrent ? <CheckCircle2 size={12} /> : statusCfg.icon}
                            </div>
                            <span className={cn(
                              'text-[9px] font-medium',
                              isCurrent ? statusCfg.color : isActive ? 'text-emerald-500' : 'text-muted-foreground',
                            )}>
                              {statusCfg.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card className="glass-card !rounded-2xl">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Clock size={14} className="text-primary" />
                    Processing Timeline
                  </h3>
                  <div className="space-y-4">
                    {data.timeline.map((entry, i) => {
                      const entryCfg = STATUS_CONFIG[entry.status];
                      return (
                        <div key={i} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className={cn('w-6 h-6 rounded-full flex items-center justify-center', entryCfg.bgColor, entryCfg.color, 'border')}>
                              {entryCfg.icon}
                            </div>
                            {i < data.timeline.length - 1 && (
                              <div className="w-px h-full bg-border mt-1" />
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={cn('text-xs font-semibold', entryCfg.color)}>{entryCfg.label}</span>
                              <span className="text-[10px] text-muted-foreground">{formatDate(entry.timestamp)}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{entry.note}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Download Report */}
              <Card className="glass-card !rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold">Download Full Report</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Auto-generated PDF with all details, AI processing steps, and timeline.
                      </p>
                    </div>
                    <Button onClick={handleDownloadPdf} className="gap-1.5">
                      <FileDown size={14} />
                      Export PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </FadeIn>
        )}
      </main>
    </div>
  );
}

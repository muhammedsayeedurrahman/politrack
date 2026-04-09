'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { motion as motionTokens } from '@/lib/design-tokens';
import {
  Bot, Brain, Search, Network, FileText, Shield, Wrench,
  CheckCircle2, Loader2, Play, RotateCcw, ChevronDown, ChevronUp,
  Zap, Eye, AlertTriangle, TrendingUp, Target, Sparkles,
} from 'lucide-react';
import { MdAutoAwesome } from 'react-icons/md';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AgentStep {
  id: string;
  agent: string;
  agentIcon: React.ReactNode;
  action: string;
  detail: string;
  toolsUsed?: string[];
  status: 'pending' | 'active' | 'done';
  result?: string;
  confidence?: number;
  durationMs?: number;
}

interface SwarmAgent {
  id: string;
  name: string;
  icon: React.ReactNode;
  status: 'idle' | 'working' | 'done';
  task: string;
  color: string;
}

// ---------------------------------------------------------------------------
// Agent Investigation Demo
// ---------------------------------------------------------------------------

const INVESTIGATION_STEPS: Omit<AgentStep, 'status'>[] = [
  {
    id: 'step-1',
    agent: 'Supervisor Agent',
    agentIcon: <Shield size={14} />,
    action: 'Routing investigation query',
    detail: 'Classifying intent and selecting specialist agents for case analysis',
    toolsUsed: ['intent_classifier', 'agent_router'],
  },
  {
    id: 'step-2',
    agent: 'Triage Agent',
    agentIcon: <AlertTriangle size={14} />,
    action: 'Analyzing linked alerts',
    detail: 'Querying 47 active alerts, scoring risk, identifying patterns',
    toolsUsed: ['query_alerts', 'count_alerts', 'calculate_entity_risk'],
    result: '5 critical alerts found, 3 linked to shell companies',
    confidence: 92,
  },
  {
    id: 'step-3',
    agent: 'Investigation Agent',
    agentIcon: <Search size={14} />,
    action: 'Deep-dive case analysis',
    detail: 'Gathering evidence, mapping entity connections, building timeline',
    toolsUsed: ['get_case_details', 'query_entities', 'build_case_timeline', 'calculate_entity_risk'],
    result: 'Risk factors: Transaction Anomalies (85%), Network Centrality (72%)',
    confidence: 87,
  },
  {
    id: 'step-4',
    agent: 'Network Analyst',
    agentIcon: <Network size={14} />,
    action: 'Graph pattern detection',
    detail: 'Running community detection, hub analysis, and official-corporate nexus scan',
    toolsUsed: ['detect_communities', 'calculate_centrality', 'detect_hubs', 'detect_conflict_of_interest'],
    result: 'Found: 3 hub entities, 1 high-risk cluster, official-corporate nexus detected',
    confidence: 89,
  },
  {
    id: 'step-5',
    agent: 'Pattern Detector',
    agentIcon: <Eye size={14} />,
    action: 'Corruption pattern matching',
    detail: 'Scanning for shell companies, bid rigging, kickbacks, conflict of interest',
    toolsUsed: ['detect_shell_companies', 'detect_bid_rigging', 'detect_kickbacks'],
    result: '2 shell company suspects, bid rigging pattern in procurement alerts',
    confidence: 78,
  },
  {
    id: 'step-6',
    agent: 'Report Writer',
    agentIcon: <FileText size={14} />,
    action: 'Generating investigation report',
    detail: 'Synthesizing findings from all agents into actionable intelligence report',
    toolsUsed: ['build_entity_timeline', 'build_case_timeline'],
    result: 'Report generated with 5 risk factors, 4 recommendations, 3 patterns detected',
    confidence: 91,
  },
];

const SWARM_AGENTS: SwarmAgent[] = [
  { id: 'supervisor', name: 'Supervisor', icon: <Shield size={16} />, status: 'idle', task: 'Orchestrating', color: 'text-primary' },
  { id: 'triage', name: 'Triage', icon: <AlertTriangle size={16} />, status: 'idle', task: 'Alert Analysis', color: 'text-critical' },
  { id: 'investigator', name: 'Investigator', icon: <Search size={16} />, status: 'idle', task: 'Case Deep-Dive', color: 'text-info' },
  { id: 'network', name: 'Network Analyst', icon: <Network size={16} />, status: 'idle', task: 'Graph Analysis', color: 'text-secondary' },
  { id: 'pattern', name: 'Pattern Detector', icon: <Eye size={16} />, status: 'idle', task: 'Pattern Matching', color: 'text-high' },
  { id: 'reporter', name: 'Report Writer', icon: <FileText size={16} />, status: 'idle', task: 'Report Generation', color: 'text-low' },
];

export function AgentInvestigation() {
  const [steps, setSteps] = useState<AgentStep[]>(
    INVESTIGATION_STEPS.map((s) => ({ ...s, status: 'pending' as const })),
  );
  const [swarmAgents, setSwarmAgents] = useState<SwarmAgent[]>(SWARM_AGENTS);
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [currentStepIdx, setCurrentStepIdx] = useState(-1);
  const [elapsedMs, setElapsedMs] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasAutoRun = useRef(false);

  const reset = useCallback(() => {
    setSteps(INVESTIGATION_STEPS.map((s) => ({ ...s, status: 'pending' as const })));
    setSwarmAgents(SWARM_AGENTS);
    setIsRunning(false);
    setIsDone(false);
    setCurrentStepIdx(-1);
    setElapsedMs(0);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const runInvestigation = useCallback(async () => {
    reset();
    setIsRunning(true);
    setExpanded(true);

    const startTime = Date.now();
    timerRef.current = setInterval(() => setElapsedMs(Date.now() - startTime), 100);

    for (let i = 0; i < INVESTIGATION_STEPS.length; i++) {
      setCurrentStepIdx(i);

      // Activate swarm agent
      const agentMap: Record<number, string> = { 0: 'supervisor', 1: 'triage', 2: 'investigator', 3: 'network', 4: 'pattern', 5: 'reporter' };
      setSwarmAgents((prev) =>
        prev.map((a) =>
          a.id === agentMap[i] ? { ...a, status: 'working' as const } : a,
        ),
      );

      // Mark step active
      setSteps((prev) =>
        prev.map((s, idx) => (idx === i ? { ...s, status: 'active' as const } : s)),
      );

      // Simulate agent work (800-2000ms per step)
      const duration = 800 + Math.random() * 1200;
      await new Promise((r) => setTimeout(r, duration));

      // Mark step done
      setSteps((prev) =>
        prev.map((s, idx) =>
          idx === i ? { ...s, status: 'done' as const, durationMs: Math.round(duration) } : s,
        ),
      );

      // Mark swarm agent done
      setSwarmAgents((prev) =>
        prev.map((a) =>
          a.id === agentMap[i] ? { ...a, status: 'done' as const } : a,
        ),
      );
    }

    if (timerRef.current) clearInterval(timerRef.current);
    setElapsedMs(Date.now() - startTime);
    setIsRunning(false);
    setIsDone(true);
  }, [reset]);

  // Auto-start on first mount for demo wow-factor
  useEffect(() => {
    if (!hasAutoRun.current) {
      hasAutoRun.current = true;
      const timer = setTimeout(() => runInvestigation(), 600);
      return () => clearTimeout(timer);
    }
  }, [runInvestigation]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const doneCount = steps.filter((s) => s.status === 'done').length;
  const avgConfidence = steps.filter((s) => s.confidence).length > 0
    ? Math.round(
        steps
          .filter((s) => s.confidence)
          .reduce((sum, s) => sum + (s.confidence ?? 0), 0) /
          steps.filter((s) => s.confidence).length,
      )
    : 0;

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            'flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20',
            isRunning && 'agent-thinking',
          )}>
            <MdAutoAwesome size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold flex items-center gap-2">
              Agentic AI Investigation
              {isRunning && (
                <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30 animate-pulse">
                  LIVE
                </Badge>
              )}
              {isDone && (
                <Badge variant="outline" className="text-[10px] bg-low/10 text-low border-low/30">
                  COMPLETE
                </Badge>
              )}
            </h2>
            <p className="text-xs text-muted-foreground">
              Multi-agent swarm orchestration with real-time tool calling
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(elapsedMs > 0) && (
            <span className="text-xs font-mono text-muted-foreground">
              {(elapsedMs / 1000).toFixed(1)}s
            </span>
          )}
          {!isRunning && !isDone && (
            <Button size="sm" onClick={runInvestigation} className="gap-1.5">
              <Play size={14} /> Run Investigation
            </Button>
          )}
          {isDone && (
            <Button size="sm" variant="outline" onClick={reset} className="gap-1.5">
              <RotateCcw size={14} /> Reset
            </Button>
          )}
          {isRunning && (
            <Button size="sm" variant="outline" disabled className="gap-1.5">
              <Loader2 size={14} className="animate-spin" /> Running...
            </Button>
          )}
          <Button variant="ghost" size="icon-sm" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </Button>
        </div>
      </div>

      {/* Agent Swarm Visualization */}
      <div className="px-5 pb-3">
        <div className="flex items-center gap-1 mb-2">
          <Zap size={10} className="text-primary" />
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Agent Swarm</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {swarmAgents.map((agent) => (
            <motion.div
              key={agent.id}
              layout
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-all',
                agent.status === 'idle' && 'bg-muted/50 border-transparent text-muted-foreground',
                agent.status === 'working' && 'bg-primary/10 border-primary/30 text-primary shadow-sm shadow-primary/10',
                agent.status === 'done' && 'bg-low/10 border-low/30 text-low',
              )}
            >
              <span className={cn(agent.status === 'working' && 'animate-spin')}>
                {agent.status === 'done' ? <CheckCircle2 size={12} /> : agent.icon}
              </span>
              {agent.name}
              {agent.status === 'working' && (
                <span className="flex gap-0.5 ml-1">
                  <span className="h-1 w-1 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
                  <span className="h-1 w-1 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
                  <span className="h-1 w-1 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      {(isRunning || isDone) && (
        <div className="px-5 pb-3">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
            <span>{doneCount}/{steps.length} steps complete</span>
            {isDone && avgConfidence > 0 && (
              <span className="flex items-center gap-1">
                <Target size={9} />
                Avg confidence: {avgConfidence}%
              </span>
            )}
          </div>
          <Progress value={(doneCount / steps.length) * 100} className="h-1.5" />
        </div>
      )}

      {/* Steps */}
      <AnimatePresence>
        {expanded && (isRunning || isDone) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Separator />
            <div className="px-5 py-3 space-y-1">
              {steps.map((step, idx) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05, ...motionTokens.fast }}
                  className={cn(
                    'flex items-start gap-3 rounded-xl px-3 py-2.5 transition-all',
                    step.status === 'active' && 'bg-primary/5 ring-1 ring-primary/20',
                    step.status === 'done' && 'opacity-90',
                    step.status === 'pending' && 'opacity-40',
                  )}
                >
                  {/* Status icon */}
                  <div className="mt-0.5">
                    {step.status === 'done' && <CheckCircle2 size={16} className="text-low" />}
                    {step.status === 'active' && <Loader2 size={16} className="text-primary animate-spin" />}
                    {step.status === 'pending' && <div className="size-4 rounded-full border-2 border-muted-foreground/30" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={cn(
                        'text-xs font-semibold',
                        step.status === 'active' && 'text-primary',
                      )}>
                        {step.agent}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{step.action}</span>
                      {step.durationMs && (
                        <span className="text-[10px] font-mono text-muted-foreground ml-auto">
                          {(step.durationMs / 1000).toFixed(1)}s
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">{step.detail}</p>

                    {/* Tools used */}
                    {step.toolsUsed && step.status !== 'pending' && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {step.toolsUsed.map((tool) => (
                          <span
                            key={tool}
                            className="inline-flex items-center gap-0.5 rounded-md bg-muted px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground"
                          >
                            <Wrench size={8} />
                            {tool}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Result */}
                    {step.result && step.status === 'done' && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1.5 rounded-lg bg-low/5 border border-low/20 px-2.5 py-1.5 text-[11px] text-foreground flex items-start gap-1.5"
                      >
                        <Sparkles size={10} className="text-low mt-0.5 shrink-0" />
                        {step.result}
                      </motion.div>
                    )}

                    {/* Confidence */}
                    {step.confidence && step.status === 'done' && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[9px] text-muted-foreground">Confidence</span>
                        <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden max-w-[100px]">
                          <motion.div
                            className={cn(
                              'h-full rounded-full',
                              step.confidence >= 85 ? 'bg-low' : step.confidence >= 70 ? 'bg-medium' : 'bg-high',
                            )}
                            initial={{ width: 0 }}
                            animate={{ width: `${step.confidence}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                          />
                        </div>
                        <span className="text-[9px] font-mono text-muted-foreground">{step.confidence}%</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Final summary */}
            {isDone && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mx-5 mb-4 rounded-xl bg-gradient-to-r from-primary/10 via-secondary/5 to-low/10 border border-primary/20 p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Brain size={16} className="text-primary" />
                  <span className="text-sm font-semibold">Investigation Complete</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">6 AI agents</strong> collaborated to analyze alerts, entities, network connections, and corruption patterns.
                  Identified <strong className="text-critical">2 shell company suspects</strong>,{' '}
                  <strong className="text-high">1 official-corporate nexus</strong>, and{' '}
                  <strong className="text-high">bid rigging patterns</strong> across procurement data.
                  Average confidence: <strong className="text-foreground">{avgConfidence}%</strong>.
                </p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" className="text-xs gap-1">
                    <FileText size={12} /> View Full Report
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs gap-1">
                    <TrendingUp size={12} /> Export Findings
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

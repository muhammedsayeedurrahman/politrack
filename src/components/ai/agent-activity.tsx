'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Wrench, Brain, CheckCircle2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AgentStep {
  id: string;
  agent: string;
  action: 'reasoning' | 'tool_call' | 'decision';
  label: string;
  detail?: string;
  status: 'pending' | 'active' | 'done';
  confidence?: number;
}

interface AgentActivityProps {
  steps: AgentStep[];
  isActive: boolean;
  agentName?: string;
}

// ---------------------------------------------------------------------------
// Step Icons
// ---------------------------------------------------------------------------

function StepIcon({ action, status }: { action: AgentStep['action']; status: AgentStep['status'] }) {
  if (status === 'done') {
    return <CheckCircle2 size={12} className="text-low" />;
  }
  if (status === 'active') {
    return <Loader2 size={12} className="text-primary animate-spin" />;
  }

  switch (action) {
    case 'reasoning':
      return <Brain size={12} className="text-muted-foreground" />;
    case 'tool_call':
      return <Wrench size={12} className="text-muted-foreground" />;
    case 'decision':
      return <Bot size={12} className="text-muted-foreground" />;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AgentActivity({ steps, isActive, agentName = 'AI Agent' }: AgentActivityProps) {
  const [expanded, setExpanded] = useState(true);
  const activeStep = steps.find((s) => s.status === 'active');
  const doneCount = steps.filter((s) => s.status === 'done').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left"
      >
        <div className={cn(
          'flex size-6 items-center justify-center rounded-full bg-primary/10',
          isActive && 'agent-thinking',
        )}>
          <Bot size={12} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium">{agentName}</span>
          {activeStep && (
            <p className="text-[10px] text-muted-foreground truncate">
              {activeStep.label}
            </p>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground">
          {doneCount}/{steps.length}
        </span>
        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {/* Steps */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-2 space-y-1">
              {steps.map((step, idx) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={cn(
                    'flex items-start gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors',
                    step.status === 'active' && 'bg-primary/5 step-active',
                    step.status === 'done' && 'opacity-70',
                  )}
                >
                  <div className="mt-0.5">
                    <StepIcon action={step.action} status={step.status} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={cn(
                      'font-medium',
                      step.status === 'active' && 'text-primary',
                    )}>
                      {step.label}
                    </span>
                    {step.detail && step.status === 'done' && (
                      <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                        {step.detail}
                      </p>
                    )}
                  </div>
                  {step.confidence !== undefined && step.status === 'done' && (
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {step.confidence}%
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Confidence Meter
// ---------------------------------------------------------------------------

export function ConfidenceMeter({ value, label }: { value: number; label?: string }) {
  const color = value >= 80 ? 'bg-low' : value >= 60 ? 'bg-medium' : 'bg-high';

  return (
    <div className="space-y-1">
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">{label}</span>
          <span className="text-[10px] font-medium">{value}%</span>
        </div>
      )}
      <div className="h-1 rounded-full bg-muted overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full', color)}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

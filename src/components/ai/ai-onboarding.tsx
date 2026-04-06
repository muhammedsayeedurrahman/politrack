'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAIStore } from '@/stores/ai-store';
import {
  Bot,
  ShieldAlert,
  Brain,
  Filter,
  Network,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  Keyboard,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  {
    icon: Sparkles,
    title: 'Welcome to AI-Powered PolitiTrace',
    subtitle: 'Your investigations just got smarter',
    description:
      'PolitiTrace now includes an Agentic AI system that works alongside you. It continuously analyzes entities, alerts, cases, and network connections to surface insights you might miss. Think of it as a tireless junior analyst who reads everything and highlights what matters.',
    details: [
      'All AI features are clearly labeled with a sparkle icon so you always know what\'s AI-generated',
      'AI suggestions are recommendations, not decisions — you stay in control',
      'The AI uses only the data already in the platform — no external data leaves the system',
    ],
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: Bot,
    title: 'AI Copilot — Your Investigation Assistant',
    subtitle: 'Available on every page via the floating button or Ctrl+J',
    description:
      'The AI Copilot is a chat assistant that understands what you\'re looking at. Open it from any page and ask questions in plain language. It knows which page you\'re on, which case or entity is selected, and tailors its answers accordingly.',
    details: [
      '"Analyze this case" — Get a full breakdown of the case you\'re viewing',
      '"What are the top threats?" — Instant threat summary from the dashboard',
      '"Find suspicious patterns" — AI scans the network for anomalies',
      'It suggests relevant prompts based on the page you\'re on',
    ],
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: ShieldAlert,
    title: 'AI Threat Briefing — Your Daily Snapshot',
    subtitle: 'Appears at the top of your Dashboard',
    description:
      'Every time you open the Dashboard, the AI generates a threat briefing based on current data. It tells you the overall threat level, highlights the most important findings, and suggests where to focus your attention today. No more sifting through hundreds of alerts manually.',
    details: [
      'Threat level indicator (Low / Moderate / Elevated / Critical) based on real alert data',
      'Key findings ranked by severity so you see the worst items first',
      'Recommended focus areas — the AI tells you exactly what to look at today',
      'AI predictions with confidence scores — spot emerging risks before they escalate',
    ],
    color: 'text-high',
    bgColor: 'bg-high/10',
  },
  {
    icon: Brain,
    title: 'AI Investigation Intel — Smarter Case Analysis',
    subtitle: 'In the sidebar when you open any investigation case',
    description:
      'When you select a case in Investigations, the sidebar now shows dynamic AI analysis instead of static text. The AI reads the case\'s linked entities, alerts, evidence, and tags, then generates a custom risk breakdown and recommends what to do next.',
    details: [
      'Risk factors computed from real entity data, not hardcoded numbers',
      'AI confidence score — see how certain the AI is about its analysis',
      'Pattern detection — automatically spots shell companies, bid rigging, etc.',
      'Action recommendations specific to each case type and its evidence',
      'Click "Regenerate" to get a fresh analysis anytime',
    ],
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: Filter,
    title: 'AI Alert Triage — Stop Drowning in Alerts',
    subtitle: 'New column and insights panel on the Alerts page',
    description:
      'With hundreds of alerts, knowing which ones matter is half the battle. The AI examines each alert\'s priority, risk score, and the risk level of the entity it\'s linked to, then recommends an action: Escalate, Investigate, Monitor, or Auto-dismiss. You also get cluster analysis showing which alerts are related.',
    details: [
      'Each alert gets a colored triage badge: Escalate (red), Investigate (orange), Monitor (yellow), Auto-dismiss (gray)',
      'Hover over any badge to see why the AI made that recommendation',
      'Insight cards at the top show detected clusters — "5 alerts around Entity X" etc.',
      'Sortable by AI triage so you can process escalations first',
    ],
    color: 'text-critical',
    bgColor: 'bg-critical/10',
  },
  {
    icon: Network,
    title: 'AI Network Pattern Detection — See the Invisible',
    subtitle: 'Insight panel on the Network Graph page',
    description:
      'The network graph can have dozens of entities and hundreds of connections. The AI scans the graph and identifies patterns that are hard to spot visually: hub entities that connect everything, clusters of high-risk nodes, chains between officials and companies, and suspicious low-confidence inferred links.',
    details: [
      'Hub Detection — finds entities with the most connections (potential kingpins)',
      'High-Risk Clusters — groups of dangerous entities connected to each other',
      'Official-Corporate Nexus — flags direct links between government officials and companies',
      'Select any entity to get an AI narrative explaining its role in the network',
      'Click entity names in patterns to jump directly to them on the graph',
    ],
    color: 'text-medium',
    bgColor: 'bg-medium/10',
  },
] as const;

export function AIOnboarding() {
  const { onboardingDismissed, dismissOnboarding, setPanelOpen } = useAIStore();
  const [step, setStep] = useState(0);

  if (onboardingDismissed) return null;

  const current = STEPS[step];
  const Icon = current.icon;
  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;

  const handleFinish = () => {
    dismissOnboarding();
    setPanelOpen(true);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-xl bg-background shadow-2xl border overflow-hidden">
        {/* Close button */}
        <button
          onClick={dismissOnboarding}
          className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-muted transition-colors z-10"
          aria-label="Skip onboarding"
        >
          <X size={16} className="text-muted-foreground" />
        </button>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 pt-4">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={cn(
                'h-1.5 rounded-full transition-all',
                i === step ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50',
              )}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className={cn('flex size-12 items-center justify-center rounded-xl', current.bgColor)}>
              <Icon size={24} className={current.color} />
            </div>
            <div>
              <h2 className="text-base font-bold">{current.title}</h2>
              <p className="text-xs text-muted-foreground">{current.subtitle}</p>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-foreground/90">{current.description}</p>

          <div className="space-y-2 rounded-lg bg-muted/50 p-3">
            {current.details.map((detail, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span className="text-xs leading-relaxed">{detail}</span>
              </div>
            ))}
          </div>

          {isFirst && (
            <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-2.5">
              <Keyboard size={16} className="text-primary shrink-0" />
              <p className="text-xs">
                <strong>Quick tip:</strong> Press <kbd className="mx-0.5 rounded bg-muted px-1 py-0.5 font-mono text-[10px]">Ctrl</kbd> + <kbd className="mx-0.5 rounded bg-muted px-1 py-0.5 font-mono text-[10px]">J</kbd> anytime to open the AI Copilot
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between border-t p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep(step - 1)}
            disabled={isFirst}
            className="text-xs"
          >
            <ArrowLeft size={14} className="mr-1" />
            Back
          </Button>

          <span className="text-xs text-muted-foreground">
            {step + 1} of {STEPS.length}
          </span>

          {isLast ? (
            <Button size="sm" className="text-xs" onClick={handleFinish}>
              Get Started
              <Sparkles size={14} className="ml-1" />
            </Button>
          ) : (
            <Button size="sm" className="text-xs" onClick={() => setStep(step + 1)}>
              Next
              <ArrowRight size={14} className="ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

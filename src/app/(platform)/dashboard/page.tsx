'use client';

import { StatsGrid } from '@/components/dashboard/stats-grid';
import { SystemHealth } from '@/components/dashboard/system-health';
import { AnomalyFeed } from '@/components/dashboard/anomaly-feed';
import { TrendChart } from '@/components/dashboard/trend-chart';
import { MorningBrief } from '@/components/dashboard/morning-brief';
import { ThreatBriefing } from '@/components/ai/threat-briefing';
import { AgentInvestigation } from '@/components/ai/agent-investigation';
import { RiskMap } from '@/components/dashboard/risk-map';
import { LeafletCSS } from '@/components/dashboard/leaflet-css';
import { FadeIn } from '@/components/motion';
import BlurText from '@/components/reactbits/blur-text';
import Particles from '@/components/reactbits/particles';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <LeafletCSS />

      {/* Subtle particles hero background */}
      <div className="relative -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 px-4 sm:px-6 pt-6 pb-2 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-30">
          <Particles
            particleCount={60}
            particleSpread={8}
            speed={0.03}
            particleColors={['#4A90D9', '#38B2AC', '#6366F1']}
            alphaParticles
            particleBaseSize={50}
            sizeRandomness={0.6}
            cameraDistance={30}
            disableRotation
          />
        </div>
        <FadeIn direction="none">
          <div className="relative z-10">
            <BlurText
              text="Dashboard"
              className="text-2xl font-bold tracking-tight"
              delay={80}
              animateBy="letters"
            />
            <p className="text-sm text-muted-foreground">Real-time corruption intelligence monitoring</p>
          </div>
        </FadeIn>
      </div>

      <FadeIn direction="up" delay={0.1}>
        <AgentInvestigation />
      </FadeIn>

      <FadeIn direction="up" delay={0.15}>
        <ThreatBriefing />
      </FadeIn>

      <FadeIn direction="up" delay={0.2}>
        <MorningBrief />
      </FadeIn>

      <StatsGrid />

      <FadeIn direction="up" delay={0.25}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <TrendChart />
            <RiskMap />
          </div>
          <div className="space-y-6">
            <SystemHealth />
            <AnomalyFeed />
          </div>
        </div>
      </FadeIn>
    </div>
  );
}

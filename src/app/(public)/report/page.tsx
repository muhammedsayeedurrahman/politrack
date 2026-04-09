'use client';

import { useRef, useCallback } from 'react';
import { ComplaintForm } from '@/components/whistleblower/complaint-form';
import { FadeIn } from '@/components/motion';
import { Shield, ArrowLeft, Play, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import GradientText from '@/components/reactbits/gradient-text';

export default function ReportPage() {
  const demoFnRef = useRef<(() => void) | null>(null);

  const handleDemoReady = useCallback((fn: () => void) => {
    demoFnRef.current = fn;
  }, []);

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
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
              onClick={() => demoFnRef.current?.()}
            >
              <Play size={12} /> Auto-Fill Demo
            </Button>
            <Link href="/track">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                <Search size={14} /> Track Report
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

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <FadeIn direction="none">
          <div className="text-center space-y-3">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Shield size={28} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Anonymous Whistleblower Portal</h1>
            <p className="text-muted-foreground max-w-md mx-auto text-sm">
              Report corruption safely and anonymously. Your identity is never recorded.
              All submissions are encrypted and cannot be traced back to you.
            </p>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.1}>
          <ComplaintForm onDemoReady={handleDemoReady} />
        </FadeIn>
      </main>
    </div>
  );
}

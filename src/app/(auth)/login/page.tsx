'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MdShield, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import Particles from '@/components/reactbits/particles';
import Aurora from '@/components/reactbits/aurora';
import GradientText from '@/components/reactbits/gradient-text';
import { FadeIn, ScaleIn } from '@/components/motion';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background p-4 overflow-hidden">
      {/* Animated Particles Background */}
      <div className="absolute inset-0 z-0">
        <Particles
          particleCount={120}
          particleSpread={12}
          speed={0.05}
          particleColors={['#4A90D9', '#38B2AC', '#6366F1', '#8B5CF6']}
          moveParticlesOnHover
          particleHoverFactor={2}
          alphaParticles
          particleBaseSize={80}
          sizeRandomness={0.8}
          cameraDistance={25}
        />
      </div>

      {/* Aurora glow at the top */}
      <div className="absolute top-0 left-0 right-0 h-64 z-0 opacity-40">
        <Aurora
          colorStops={['#4A90D9', '#38B2AC', '#6366F1']}
          amplitude={1.2}
          blend={0.6}
          speed={0.5}
        />
      </div>

      {/* Login Card */}
      <ScaleIn>
        <Card className="relative z-10 w-full max-w-md border-border/50 bg-card/90 backdrop-blur-md shadow-xl">
          <CardHeader className="text-center">
            <FadeIn direction="down" delay={0.2}>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
                <MdShield className="h-8 w-8 text-primary-foreground" />
              </div>
            </FadeIn>
            <GradientText
              colors={['#4A90D9', '#38B2AC', '#4A90D9']}
              animationSpeed={6}
              className="text-2xl font-bold"
            >
              PolitiTrace
            </GradientText>
            <CardDescription>
              Sign in to the Corruption Intelligence Platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FadeIn direction="up" delay={0.3}>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Email</label>
                  <Input type="email" placeholder="officer@cbi.gov.in" defaultValue="aditya.thakur@cbi.gov.in" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      defaultValue="demo123"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <MdVisibilityOff size={16} /> : <MdVisibility size={16} />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Sign In
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Demo mode — click Sign In to continue
                </p>
              </form>
            </FadeIn>
          </CardContent>
        </Card>
      </ScaleIn>
    </div>
  );
}

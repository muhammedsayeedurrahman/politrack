'use client';

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface GsapRevealProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  duration?: number;
  delay?: number;
  ease?: string;
  stagger?: number;
}

/**
 * GSAP-powered scroll-triggered reveal for heavier timeline-based animations.
 * Use FadeIn for simple reveals; use GsapReveal when you need GSAP timelines.
 */
export function GsapReveal({
  children,
  className,
  direction = 'up',
  distance = 60,
  duration = 0.8,
  delay = 0,
  ease = 'power3.out',
}: GsapRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const axis = direction === 'left' || direction === 'right' ? 'x' : 'y';
    const offset =
      direction === 'up' || direction === 'left' ? distance : -distance;

    gsap.set(el, { [axis]: offset, opacity: 0 });

    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(el, {
          [axis]: 0,
          opacity: 1,
          duration,
          delay,
          ease,
        });
      },
    });

    return () => st.kill();
  }, [direction, distance, duration, delay, ease]);

  return (
    <div ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}

'use client';

import { getRiskLevel, getRiskColor } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface RiskGaugeProps {
  score: number;
  size?: number;
  className?: string;
}

export function RiskGauge({ score, size = 120, className }: RiskGaugeProps) {
  const level = getRiskLevel(score);
  const color = getRiskColor(score);
  const circumference = 2 * Math.PI * 45;
  const dashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="transform -rotate-90" width={size} height={size}>
        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted" />
        <circle cx="50" cy="50" r="45" fill="none" stroke={color} strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={dashoffset} strokeLinecap="round" className="transition-all duration-1000" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold" style={{ color }}>{score}</span>
        <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">{level}</span>
      </div>
    </div>
  );
}

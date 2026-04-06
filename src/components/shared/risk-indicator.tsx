'use client';

import { cn } from '@/lib/utils';
import { getRiskLevel } from '@/lib/constants';

interface RiskIndicatorProps {
  score: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const RISK_COLORS = {
  critical: 'bg-critical',
  high: 'bg-high',
  medium: 'bg-medium',
  low: 'bg-low',
};

const SIZE_MAP = {
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
};

export function RiskIndicator({ score, showLabel = false, size = 'md', className }: RiskIndicatorProps) {
  const level = getRiskLevel(score);
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('flex-1 rounded-full bg-muted overflow-hidden', SIZE_MAP[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', RISK_COLORS[level])}
          style={{ width: `${score}%` }}
        />
      </div>
      {showLabel && (
        <span className={cn('text-xs font-mono tabular-nums', `text-${level}`)}>
          {score}
        </span>
      )}
    </div>
  );
}

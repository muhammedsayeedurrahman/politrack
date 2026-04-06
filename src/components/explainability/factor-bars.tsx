'use client';

import { Progress } from '@/components/ui/progress';
import { RiskFactor } from '@/types';

interface FactorBarsProps {
  factors: RiskFactor[];
}

export function FactorBars({ factors }: FactorBarsProps) {
  const sorted = [...factors].sort((a, b) => b.weight * b.score - a.weight * a.score);
  return (
    <div className="space-y-3">
      {sorted.map(factor => (
        <div key={factor.name}>
          <div className="flex items-center justify-between text-sm mb-1">
            <span>{factor.name}</span>
            <span className="font-mono text-xs">{factor.score}%</span>
          </div>
          <Progress value={factor.score} className="h-2" />
          <div className="flex justify-between mt-0.5">
            <span className="text-[10px] text-muted-foreground">{factor.description}</span>
            <span className="text-[10px] text-muted-foreground">Weight: {factor.weight}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}

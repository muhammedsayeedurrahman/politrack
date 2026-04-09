'use client';

import { motion } from 'motion/react';
import { elevation, motion as motionTokens } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

interface MorphCardProps {
  children: React.ReactNode;
  className?: string;
  hoverScale?: number;
  onClick?: () => void;
  glass?: boolean;
}

export function MorphCard({
  children,
  className,
  hoverScale = 1.015,
  onClick,
  glass = true,
}: MorphCardProps) {
  return (
    <motion.div
      className={cn(
        'rounded-xl border text-card-foreground transition-colors',
        glass ? 'glass-card' : 'border-border bg-card',
        onClick && 'cursor-pointer',
        className
      )}
      whileHover={{
        scale: hoverScale,
        transition: motionTokens.fast,
      }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      layout
    >
      {children}
    </motion.div>
  );
}

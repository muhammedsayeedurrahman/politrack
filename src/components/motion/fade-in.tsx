'use client';

import { motion, type Variants } from 'motion/react';
import { variants as presets } from '@/lib/design-tokens';

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

interface FadeInProps {
  children: React.ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}

const directionVariants: Record<Direction, Variants> = {
  up: presets.fadeInUp,
  down: presets.fadeInDown,
  left: presets.fadeInLeft,
  right: presets.fadeInRight,
  none: presets.fadeIn,
};

export function FadeIn({
  children,
  direction = 'up',
  delay = 0,
  duration,
  className,
  once = true,
}: FadeInProps) {
  const variant = directionVariants[direction];

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-60px' }}
      variants={variant}
      transition={duration ? { duration, delay } : { delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

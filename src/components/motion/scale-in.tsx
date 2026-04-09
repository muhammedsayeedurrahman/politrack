'use client';

import { motion } from 'motion/react';
import { variants } from '@/lib/design-tokens';

interface ScaleInProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  once?: boolean;
}

export function ScaleIn({
  children,
  delay = 0,
  className,
  once = true,
}: ScaleInProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-40px' }}
      variants={variants.scaleIn}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

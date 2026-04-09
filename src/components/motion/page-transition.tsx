'use client';

import { motion, AnimatePresence } from 'motion/react';
import { motion as motionTokens } from '@/lib/design-tokens';

interface PageTransitionProps {
  children: React.ReactNode;
  /** Unique key for the page (e.g. pathname) */
  pageKey: string;
  className?: string;
}

export function PageTransition({ children, pageKey, className }: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pageKey}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={motionTokens.expressive}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

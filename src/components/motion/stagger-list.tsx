'use client';

import { motion } from 'motion/react';
import { variants } from '@/lib/design-tokens';

interface StaggerListProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  once?: boolean;
}

export function StaggerList({
  children,
  className,
  staggerDelay,
  once = true,
}: StaggerListProps) {
  const containerVariants = staggerDelay
    ? {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: staggerDelay, delayChildren: 0.1 },
        },
      }
    : variants.staggerContainer;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-40px' }}
      variants={containerVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={variants.staggerItem} className={className}>
      {children}
    </motion.div>
  );
}

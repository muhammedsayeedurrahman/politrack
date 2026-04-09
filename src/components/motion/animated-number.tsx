'use client';

import CountUp from '@/components/reactbits/count-up';

interface AnimatedNumberProps {
  value: number;
  from?: number;
  duration?: number;
  separator?: string;
  className?: string;
  format?: (n: number) => string;
}

/**
 * Animated number display using React Bits CountUp.
 * Smoothly animates from `from` to `value` with spring physics.
 */
export function AnimatedNumber({
  value,
  from = 0,
  duration = 1.5,
  separator = ',',
  className,
}: AnimatedNumberProps) {
  return (
    <CountUp
      to={value}
      from={from}
      duration={duration}
      separator={separator}
      className={className}
    />
  );
}

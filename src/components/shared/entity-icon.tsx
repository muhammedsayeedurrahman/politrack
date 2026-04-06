'use client';

import { User, Building2, Shield, FileText } from 'lucide-react';
import { EntityType } from '@/types';
import { cn } from '@/lib/utils';

const ICON_MAP = {
  person: User,
  company: Building2,
  official: Shield,
  contract: FileText,
} as const;

interface EntityIconProps {
  type: EntityType;
  size?: number;
  className?: string;
}

export function EntityIcon({ type, size = 16, className }: EntityIconProps) {
  const Icon = ICON_MAP[type];
  return <Icon size={size} className={cn('shrink-0', className)} />;
}

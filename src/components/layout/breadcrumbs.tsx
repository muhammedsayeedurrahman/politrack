'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const LABEL_MAP: Record<string, string> = {
  dashboard: 'Dashboard',
  investigations: 'Investigations',
  network: 'Network Graph',
  alerts: 'Alerts',
  settings: 'Settings',
};

export function Breadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1 text-sm', className)}>
      <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
        <Home size={14} />
      </Link>
      {segments.map((segment, i) => {
        const href = '/' + segments.slice(0, i + 1).join('/');
        const isLast = i === segments.length - 1;
        const label = LABEL_MAP[segment] || segment;

        return (
          <span key={href} className="flex items-center gap-1">
            <ChevronRight size={12} className="text-muted-foreground" />
            {isLast ? (
              <span className="font-medium">{label}</span>
            ) : (
              <Link href={href} className="text-muted-foreground hover:text-foreground transition-colors">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

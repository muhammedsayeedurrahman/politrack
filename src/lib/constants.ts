import { AlertPriority } from '@/types/alert';
import { EntityType } from '@/types/entity';
import { CaseStatus } from '@/types/case';

export const RISK_LEVELS = {
  critical: { min: 70, max: 100, label: 'Critical', color: 'hsl(0, 72%, 51%)' },
  high: { min: 50, max: 69, label: 'High', color: 'hsl(25, 95%, 53%)' },
  medium: { min: 30, max: 49, label: 'Medium', color: 'hsl(45, 93%, 47%)' },
  low: { min: 0, max: 29, label: 'Low', color: 'hsl(142, 71%, 45%)' },
} as const;

export const PRIORITY_CONFIG: Record<AlertPriority, { label: string; className: string; dotClass: string }> = {
  critical: { label: 'Critical', className: 'bg-critical/10 text-critical border-critical/30', dotClass: 'bg-critical' },
  high: { label: 'High', className: 'bg-high/10 text-high border-high/30', dotClass: 'bg-high' },
  medium: { label: 'Medium', className: 'bg-medium/10 text-medium border-medium/30', dotClass: 'bg-medium' },
  low: { label: 'Low', className: 'bg-low/10 text-low border-low/30', dotClass: 'bg-low' },
};

export const ENTITY_TYPE_CONFIG: Record<EntityType, { label: string; icon: string }> = {
  person: { label: 'Person', icon: 'User' },
  company: { label: 'Company', icon: 'Building2' },
  official: { label: 'Official', icon: 'Shield' },
  contract: { label: 'Contract', icon: 'FileText' },
};

export const CASE_STATUS_CONFIG: Record<CaseStatus, { label: string; className: string }> = {
  new: { label: 'New', className: 'bg-info/10 text-info border-info/30' },
  in_progress: { label: 'In Progress', className: 'bg-primary/10 text-primary border-primary/30' },
  pending: { label: 'Pending', className: 'bg-medium/10 text-medium border-medium/30' },
  closed: { label: 'Closed', className: 'bg-muted text-muted-foreground border-muted' },
};

export const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/investigations', label: 'Investigations', icon: 'Search' },
  { href: '/network', label: 'Network', icon: 'Network' },
  { href: '/alerts', label: 'Alerts', icon: 'Bell' },
  { href: '/settings', label: 'Settings', icon: 'Settings' },
] as const;

export const INDIA_CENTER = { lat: 22.5, lng: 78.5 };
export const MAP_DEFAULT_ZOOM = 5;

export function getRiskLevel(score: number): 'critical' | 'high' | 'medium' | 'low' {
  if (score >= 70) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 30) return 'medium';
  return 'low';
}

export function getRiskColor(score: number): string {
  const level = getRiskLevel(score);
  return RISK_LEVELS[level].color;
}

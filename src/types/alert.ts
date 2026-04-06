import { EntityType } from './entity';
import { TimeRange } from './common';

export type AlertPriority = 'critical' | 'high' | 'medium' | 'low';

export interface Alert {
  id: string;
  title: string;
  description: string;
  priority: AlertPriority;
  entityId: string;
  entityName: string;
  entityType: EntityType;
  riskScore: number;
  timestamp: string;
  isRead: boolean;
  isDismissed: boolean;
  source: string;
  location?: { lat: number; lng: number };
  category: string;
}

export interface AlertFilter {
  priority?: AlertPriority[];
  entityType?: EntityType[];
  timeRange?: TimeRange;
  isRead?: boolean;
  search?: string;
}

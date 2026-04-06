export type EntityType = 'person' | 'company' | 'official' | 'contract';
export type EntityStatus = 'active' | 'flagged' | 'cleared' | 'under_investigation';

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  riskScore: number;
  connectionCount: number;
  lastActivity: string;
  status: EntityStatus;
  metadata: Record<string, string>;
  location?: { lat: number; lng: number };
  department?: string;
  designation?: string;
}

export interface RiskFactor {
  name: string;
  weight: number;
  score: number;
  description: string;
}

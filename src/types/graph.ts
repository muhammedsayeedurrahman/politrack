import { EntityType } from './entity';

export interface GraphNode {
  data: {
    id: string;
    label: string;
    type: EntityType;
    riskScore: number;
    connectionCount: number;
    status?: string;
  };
}

export interface GraphEdge {
  data: {
    id: string;
    source: string;
    target: string;
    label: string;
    confidence: number;
    type: 'financial' | 'organizational' | 'familial' | 'contractual';
    isInferred: boolean;
  };
}

export type GraphLayout = 'fcose' | 'circle' | 'grid' | 'breadthfirst' | 'concentric';

export interface GraphFilter {
  entityTypes: EntityType[];
  minRiskScore: number;
  maxRiskScore: number;
  edgeTypes: GraphEdge['data']['type'][];
  search: string;
}

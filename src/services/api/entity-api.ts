import { apiGet } from '@/lib/api-client';
import type { Entity, EntityType } from '@/types';

export interface EntityFilter {
  type?: EntityType[];
  status?: Array<'active' | 'flagged' | 'cleared' | 'under_investigation'>;
  minRiskScore?: number;
  maxRiskScore?: number;
  department?: string;
  search?: string;
}

export const entityApi = {
  getEntities(filter?: EntityFilter): Promise<Entity[]> {
    return apiGet<Entity[]>('/entities', {
      type: filter?.type,
      status: filter?.status,
      minRiskScore: filter?.minRiskScore,
      maxRiskScore: filter?.maxRiskScore,
      department: filter?.department,
      search: filter?.search,
    });
  },

  getEntity(id: string): Promise<Entity | null> {
    return apiGet<Entity>(`/entities/${id}`);
  },

  search(q: string): Promise<Entity[]> {
    return apiGet<Entity[]>('/entities/search', { q });
  },

  getHighRiskEntities(threshold?: number): Promise<Entity[]> {
    return apiGet<Entity[]>('/entities/high-risk', { threshold });
  },

  getEntitiesByType(): Promise<Record<EntityType, number>> {
    return apiGet<Record<EntityType, number>>('/entities/by-type');
  },

  getEntitiesByIds(ids: string[]): Promise<Entity[]> {
    // For now, fetch all and filter; can be optimized later with a dedicated endpoint
    return apiGet<Entity[]>('/entities').then((all) => {
      const idSet = new Set(ids);
      return all.filter((e) => idSet.has(e.id));
    });
  },
};

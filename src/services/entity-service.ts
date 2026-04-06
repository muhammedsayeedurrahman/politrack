import { Entity, EntityType, EntityStatus } from '@/types';
import { mockEntities } from './mock-data';

export interface EntityFilter {
  type?: EntityType[];
  status?: EntityStatus[];
  minRiskScore?: number;
  maxRiskScore?: number;
  department?: string;
  search?: string;
}

const entities: Entity[] = [...mockEntities];

export const entityService = {
  getEntities(filter?: EntityFilter): Promise<Entity[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filtered = [...entities];

        if (filter?.type?.length) {
          filtered = filtered.filter((e) => filter.type!.includes(e.type));
        }

        if (filter?.status?.length) {
          filtered = filtered.filter((e) =>
            filter.status!.includes(e.status),
          );
        }

        if (filter?.minRiskScore !== undefined) {
          filtered = filtered.filter(
            (e) => e.riskScore >= filter.minRiskScore!,
          );
        }

        if (filter?.maxRiskScore !== undefined) {
          filtered = filtered.filter(
            (e) => e.riskScore <= filter.maxRiskScore!,
          );
        }

        if (filter?.department) {
          const dept = filter.department.toLowerCase();
          filtered = filtered.filter(
            (e) =>
              e.department?.toLowerCase().includes(dept) ||
              e.metadata.department?.toLowerCase().includes(dept),
          );
        }

        if (filter?.search) {
          const s = filter.search.toLowerCase();
          filtered = filtered.filter(
            (e) =>
              e.name.toLowerCase().includes(s) ||
              e.department?.toLowerCase().includes(s) ||
              e.designation?.toLowerCase().includes(s) ||
              Object.values(e.metadata).some((v) =>
                v.toLowerCase().includes(s),
              ),
          );
        }

        filtered.sort((a, b) => b.riskScore - a.riskScore);

        resolve(filtered);
      }, 300);
    });
  },

  getEntity(id: string): Promise<Entity | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const found = entities.find((e) => e.id === id) ?? null;
        resolve(found);
      }, 200);
    });
  },

  search(query: string): Promise<Entity[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!query.trim()) {
          resolve([]);
          return;
        }

        const q = query.toLowerCase();
        const results = entities
          .filter(
            (e) =>
              e.name.toLowerCase().includes(q) ||
              e.id.toLowerCase().includes(q) ||
              e.department?.toLowerCase().includes(q) ||
              e.designation?.toLowerCase().includes(q),
          )
          .sort((a, b) => {
            // Exact name start match ranks higher
            const aStarts = a.name.toLowerCase().startsWith(q) ? 1 : 0;
            const bStarts = b.name.toLowerCase().startsWith(q) ? 1 : 0;
            if (aStarts !== bStarts) return bStarts - aStarts;
            return b.riskScore - a.riskScore;
          })
          .slice(0, 20);

        resolve(results);
      }, 200);
    });
  },

  getHighRiskEntities(threshold: number = 70): Promise<Entity[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const highRisk = entities
          .filter((e) => e.riskScore >= threshold)
          .sort((a, b) => b.riskScore - a.riskScore);
        resolve(highRisk);
      }, 200);
    });
  },

  getEntitiesByType(): Promise<Record<EntityType, number>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const counts: Record<EntityType, number> = {
          person: 0,
          company: 0,
          official: 0,
          contract: 0,
        };
        for (const e of entities) {
          counts[e.type]++;
        }
        resolve(counts);
      }, 100);
    });
  },

  getEntitiesByIds(ids: string[]): Promise<Entity[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const idSet = new Set(ids);
        const found = entities.filter((e) => idSet.has(e.id));
        resolve(found);
      }, 150);
    });
  },
};

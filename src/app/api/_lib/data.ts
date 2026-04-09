/**
 * Server-side data access module.
 *
 * Wraps the mock data generators with mutable copies and getter/setter helpers.
 * When a real database is introduced, only this file needs to change.
 */

import {
  mockEntities,
  mockAlerts,
  mockCases,
  mockGraphNodes,
  mockGraphEdges,
  generateNewAlert,
} from '@/services/mock-data';
import type { Alert, AlertFilter, Case, Entity, GraphNode, GraphEdge, GraphFilter, EntityType, CaseStatus, AlertPriority } from '@/types';

// ---------------------------------------------------------------------------
// Mutable copies (in-memory "database")
// ---------------------------------------------------------------------------

let alerts: Alert[] = [...mockAlerts];
let cases: Case[] = [...mockCases];
const entities: Entity[] = [...mockEntities];
const allNodes: GraphNode[] = [...mockGraphNodes];
const allEdges: GraphEdge[] = [...mockGraphEdges];

// ---------------------------------------------------------------------------
// Alerts
// ---------------------------------------------------------------------------

export function getAlerts(filter?: AlertFilter): Alert[] {
  let filtered = [...alerts];

  if (filter?.priority?.length) {
    filtered = filtered.filter((a) => filter.priority!.includes(a.priority));
  }
  if (filter?.entityType?.length) {
    filtered = filtered.filter((a) => filter.entityType!.includes(a.entityType));
  }
  if (filter?.isRead !== undefined) {
    filtered = filtered.filter((a) => a.isRead === filter.isRead);
  }
  if (filter?.search) {
    const s = filter.search.toLowerCase();
    filtered = filtered.filter(
      (a) => a.title.toLowerCase().includes(s) || a.entityName.toLowerCase().includes(s),
    );
  }

  filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return filtered;
}

export function getAlertById(id: string): Alert | null {
  return alerts.find((a) => a.id === id) ?? null;
}

export function markAlertAsRead(id: string): Alert | null {
  let updated: Alert | null = null;
  alerts = alerts.map((a) => {
    if (a.id !== id) return a;
    updated = { ...a, isRead: true };
    return updated;
  });
  return updated;
}

export function dismissAlert(id: string): Alert | null {
  let updated: Alert | null = null;
  alerts = alerts.map((a) => {
    if (a.id !== id) return a;
    updated = { ...a, isDismissed: true };
    return updated;
  });
  return updated;
}

export function simulateNewAlert(): Alert {
  const newAlert = generateNewAlert();
  alerts = [newAlert, ...alerts];
  return newAlert;
}

export function getUnreadAlertCount(): number {
  return alerts.filter((a) => !a.isRead && !a.isDismissed).length;
}

// ---------------------------------------------------------------------------
// Cases
// ---------------------------------------------------------------------------

export interface CaseFilter {
  status?: CaseStatus[];
  priority?: AlertPriority[];
  assignee?: string;
  search?: string;
  tags?: string[];
}

export function getCases(filter?: CaseFilter): Case[] {
  let filtered = [...cases];

  if (filter?.status?.length) {
    filtered = filtered.filter((c) => filter.status!.includes(c.status));
  }
  if (filter?.priority?.length) {
    filtered = filtered.filter((c) => filter.priority!.includes(c.priority));
  }
  if (filter?.assignee) {
    const assignee = filter.assignee.toLowerCase();
    filtered = filtered.filter((c) => c.assignee.toLowerCase().includes(assignee));
  }
  if (filter?.tags?.length) {
    filtered = filtered.filter((c) => filter.tags!.some((tag) => c.tags.includes(tag)));
  }
  if (filter?.search) {
    const s = filter.search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.title.toLowerCase().includes(s) ||
        c.summary.toLowerCase().includes(s) ||
        c.assignee.toLowerCase().includes(s),
    );
  }

  filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  return filtered;
}

export function getCaseById(id: string): Case | null {
  return cases.find((c) => c.id === id) ?? null;
}

export function updateCaseStatus(id: string, status: CaseStatus): Case | null {
  let updated: Case | null = null;
  cases = cases.map((c) => {
    if (c.id !== id) return c;
    updated = {
      ...c,
      status,
      updatedAt: new Date().toISOString(),
      activities: [
        ...c.activities,
        {
          id: `act-${Date.now()}`,
          type: 'status_changed',
          description: `Case status changed from "${c.status}" to "${status}".`,
          user: 'System',
          timestamp: new Date().toISOString(),
        },
      ],
    };
    return updated;
  });
  return updated;
}

export function updateCasePriority(id: string, priority: AlertPriority): Case | null {
  let updated: Case | null = null;
  cases = cases.map((c) => {
    if (c.id !== id) return c;
    updated = {
      ...c,
      priority,
      updatedAt: new Date().toISOString(),
      activities: [
        ...c.activities,
        {
          id: `act-${Date.now()}`,
          type: 'updated',
          description: `Case priority changed from "${c.priority}" to "${priority}".`,
          user: 'System',
          timestamp: new Date().toISOString(),
        },
      ],
    };
    return updated;
  });
  return updated;
}

export function addCaseComment(id: string, comment: string, user: string): Case | null {
  let updated: Case | null = null;
  cases = cases.map((c) => {
    if (c.id !== id) return c;
    updated = {
      ...c,
      updatedAt: new Date().toISOString(),
      activities: [
        ...c.activities,
        {
          id: `act-${Date.now()}`,
          type: 'comment',
          description: comment,
          user,
          timestamp: new Date().toISOString(),
        },
      ],
    };
    return updated;
  });
  return updated;
}

export function createCase(data: {
  title: string;
  summary: string;
  priority: AlertPriority;
  assignee?: string;
  tags?: string[];
}): Case {
  const now = new Date().toISOString();
  const id = `case-${Date.now().toString(36)}`;
  const newCase: Case = {
    id,
    title: data.title,
    status: 'new',
    priority: data.priority,
    assignee: data.assignee ?? 'Unassigned',
    entityIds: [],
    alertIds: [],
    summary: data.summary,
    riskScore: data.priority === 'critical' ? 85 : data.priority === 'high' ? 65 : data.priority === 'medium' ? 45 : 25,
    createdAt: now,
    updatedAt: now,
    evidence: [],
    activities: [
      {
        id: `act-${Date.now()}`,
        type: 'created',
        description: 'Case created.',
        user: 'System',
        timestamp: now,
      },
    ],
    tags: data.tags ?? [],
  };
  cases = [newCase, ...cases];
  return newCase;
}

// ---------------------------------------------------------------------------
// Entities
// ---------------------------------------------------------------------------

export interface EntityFilter {
  type?: EntityType[];
  status?: Array<'active' | 'flagged' | 'cleared' | 'under_investigation'>;
  minRiskScore?: number;
  maxRiskScore?: number;
  department?: string;
  search?: string;
}

export function getEntities(filter?: EntityFilter): Entity[] {
  let filtered = [...entities];

  if (filter?.type?.length) {
    filtered = filtered.filter((e) => filter.type!.includes(e.type));
  }
  if (filter?.status?.length) {
    filtered = filtered.filter((e) => filter.status!.includes(e.status));
  }
  if (filter?.minRiskScore !== undefined) {
    filtered = filtered.filter((e) => e.riskScore >= filter.minRiskScore!);
  }
  if (filter?.maxRiskScore !== undefined) {
    filtered = filtered.filter((e) => e.riskScore <= filter.maxRiskScore!);
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
        Object.values(e.metadata).some((v) => v.toLowerCase().includes(s)),
    );
  }

  filtered.sort((a, b) => b.riskScore - a.riskScore);
  return filtered;
}

export function getEntityById(id: string): Entity | null {
  return entities.find((e) => e.id === id) ?? null;
}

export function searchEntities(query: string): Entity[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return entities
    .filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q) ||
        e.department?.toLowerCase().includes(q) ||
        e.designation?.toLowerCase().includes(q),
    )
    .sort((a, b) => {
      const aStarts = a.name.toLowerCase().startsWith(q) ? 1 : 0;
      const bStarts = b.name.toLowerCase().startsWith(q) ? 1 : 0;
      if (aStarts !== bStarts) return bStarts - aStarts;
      return b.riskScore - a.riskScore;
    })
    .slice(0, 20);
}

export function getHighRiskEntities(threshold: number = 70): Entity[] {
  return entities
    .filter((e) => e.riskScore >= threshold)
    .sort((a, b) => b.riskScore - a.riskScore);
}

export function getEntitiesByType(): Record<EntityType, number> {
  const counts: Record<EntityType, number> = { person: 0, company: 0, official: 0, contract: 0 };
  for (const e of entities) {
    counts[e.type]++;
  }
  return counts;
}

export function getEntitiesByIds(ids: string[]): Entity[] {
  const idSet = new Set(ids);
  return entities.filter((e) => idSet.has(e.id));
}

// ---------------------------------------------------------------------------
// Graph
// ---------------------------------------------------------------------------

function buildAdjacency(): Map<string, { nodeId: string; edgeId: string }[]> {
  const adj = new Map<string, { nodeId: string; edgeId: string }[]>();
  for (const edge of allEdges) {
    const { source, target, id } = edge.data;
    if (!adj.has(source)) adj.set(source, []);
    adj.get(source)!.push({ nodeId: target, edgeId: id });
    if (!adj.has(target)) adj.set(target, []);
    adj.get(target)!.push({ nodeId: source, edgeId: id });
  }
  return adj;
}

const adjacency = buildAdjacency();

export function getGraphData(filter?: GraphFilter): { nodes: GraphNode[]; edges: GraphEdge[] } {
  let filteredNodes = [...allNodes];
  let filteredEdges = [...allEdges];

  if (filter) {
    if (filter.entityTypes.length > 0) {
      const typeSet = new Set<EntityType>(filter.entityTypes);
      filteredNodes = filteredNodes.filter((n) => typeSet.has(n.data.type));
    }
    filteredNodes = filteredNodes.filter(
      (n) => n.data.riskScore >= filter.minRiskScore && n.data.riskScore <= filter.maxRiskScore,
    );
    if (filter.edgeTypes.length > 0) {
      const edgeTypeSet = new Set(filter.edgeTypes);
      filteredEdges = filteredEdges.filter((e) => edgeTypeSet.has(e.data.type));
    }
    if (filter.search) {
      const s = filter.search.toLowerCase();
      filteredNodes = filteredNodes.filter((n) => n.data.label.toLowerCase().includes(s));
    }
  }

  const nodeIdSet = new Set(filteredNodes.map((n) => n.data.id));
  filteredEdges = filteredEdges.filter(
    (e) => nodeIdSet.has(e.data.source) && nodeIdSet.has(e.data.target),
  );

  return { nodes: filteredNodes, edges: filteredEdges };
}

export function getNodeConnections(entityId: string, depth: number = 1): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const visitedNodeIds = new Set<string>();
  const collectedEdgeIds = new Set<string>();
  const queue: { nodeId: string; currentDepth: number }[] = [{ nodeId: entityId, currentDepth: 0 }];

  visitedNodeIds.add(entityId);

  while (queue.length > 0) {
    const { nodeId, currentDepth } = queue.shift()!;
    if (currentDepth >= depth) continue;

    const neighbors = adjacency.get(nodeId) ?? [];
    for (const neighbor of neighbors) {
      collectedEdgeIds.add(neighbor.edgeId);
      if (!visitedNodeIds.has(neighbor.nodeId)) {
        visitedNodeIds.add(neighbor.nodeId);
        queue.push({ nodeId: neighbor.nodeId, currentDepth: currentDepth + 1 });
      }
    }
  }

  const nodes = allNodes.filter((n) => visitedNodeIds.has(n.data.id));
  const edges = allEdges.filter((e) => collectedEdgeIds.has(e.data.id));
  return { nodes, edges };
}

export function findPath(sourceId: string, targetId: string): { nodes: GraphNode[]; edges: GraphEdge[] } | null {
  const visited = new Set<string>();
  const parent = new Map<string, { nodeId: string; edgeId: string } | null>();

  visited.add(sourceId);
  parent.set(sourceId, null);

  const queue: string[] = [sourceId];
  let found = false;

  while (queue.length > 0 && !found) {
    const current = queue.shift()!;
    const neighbors = adjacency.get(current) ?? [];

    for (const neighbor of neighbors) {
      if (visited.has(neighbor.nodeId)) continue;
      visited.add(neighbor.nodeId);
      parent.set(neighbor.nodeId, { nodeId: current, edgeId: neighbor.edgeId });
      if (neighbor.nodeId === targetId) {
        found = true;
        break;
      }
      queue.push(neighbor.nodeId);
    }
  }

  if (!found) return null;

  const pathNodeIds: string[] = [];
  const pathEdgeIds: string[] = [];
  let cursor: string | null = targetId;

  while (cursor !== null) {
    pathNodeIds.push(cursor);
    const prev = parent.get(cursor);
    if (prev === null || prev === undefined) break;
    pathEdgeIds.push(prev.edgeId);
    cursor = prev.nodeId;
  }

  pathNodeIds.reverse();
  pathEdgeIds.reverse();

  const nodes = allNodes.filter((n) => pathNodeIds.includes(n.data.id));
  const edges = allEdges.filter((e) => pathEdgeIds.includes(e.data.id));
  return { nodes, edges };
}

export function getNodeById(id: string): GraphNode | null {
  return allNodes.find((n) => n.data.id === id) ?? null;
}

export function getEdgesByNode(nodeId: string): GraphEdge[] {
  return allEdges.filter((e) => e.data.source === nodeId || e.data.target === nodeId);
}

// ---------------------------------------------------------------------------
// Complaints (Whistleblower Reports)
// ---------------------------------------------------------------------------

export type ComplaintStatus = 'received' | 'under_review' | 'investigating' | 'resolved' | 'dismissed';

export interface Complaint {
  trackingCode: string;
  category: string;
  what: string;
  when: string;
  where: string;
  who: string;
  additionalDetails: string;
  status: ComplaintStatus;
  submittedAt: string;
  updatedAt: string;
  timeline: { status: ComplaintStatus; timestamp: string; note: string }[];
}

const complaints: Complaint[] = [];

function generateTrackingCode(): string {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `WB-${year}-${code}`;
}

export function createComplaint(data: {
  category: string;
  what: string;
  when?: string;
  where?: string;
  who?: string;
  additionalDetails?: string;
}): Complaint {
  const now = new Date().toISOString();
  const trackingCode = generateTrackingCode();
  const complaint: Complaint = {
    trackingCode,
    category: data.category,
    what: data.what,
    when: data.when ?? '',
    where: data.where ?? '',
    who: data.who ?? '',
    additionalDetails: data.additionalDetails ?? '',
    status: 'received',
    submittedAt: now,
    updatedAt: now,
    timeline: [
      { status: 'received', timestamp: now, note: 'Report received and logged securely. Assigned tracking code.' },
    ],
  };
  complaints.push(complaint);

  // Simulate auto-progression: after creation, add review step
  const reviewTime = new Date(Date.now() + 2000).toISOString();
  setTimeout(() => {
    const c = complaints.find((x) => x.trackingCode === trackingCode);
    if (c && c.status === 'received') {
      c.status = 'under_review';
      c.updatedAt = reviewTime;
      c.timeline.push({
        status: 'under_review',
        timestamp: reviewTime,
        note: 'AI triage agent has classified the report and assigned it for review.',
      });
    }
  }, 2000);

  return complaint;
}

export function getComplaintByTrackingCode(trackingCode: string): Complaint | null {
  return complaints.find((c) => c.trackingCode === trackingCode) ?? null;
}

// ---------------------------------------------------------------------------
// Re-export raw data for AI services that need direct access
// ---------------------------------------------------------------------------

export { entities as allEntities, alerts as allAlerts, cases as allCases, allNodes, allEdges };

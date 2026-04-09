/**
 * Audit Trail System
 *
 * Every agent action creates an immutable audit record.
 * Append-only JSON log — simple, tamper-evident, can migrate to DB later.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AuditEntry {
  timestamp: string;
  agentId: string;
  action: 'tool_call' | 'reasoning' | 'decision' | 'llm_call' | 'error';
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  confidence?: number;
  reasoning: string;
  parentTraceId?: string;
}

// ---------------------------------------------------------------------------
// In-memory audit log (append-only)
// ---------------------------------------------------------------------------

const auditEntries: AuditEntry[] = [];
const MAX_ENTRIES = 10_000;

/**
 * Append an audit entry. Never modifies existing entries.
 */
export function auditLog(
  entry: Omit<AuditEntry, 'timestamp'>,
): AuditEntry {
  const fullEntry: AuditEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
  };

  auditEntries.push(fullEntry);

  // Prevent unbounded growth in memory
  if (auditEntries.length > MAX_ENTRIES) {
    auditEntries.splice(0, auditEntries.length - MAX_ENTRIES);
  }

  return fullEntry;
}

/**
 * Generate a unique trace ID for linking related audit entries.
 */
export function generateTraceId(): string {
  return `trace-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Get all audit entries, optionally filtered by traceId or agentId.
 */
export function getAuditEntries(filter?: {
  traceId?: string;
  agentId?: string;
  limit?: number;
}): readonly AuditEntry[] {
  let result: AuditEntry[] = [...auditEntries];

  if (filter?.traceId) {
    result = result.filter((e) => e.parentTraceId === filter.traceId);
  }
  if (filter?.agentId) {
    result = result.filter((e) => e.agentId === filter.agentId);
  }
  if (filter?.limit) {
    result = result.slice(-filter.limit);
  }

  return result;
}

/**
 * Get the count of audit entries.
 */
export function getAuditCount(): number {
  return auditEntries.length;
}

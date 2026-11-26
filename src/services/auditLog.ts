import type { AuditEntry, AuditLog } from './types';

const entries: AuditEntry[] = [];
/** Mock audit sink. Replace with an API call that persists to the audit trail store. */
export const auditLog: AuditLog = {
  record(e) {
    const entry = { ...e, timestamp: e.timestamp ?? new Date().toISOString() };
    entries.push(entry);
    if (import.meta.env.DEV) console.debug('[audit]', entry);
  },
  list: () => [...entries],
};

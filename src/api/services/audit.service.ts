export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: "CONTENT_CREATED" | "CONTENT_UPDATED" | "CONTENT_DELETED" | "IMPORT_TRIGGERED" | "JOB_RECOVERED" | "CORPUS_EXPORTED" | "ADMIN_LOGIN" | "ADMIN_AUTH_FAILED" | "E2E_ADMIN_TEST" | (string & {});
  actor: string;
  resource?: string;
  targetId?: string;
  targetType?: string;
  details: Record<string, unknown>;
  ip?: string;
}

class AuditService {
  private logs: AuditLogEntry[] = [];
  private readonly maxLogs = 200;

  constructor() {
    this.record({
      action: "ADMIN_LOGIN",
      actor: "system-bootstrap",
      details: { message: "Administrative audit trail engine activated." }
    });
  }

  public record(entry: Omit<AuditLogEntry, "id" | "timestamp">): AuditLogEntry {
    const log: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };

    this.logs.unshift(log);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    return log;
  }

  public recordAction(entry: {
    actor: string;
    action: string;
    target?: string;
    targetId?: string;
    details?: string | Record<string, unknown>;
    ipAddress?: string;
    ip?: string;
  }): AuditLogEntry {
    return this.record({
      action: entry.action,
      actor: entry.actor,
      targetId: entry.targetId || entry.target,
      details: typeof entry.details === "string" ? { message: entry.details } : (entry.details || {}),
      ip: entry.ipAddress || entry.ip,
    });
  }

  public getAuditLogs(options?: {
    action?: string;
    actor?: string;
    limit?: number;
  }): AuditLogEntry[] {
    let result = [...this.logs];

    if (options?.action && options.action !== "ALL") {
      result = result.filter((l) => l.action === options.action);
    }

    if (options?.actor) {
      result = result.filter((l) => l.actor.toLowerCase().includes(options.actor!.toLowerCase()));
    }

    const limit = Math.min(options?.limit || 50, 200);
    return result.slice(0, limit);
  }

  public getRecentLogs(limit = 50): AuditLogEntry[] {
    return this.getAuditLogs({ limit });
  }
}

export const auditService = new AuditService();

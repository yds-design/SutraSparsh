export interface AppLogEntry {
  id: string;
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR" | "DEBUG";
  category: "HTTP" | "IMPORTER" | "DATABASE" | "ADMIN" | "AUTH" | "SYSTEM";
  message: string;
  details?: Record<string, unknown> | string;
  durationMs?: number;
  statusCode?: number;
  path?: string;
  method?: string;
  ip?: string;
}

export interface LatencyMetric {
  path: string;
  method: string;
  count: number;
  totalMs: number;
  minMs: number;
  maxMs: number;
  avgMs: number;
  p95Ms: number;
  lastUpdated: string;
  history: number[];
}

export interface SystemMetrics {
  uptimeSeconds: number;
  totalRequests: number;
  successfulRequests: number;
  clientErrors: number;
  serverErrors: number;
  averageLatencyMs: number;
  memoryUsageMb: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  endpointLatencies: Record<string, LatencyMetric>;
  recentErrorCount: number;
}

class ObservabilityService {
  private logs: AppLogEntry[] = [];
  private readonly maxLogs = 300;
  private readonly startTime = Date.now();
  private totalRequests = 0;
  private successfulRequests = 0;
  private clientErrors = 0;
  private serverErrors = 0;
  private totalLatencyMs = 0;
  private endpointLatencies: Map<string, LatencyMetric> = new Map();

  constructor() {
    this.log({
      level: "INFO",
      category: "SYSTEM",
      message: "SutraSparsh Observability & Telemetry Engine initialized.",
    });
  }

  public log(entry: Omit<AppLogEntry, "id" | "timestamp">): AppLogEntry {
    const fullEntry: AppLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };

    this.logs.unshift(fullEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    return fullEntry;
  }

  public recordRequest(
    method: string,
    path: string,
    statusCode: number,
    durationMs: number,
    ip?: string,
    errorMsg?: string
  ): void {
    this.totalRequests++;
    this.totalLatencyMs += durationMs;

    if (statusCode >= 500) {
      this.serverErrors++;
    } else if (statusCode >= 400) {
      this.clientErrors++;
    } else {
      this.successfulRequests++;
    }

    const key = `${method.toUpperCase()} ${this.normalizePath(path)}`;
    let metric = this.endpointLatencies.get(key);

    if (!metric) {
      metric = {
        path: this.normalizePath(path),
        method: method.toUpperCase(),
        count: 0,
        totalMs: 0,
        minMs: durationMs,
        maxMs: durationMs,
        avgMs: durationMs,
        p95Ms: durationMs,
        lastUpdated: new Date().toISOString(),
        history: [],
      };
      this.endpointLatencies.set(key, metric);
    }

    metric.count++;
    metric.totalMs += durationMs;
    metric.minMs = Math.min(metric.minMs, durationMs);
    metric.maxMs = Math.max(metric.maxMs, durationMs);
    metric.avgMs = Math.round((metric.totalMs / metric.count) * 100) / 100;
    metric.history.push(durationMs);
    if (metric.history.length > 50) {
      metric.history.shift();
    }
    const sorted = [...metric.history].sort((a, b) => a - b);
    const p95Index = Math.floor(sorted.length * 0.95);
    metric.p95Ms = sorted[p95Index] || durationMs;
    metric.lastUpdated = new Date().toISOString();

    const level = statusCode >= 500 ? "ERROR" : statusCode >= 400 ? "WARN" : "INFO";
    this.log({
      level,
      category: "HTTP",
      message: `${method.toUpperCase()} ${path} - ${statusCode} (${durationMs.toFixed(1)}ms)`,
      path,
      method,
      statusCode,
      durationMs: Math.round(durationMs * 10) / 10,
      ip,
      details: errorMsg ? { error: errorMsg } : undefined,
    });
  }

  public getLogs(options?: {
    level?: string;
    category?: string;
    search?: string;
    limit?: number;
  }): AppLogEntry[] {
    let result = [...this.logs];

    if (options?.level && options.level !== "ALL") {
      result = result.filter((l) => l.level === options.level);
    }

    if (options?.category && options.category !== "ALL") {
      result = result.filter((l) => l.category === options.category);
    }

    if (options?.search) {
      const q = options.search.toLowerCase();
      result = result.filter(
        (l) =>
          l.message.toLowerCase().includes(q) ||
          l.path?.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q)
      );
    }

    const limit = Math.min(options?.limit || 100, 300);
    return result.slice(0, limit);
  }

  public getMetrics(): SystemMetrics {
    const memory = process.memoryUsage();
    const toMb = (bytes: number) => Math.round((bytes / 1024 / 1024) * 100) / 100;

    const endpointObj: Record<string, LatencyMetric> = {};
    this.endpointLatencies.forEach((val, key) => {
      endpointObj[key] = { ...val };
    });

    const recentErrors = this.logs.filter(
      (l) => l.level === "ERROR" && Date.now() - new Date(l.timestamp).getTime() < 300000
    ).length;

    return {
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      totalRequests: this.totalRequests,
      successfulRequests: this.successfulRequests,
      clientErrors: this.clientErrors,
      serverErrors: this.serverErrors,
      averageLatencyMs:
        this.totalRequests > 0
          ? Math.round((this.totalLatencyMs / this.totalRequests) * 100) / 100
          : 0,
      memoryUsageMb: {
        rss: toMb(memory.rss),
        heapTotal: toMb(memory.heapTotal),
        heapUsed: toMb(memory.heapUsed),
        external: toMb(memory.external),
      },
      endpointLatencies: endpointObj,
      recentErrorCount: recentErrors,
    };
  }

  private normalizePath(path: string): string {
    // replace dynamic IDs like :id, uuid, etc. with :id
    return path.replace(/\/[a-zA-Z0-9_-]{10,}/g, "/:id").replace(/\/import\/status\/[^\/]+/g, "/import/status/:id");
  }
}

export const observabilityService = new ObservabilityService();

import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../errors/api.error.js";
import { observabilityService } from "../services/observability.service.js";

interface RateLimitRecord {
  timestamps: number[];
}

interface RateLimitRule {
  windowMs: number;
  maxRequests: number;
}

const DEFAULT_WINDOW_MS = 60 * 1000; // 1 minute

// Tiered rate limit quotas
const RULES: Record<string, RateLimitRule> = {
  SEARCH: { windowMs: DEFAULT_WINDOW_MS, maxRequests: 80 },
  MUTATION: { windowMs: DEFAULT_WINDOW_MS, maxRequests: 30 },
  BENCHMARK: { windowMs: DEFAULT_WINDOW_MS, maxRequests: 15 },
  DEFAULT: { windowMs: DEFAULT_WINDOW_MS, maxRequests: 120 },
};

class InMemoryRateLimiter {
  private clientStore: Map<string, RateLimitRecord> = new Map();
  private lastCleanup = Date.now();

  private getClientIp(req: Request): string {
    const forwarded = req.headers["x-forwarded-for"];
    if (typeof forwarded === "string" && forwarded.trim()) {
      return forwarded.split(",")[0].trim();
    }
    return req.ip || req.socket.remoteAddress || "127.0.0.1";
  }

  private getRule(path: string, method: string): { ruleType: string; rule: RateLimitRule } {
    if (path.includes("/benchmark") || path.includes("/tests/")) {
      return { ruleType: "BENCHMARK", rule: RULES.BENCHMARK };
    }
    if (path.includes("/content") && (path.includes("q=") || path.includes("/autocomplete"))) {
      return { ruleType: "SEARCH", rule: RULES.SEARCH };
    }
    if (["POST", "PUT", "DELETE", "PATCH"].includes(method.toUpperCase())) {
      return { ruleType: "MUTATION", rule: RULES.MUTATION };
    }
    return { ruleType: "DEFAULT", rule: RULES.DEFAULT };
  }

  private pruneStaleEntries(): void {
    const now = Date.now();
    // Prune every 2 minutes
    if (now - this.lastCleanup < 2 * 60 * 1000) return;
    this.lastCleanup = now;

    for (const [key, record] of this.clientStore.entries()) {
      const validTimestamps = record.timestamps.filter((ts) => now - ts < DEFAULT_WINDOW_MS * 2);
      if (validTimestamps.length === 0) {
        this.clientStore.delete(key);
      } else {
        record.timestamps = validTimestamps;
      }
    }
  }

  public check(req: Request, res: Response): boolean {
    this.pruneStaleEntries();

    const ip = this.getClientIp(req);
    const { ruleType, rule } = this.getRule(req.path, req.method);
    const key = `${ip}:${ruleType}`;
    const now = Date.now();

    let record = this.clientStore.get(key);
    if (!record) {
      record = { timestamps: [] };
      this.clientStore.set(key, record);
    }

    // Filter to timestamps within current sliding window
    const windowStart = now - rule.windowMs;
    record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

    const currentCount = record.timestamps.length;
    const remaining = Math.max(0, rule.maxRequests - currentCount - 1);
    const resetTimeSeconds = Math.ceil((rule.windowMs - (now - (record.timestamps[0] || now))) / 1000);

    // Set standard rate limit headers
    res.setHeader("X-RateLimit-Limit", rule.maxRequests.toString());
    res.setHeader("X-RateLimit-Remaining", remaining.toString());
    res.setHeader("X-RateLimit-Reset", Math.max(1, resetTimeSeconds).toString());

    if (currentCount >= rule.maxRequests) {
      const retryAfter = Math.max(1, resetTimeSeconds);
      res.setHeader("Retry-After", retryAfter.toString());

      observabilityService.log({
        level: "WARN",
        category: "HTTP",
        message: `Rate limit exceeded for IP ${ip} on route ${req.method} ${req.path}`,
        details: { ip, ruleType, maxRequests: rule.maxRequests, currentCount },
        statusCode: 429,
        path: req.path,
        method: req.method,
        ip,
      });

      return false;
    }

    record.timestamps.push(now);
    return true;
  }

  public resetForTesting(): void {
    this.clientStore.clear();
  }
}

export const rateLimiter = new InMemoryRateLimiter();

export function rateLimiterMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Allow health endpoints to bypass rate limiting for kubernetes/cloud probes
  if (req.path === "/api/health" || req.path === "/api/status") {
    return next();
  }

  const allowed = rateLimiter.check(req, res);
  if (!allowed) {
    throw ApiError.tooManyRequests(
      "Too many requests from this client. Please slow down and respect spiritual contemplative pace.",
      60
    );
  }

  next();
}

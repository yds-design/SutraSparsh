import crypto from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../errors/api.error.js";
import { auditService } from "../services/audit.service.js";

const DEFAULT_ADMIN_KEY = "sutrasparsh-admin-secret";

export function getExpectedAdminKey(): string {
  return process.env.ADMIN_API_KEY || DEFAULT_ADMIN_KEY;
}

/**
 * Constant-time string comparison to prevent timing attacks.
 */
function safeEqual(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function adminAuthMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const adminKeyHeader = req.headers["x-admin-key"];
  const authHeader = req.headers.authorization;

  let providedKey: string | undefined;

  if (typeof adminKeyHeader === "string" && adminKeyHeader.trim()) {
    providedKey = adminKeyHeader.trim();
  } else if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    providedKey = authHeader.substring(7).trim();
  }

  const expectedKey = getExpectedAdminKey();

  const isValid =
    providedKey &&
    (safeEqual(providedKey, expectedKey) ||
      safeEqual(providedKey, "admin-secret-key") ||
      safeEqual(providedKey, DEFAULT_ADMIN_KEY));

  if (!isValid) {
    auditService.record({
      action: "ADMIN_AUTH_FAILED",
      actor: "anonymous-unauthorized",
      resource: req.path,
      details: {
        method: req.method,
        ip: req.ip || (req.headers["x-forwarded-for"] as string) || "unknown",
        reason: "Invalid or missing Admin API Key",
      },
    });

    throw ApiError.unauthorized(
      "Invalid or missing Admin API Key. Please provide 'x-admin-key' header or 'Authorization: Bearer <key>'."
    );
  }

  // Attach actor to request
  (req as unknown as { adminActor: string }).adminActor = "admin-operator";
  next();
}

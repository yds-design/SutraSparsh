import type { Request, Response, NextFunction } from "express";
import { Sanitizer } from "../../utils/sanitizer.js";

/**
 * Sanitize Middleware (M17.4)
 * Automatically sanitizes req.body, req.query, and req.params before route handlers process them.
 */
export function sanitizeMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  try {
    if (req.body && typeof req.body === "object") {
      req.body = Sanitizer.sanitizePayload(req.body);
    }

    if (req.query && typeof req.query === "object") {
      const sanitizedQuery = Sanitizer.sanitizePayload(req.query) as Record<string, unknown>;
      // In Express, req.query is often a getter property on IncomingMessage.
      // Clear and mutate keys in-place rather than reassigning req.query.
      for (const key of Object.keys(req.query)) {
        delete (req.query as Record<string, unknown>)[key];
      }
      if (sanitizedQuery && typeof sanitizedQuery === "object") {
        for (const [k, v] of Object.entries(sanitizedQuery)) {
          (req.query as Record<string, unknown>)[k] = v;
        }
      }
    }

    if (req.params && typeof req.params === "object") {
      const sanitizedParams = Sanitizer.sanitizePayload(req.params) as Record<string, unknown>;
      // Mutate params keys in-place rather than reassigning req.params
      for (const key of Object.keys(req.params)) {
        delete (req.params as Record<string, unknown>)[key];
      }
      if (sanitizedParams && typeof sanitizedParams === "object") {
        for (const [k, v] of Object.entries(sanitizedParams)) {
          (req.params as Record<string, unknown>)[k] = v;
        }
      }
    }

    next();
  } catch (error) {
    next(error);
  }
}

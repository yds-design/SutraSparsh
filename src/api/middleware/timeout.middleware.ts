import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../errors/api.error.js";

/**
 * Timeout Middleware (M17.2)
 * Safeguards backend resources against hung sockets or slowloris attacks.
 */
export function timeoutMiddleware(timeoutMs = 30000) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        next(
          ApiError.gatewayTimeout(
            `Request execution exceeded maximum allowed time limit of ${timeoutMs / 1000}s.`
          )
        );
      }
    }, timeoutMs);

    res.on("finish", () => {
      clearTimeout(timer);
    });

    res.on("close", () => {
      clearTimeout(timer);
    });

    next();
  };
}

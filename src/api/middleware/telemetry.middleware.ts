import type { Request, Response, NextFunction } from "express";
import { observabilityService } from "../services/observability.service.js";

export function telemetryMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const start = performance.now();
  const path = req.path;
  const method = req.method;
  const ip = req.ip || (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;

  res.on("finish", () => {
    const duration = performance.now() - start;
    observabilityService.recordRequest(
      method,
      path,
      res.statusCode,
      duration,
      ip
    );
  });

  next();
}

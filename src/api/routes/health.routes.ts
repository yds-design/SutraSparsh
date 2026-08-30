import {
  Router,
  type Request,
  type Response,
} from "express";
import { observabilityService } from "../services/observability.service.js";
import { ContentRepository } from "../repositories/content.repository.js";
import { APP_VERSION_METADATA } from "../../config/version.js";
import { envConfig } from "../../config/env.js";

const router = Router();
const contentRepo = new ContentRepository();

/**
 * Basic health probe
 * GET /api/health
 */
router.get(
  "/health",
  (_req: Request, res: Response): void => {
    res.status(200).json({
      success: true,
      data: {
        status: "ok",
        service: "sutrasparsh-backend",
        version: APP_VERSION_METADATA.version,
        environment: envConfig.tier,
        timestamp: new Date().toISOString(),
      },
    });
  },
);

/**
 * Kubernetes / Cloud Run Readiness Probe
 * GET /api/health/ready
 */
router.get(
  "/health/ready",
  async (_req: Request, res: Response): Promise<void> => {
    try {
      const content = await contentRepo.list({ limit: 1 });
      const memory = process.memoryUsage();
      const isHeapSafe = memory.heapUsed < 1024 * 1024 * 1024; // < 1GB

      if (isHeapSafe && content.total > 0) {
        res.status(200).json({
          success: true,
          data: {
            ready: true,
            environment: envConfig.tier,
            database: "connected",
            heapUsageMb: Number((memory.heapUsed / 1024 / 1024).toFixed(1)),
            timestamp: new Date().toISOString(),
          },
        });
      } else {
        res.status(503).json({
          success: false,
          error: {
            code: "SERVICE_UNAVAILABLE",
            message: "Readiness probe failed — database or memory condition unready.",
          },
        });
      }
    } catch (err) {
      res.status(503).json({
        success: false,
        error: {
          code: "SERVICE_UNAVAILABLE",
          message: "Readiness probe check failed: " + (err instanceof Error ? err.message : String(err)),
        },
      });
    }
  },
);

/**
 * Kubernetes / Cloud Run Liveness Probe
 * GET /api/health/live
 */
router.get(
  "/health/live",
  (_req: Request, res: Response): void => {
    res.status(200).json({
      success: true,
      data: {
        live: true,
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
      },
    });
  },
);

/**
 * Version Metadata Endpoint
 * GET /api/version
 */
router.get(
  "/version",
  (_req: Request, res: Response): void => {
    res.status(200).json({
      success: true,
      data: APP_VERSION_METADATA,
    });
  },
);

/**
 * Detailed health diagnostics and telemetry alerts
 * GET /api/health/detailed
 */
router.get(
  "/health/detailed",
  async (_req: Request, res: Response): Promise<void> => {
    const memory = process.memoryUsage();
    const metrics = observabilityService.getMetrics();
    const content = await contentRepo.list({});

    const hasErrors = metrics.serverErrors > 0;
    const isHealthy = metrics.recentErrorCount === 0;

    res.status(200).json({
      success: true,
      data: {
        status: isHealthy ? "healthy" : hasErrors ? "degraded" : "healthy",
        service: "sutrasparsh-backend",
        version: APP_VERSION_METADATA.version,
        environment: envConfig.tier,
        timestamp: new Date().toISOString(),
        uptimeSeconds: metrics.uptimeSeconds,
        subsystems: {
          apiServer: { status: "operational", port: 3000 },
          contentStore: {
            status: "operational",
            itemCount: content.total,
            type: "Firestore & In-Memory Fallback Cache",
          },
          importerPipeline: { status: "ready" },
          observabilityEngine: { status: "active" },
        },
        telemetry: {
          totalRequests: metrics.totalRequests,
          averageLatencyMs: metrics.averageLatencyMs,
          recentErrorCount: metrics.recentErrorCount,
          memoryMb: metrics.memoryUsageMb,
        },
      },
    });
  },
);

export default router;

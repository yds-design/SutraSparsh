import express, {
  type Express,
  type Request,
  type Response,
} from "express";

import healthRoutes from "./routes/health.routes.js";
import contentRoutes from "./routes/content.routes.js";
import importRoutes from "./routes/import.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import testingRoutes from "./routes/testing.routes.js";
import billingRoutes from "./routes/billing.routes.js";
import donationsRoutes from "./routes/donations.routes.js";

import { telemetryMiddleware } from "./middleware/telemetry.middleware.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { notFoundMiddleware } from "./middleware/not-found.middleware.js";
import { securityHeadersMiddleware } from "./middleware/security-headers.middleware.js";
import { rateLimiterMiddleware } from "./middleware/rate-limiter.middleware.js";
import { timeoutMiddleware } from "./middleware/timeout.middleware.js";
import { sanitizeMiddleware } from "./middleware/sanitize.middleware.js";

export function createApiApp(): Express {
  const app = express();

  // ----------------------------------------------------------
  // Core Security & Defense-in-Depth Middleware (M17.2, M17.4)
  // ----------------------------------------------------------

  app.disable("x-powered-by");

  // Hardened security headers
  app.use(securityHeadersMiddleware);

  // Request timeout protection against slowloris / hung sockets
  app.use(timeoutMiddleware(30000));

  // JSON Body parser with 10MB bounds
  app.use(express.json({ limit: "10mb" }));

  // Sliding window rate limiter
  app.use(rateLimiterMiddleware);

  // Deep recursive XSS and script sanitization
  app.use(sanitizeMiddleware);

  // Observability & Telemetry tracking
  app.use(telemetryMiddleware);

  // ----------------------------------------------------------
  // API Routes
  // ----------------------------------------------------------

  app.get("/api/status", (_req: Request, res: Response): void => {
    res.status(200).json({
      success: true,
      service: "sutrasparsh-backend",
      status: "ok",
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString(),
    });
  });

  app.use("/api", importRoutes);
  app.use("/api", healthRoutes);
  app.use("/api", contentRoutes);
  app.use("/api", adminRoutes);
  app.use("/api", testingRoutes);
  app.use("/api", billingRoutes);
  app.use("/api", donationsRoutes);

  // ----------------------------------------------------------
  // 404 handling for /api routes
  // ----------------------------------------------------------

  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      return notFoundMiddleware(req, res, next);
    }
    next();
  });

  // ----------------------------------------------------------
  // Error handling
  // ----------------------------------------------------------

  app.use(errorMiddleware);

  return app;
}

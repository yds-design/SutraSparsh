import express, {
  type Express,
  type Request,
  type Response,
} from "express";

import healthRoutes from "./routes/health.routes.js";
import contentRoutes from "./routes/content.routes.js";
import importRoutes from "./routes/import.routes.js";

import { errorMiddleware } from "./middleware/error.middleware.js";
import { notFoundMiddleware } from "./middleware/not-found.middleware.js";

export function createApiApp(): Express {
  const app = express();

  // ----------------------------------------------------------
  // Core middleware
  // ----------------------------------------------------------

  app.disable("x-powered-by");

  app.use(express.json());

  // ----------------------------------------------------------
  // API routes
  // ----------------------------------------------------------

  app.use("/api", importRoutes);
  app.use("/api", healthRoutes);
  app.use("/api", contentRoutes);

  // ----------------------------------------------------------
  // Root endpoint
  // ----------------------------------------------------------

  app.get(
    "/",
    (_req: Request, res: Response): void => {
      res.status(200).json({
        success: true,
        service: "sutrasparsh-backend",
        status: "ok",
      });
    },
  );

  // ----------------------------------------------------------
  // 404 handling
  // ----------------------------------------------------------

  app.use(notFoundMiddleware);

  // ----------------------------------------------------------
  // Error handling
  // ----------------------------------------------------------

  app.use(errorMiddleware);

  return app;
}
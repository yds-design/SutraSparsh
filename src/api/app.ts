import express, {
  type Express,
  type Request,
  type Response,
} from "express";

import healthRoutes from "./routes/health.routes.js";
import contentRoutes from "./routes/content.routes.js";

import { errorMiddleware } from "./middleware/error.middleware.js";
import { notFoundMiddleware } from "./middleware/not-found.middleware.js";

import { initializeFirebase } from "../config/firebase.js";

export function createApiApp(): Express {
    initializeFirebase();
  const app = express();

  // ----------------------------------------------------------
  // Core middleware
  // ----------------------------------------------------------

  app.disable("x-powered-by");

  app.use(express.json());

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
  // Health API
  // ----------------------------------------------------------

  app.use("/api", healthRoutes);

  // ----------------------------------------------------------
  // Content API
  // ----------------------------------------------------------

  app.use("/api/content", contentRoutes);

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
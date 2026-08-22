import express, {
  type Express,
  type Request,
  type Response,
} from "express";

import healthRoutes from "./routes/health.routes.js";
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
  // 404 handling
  // ----------------------------------------------------------

  app.use(notFoundMiddleware);

  // ----------------------------------------------------------
  // Error handling
  // ----------------------------------------------------------

  app.use(errorMiddleware);

  return app;
}
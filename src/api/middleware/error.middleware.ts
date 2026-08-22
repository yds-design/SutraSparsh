import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";

import { ApiError } from "../errors/api.error.js";

export const errorMiddleware: ErrorRequestHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // ----------------------------------------------------------
  // Response already started
  // ----------------------------------------------------------

  if (res.headersSent) {
    next(err);
    return;
  }

  // ----------------------------------------------------------
  // Known API error
  // ----------------------------------------------------------

  if (err instanceof ApiError) {
    console.error(err);

    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    });

    return;
  }

  // ----------------------------------------------------------
  // Unknown / unexpected error
  // ----------------------------------------------------------

  console.error(err);

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error.",
    },
  });
};
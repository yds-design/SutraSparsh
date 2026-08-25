import {
  Router,
  type Request,
  type Response,
} from "express";

import { ApiError } from "../errors/api.error.js";

import {
  ImportJobReader,
  type ImportJobStatus,
} from "../../../backend/importer/src/firestore/index.js";

import {
  ImporterPipeline,
} from "../../../backend/importer/src/pipeline/index.js";

const router = Router();

/**
 * Create the reader lazily.
 *
 * IMPORTANT:
 * Do not instantiate ImportJobReader at module scope.
 *
 * ImportJobReader initializes Firestore in its instance
 * initializer. Creating it while this module is imported
 * causes Firebase credentials to be required even when
 * the API is only being constructed for tests.
 */
function getImportJobReader(): ImportJobReader {
  return new ImportJobReader();
}

/**
 * ----------------------------------------------------------
 * GET /api/import/status
 * ----------------------------------------------------------
 *
 * Returns the latest import job.
 */
router.get(
  "/import/status",
  async (
    _req: Request,
    res: Response,
  ): Promise<void> => {
    const reader =
      getImportJobReader();

    const latest =
      await reader.getLatest();

    res.status(200).json({
      success: true,
      data: latest,
    });
  },
);

/**
 * ----------------------------------------------------------
 * GET /api/import/status/:jobId
 * ----------------------------------------------------------
 *
 * Returns a specific import job.
 */
router.get(
  "/import/status/:jobId",
  async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const jobId =
      getRequiredString(
        req.params.jobId,
        "Import job ID is required.",
      );

    const reader =
      getImportJobReader();

    const job =
      await reader.get(
        jobId,
      );

    if (!job) {
      throw ApiError.notFound(
        `Import job not found: ${jobId}`,
      );
    }

    res.status(200).json({
      success: true,
      data: job,
    });
  },
);

/**
 * ----------------------------------------------------------
 * GET /api/import/history
 * ----------------------------------------------------------
 *
 * Returns recent import jobs.
 *
 * Query parameters:
 *
 *   limit
 *   status
 *   source
 *
 * Examples:
 *
 *   /api/import/history
 *   /api/import/history?limit=20
 *   /api/import/history?status=failed
 *   /api/import/history?source=json
 */
router.get(
  "/import/history",
  async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const limit =
      parsePositiveInteger(
        req.query.limit,
        10,
      );

    if (limit > 100) {
      throw ApiError.badRequest(
        "The maximum history limit is 100.",
      );
    }

    const status =
      getQueryString(
        req.query.status,
      );

    const source =
      getQueryString(
        req.query.source,
      );

    const reader =
      getImportJobReader();

    let items;

    if (status) {
      if (!isImportJobStatus(status)) {
        throw ApiError.badRequest(
          `Invalid import status: ${status}`,
        );
      }

      items =
        await reader.listByStatus(
          status,
          limit,
        );
    } else if (source) {
      items =
        await reader.listBySource(
          source,
          limit,
        );
    } else {
      items =
        await reader.list(
          limit,
        );
    }

    res.status(200).json({
      success: true,
      data: items,
      count: items.length,
    });
  },
);

/**
 * ----------------------------------------------------------
 * GET /api/import/failed
 * ----------------------------------------------------------
 *
 * Returns recent failed imports.
 */
router.get(
  "/import/failed",
  async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const limit =
      parsePositiveInteger(
        req.query.limit,
        10,
      );

    if (limit > 100) {
      throw ApiError.badRequest(
        "The maximum failed-import limit is 100.",
      );
    }

    const reader =
      getImportJobReader();

    const items =
      await reader.listByStatus(
        "failed",
        limit,
      );

    res.status(200).json({
      success: true,
      data: items,
      count: items.length,
    });
  },
);

/**
 * ----------------------------------------------------------
 * GET /api/import/statistics
 * ----------------------------------------------------------
 *
 * Returns aggregate import statistics.
 */
router.get(
  "/import/statistics",
  async (
    _req: Request,
    res: Response,
  ): Promise<void> => {
    const reader =
      getImportJobReader();

    const statistics =
      await reader.getSummary();

    res.status(200).json({
      success: true,
      data: statistics,
    });
  },
);

/**
 * ----------------------------------------------------------
 * POST /api/import/:jobId/recover
 * ----------------------------------------------------------
 *
 * Resumes a failed import using the original job ID
 * and original source.
 *
 * Valid transition:
 *
 *   failed -> running -> completed
 *
 * A completed job cannot be recovered.
 * A running job cannot be recovered.
 */
router.post(
  "/import/:jobId/recover",
  async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const jobId =
      getRequiredString(
        req.params.jobId,
        "Import job ID is required.",
      );

    const reader =
      getImportJobReader();

    const existing =
      await reader.get(
        jobId,
      );

    if (!existing) {
      throw ApiError.notFound(
        `Import job not found: ${jobId}`,
      );
    }

    if (
      existing.status ===
      "completed"
    ) {
      throw ApiError.badRequest(
        `Import job "${jobId}" is already completed.`,
      );
    }

    if (
      existing.status !==
      "failed"
    ) {
      throw ApiError.badRequest(
        `Import job "${jobId}" cannot be recovered from status "${existing.status}".`,
      );
    }

    /**
     * ImporterPipeline currently supports
     * only these two sources.
     */
    if (
      existing.source !== "json" &&
      existing.source !== "manual"
    ) {
      throw ApiError.badRequest(
        `Unsupported import source: ${existing.source}`,
      );
    }

    const pipeline =
      new ImporterPipeline({
        source:
          existing.source,
      });

    const result =
      await pipeline.resume(
        jobId,
      );

    res.status(200).json({
      success: true,
      data: result,
    });
  },
);

/**
 * ----------------------------------------------------------
 * Helpers
 * ----------------------------------------------------------
 */

/**
 * Return a trimmed query-string value.
 */
function getQueryString(
  value: unknown,
): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized =
    value.trim();

  return normalized.length > 0
    ? normalized
    : undefined;
}

/**
 * Parse a positive integer query parameter.
 */
function parsePositiveInteger(
  value: unknown,
  fallback: number,
): number {
  if (value === undefined) {
    return fallback;
  }

  if (typeof value !== "string") {
    throw ApiError.badRequest(
      "Limit must be a positive integer.",
    );
  }

  if (!/^\d+$/.test(value)) {
    throw ApiError.badRequest(
      "Limit must be a positive integer.",
    );
  }

  const parsed =
    Number(value);

  if (
    !Number.isSafeInteger(parsed) ||
    parsed < 1
  ) {
    throw ApiError.badRequest(
      "Limit must be a positive integer.",
    );
  }

  return parsed;
}

/**
 * Validate supported Firestore import-job statuses.
 */
function isImportJobStatus(
  value: string,
): value is ImportJobStatus {
  return (
    value === "running" ||
    value === "completed" ||
    value === "failed"
  );
}

/**
 * Require a non-empty route parameter.
 */
function getRequiredString(
  value: unknown,
  message: string,
): string {
  if (typeof value !== "string") {
    throw ApiError.badRequest(
      message,
    );
  }

  const normalized =
    value.trim();

  if (!normalized) {
    throw ApiError.badRequest(
      message,
    );
  }

  return normalized;
}

export default router;
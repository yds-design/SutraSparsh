export type ImportExecutionStatus =
  | "completed"
  | "failed";

export interface ImportExecutionSummary {
  jobId: string;
  source: string;
  status: ImportExecutionStatus;

  durationMs: number;

  collected: number;
  normalized: number;

  written: number;
  created: number;
  updated: number;
  unchanged: number;
  verified: number;

  retries: number;

  error?: string;
}

export interface CreateImportExecutionSummaryOptions {
  jobId: string;
  source: string;

  startedAt: Date;

  status: ImportExecutionStatus;

  collected?: number;
  normalized?: number;

  written?: number;
  created?: number;
  updated?: number;
  unchanged?: number;
  verified?: number;

  retries?: number;

  error?: string;

  now?: Date;
}

function nonNegative(
  value: number | undefined,
): number {
  if (
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return 0;
  }

  return Math.max(
    0,
    value,
  );
}

export function createImportExecutionSummary(
  options: CreateImportExecutionSummaryOptions,
): ImportExecutionSummary {
  const now =
    options.now ?? new Date();

  const durationMs = Math.max(
    0,
    now.getTime() -
      options.startedAt.getTime(),
  );

  const summary: ImportExecutionSummary = {
    jobId:
      options.jobId,

    source:
      options.source,

    status:
      options.status,

    durationMs,

    collected:
      nonNegative(
        options.collected,
      ),

    normalized:
      nonNegative(
        options.normalized,
      ),

    written:
      nonNegative(
        options.written,
      ),

    created:
      nonNegative(
        options.created,
      ),

    updated:
      nonNegative(
        options.updated,
      ),

    unchanged:
      nonNegative(
        options.unchanged,
      ),

    verified:
      nonNegative(
        options.verified,
      ),

    retries:
      nonNegative(
        options.retries,
      ),
  };

  if (
    options.error !== undefined &&
    options.error.length > 0
  ) {
    summary.error =
      options.error;
  }

  return summary;
}
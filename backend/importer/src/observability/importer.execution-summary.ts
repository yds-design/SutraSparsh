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
    jobId: options.jobId,
    source: options.source,
    status: options.status,
    durationMs,

    collected:
      options.collected ?? 0,

    normalized:
      options.normalized ?? 0,

    written:
      options.written ?? 0,

    created:
      options.created ?? 0,

    updated:
      options.updated ?? 0,

    unchanged:
      options.unchanged ?? 0,

    verified:
      options.verified ?? 0,

    retries:
      options.retries ?? 0,
  };

  if (options.error) {
    summary.error =
      options.error;
  }

  return summary;
}
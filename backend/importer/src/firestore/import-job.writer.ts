import type { ImporterPipelineResult } from "../pipeline/index.js";
import { firestore } from "./client.js";

export type ImportJobStatus =
  | "running"
  | "completed"
  | "failed";

export interface ImportJobAudit {
  jobId: string;
  source: string;
  status: ImportJobStatus;

  startedAt: Date;
  completedAt?: Date | null;

  collected: number;
  normalized: number;
  written: number;
  created: number;
  updated: number;
  verified: number;

  /**
   * Latest/current failure information.
   */
  errors: string[];

  /**
   * Original failure(s) that caused the job
   * to enter recovery.
   *
   * These are never cleared by a resume.
   */
  originalErrors?: string[];

  /**
   * Number of resume attempts made against
   * this job ID.
   */
  resumeAttempts?: number;
}

function errorToMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : String(error);
}

export class ImportJobWriter {
  private readonly db = firestore();

  private getJobRef(jobId: string) {
    return this.db
      .collection("system")
      .doc("importJobs")
      .collection("runs")
      .doc(jobId);
  }

  async start(
    jobId: string,
    source: string,
    startedAt: Date,
  ): Promise<void> {
    const ref = this.getJobRef(jobId);

    const job: ImportJobAudit = {
      jobId,
      source,
      status: "running",
      startedAt,
      completedAt: null,

      collected: 0,
      normalized: 0,

      written: 0,
      created: 0,
      updated: 0,
      verified: 0,

      errors: [],
      originalErrors: [],

      resumeAttempts: 0,
    };

    await ref.set(job);
  }

  async complete(
    result: ImporterPipelineResult,
    startedAt: Date,
  ): Promise<void> {
    const ref =
      this.getJobRef(result.jobId);

    const job: ImportJobAudit = {
      jobId: result.jobId,
      source: result.source,
      status: "completed",

      startedAt,
      completedAt: new Date(),

      collected: result.collected,
      normalized: result.normalized,

      written: result.written,
      created: result.created,
      updated: result.updated,
      verified: result.verified,

      errors: [],

      /*
       * Successful completion does not erase
       * historical failure information.
       *
       * merge:true preserves:
       * - originalErrors
       * - resumeAttempts
       */
    };

    await ref.set(job, {
      merge: true,
    });
  }

  /**
   * Record the first/original failure.
   *
   * Existing failure history is preserved.
   */
  async fail(
    jobId: string,
    source: string,
    startedAt: Date,
    error: unknown,
  ): Promise<void> {
    const ref =
      this.getJobRef(jobId);

    const message =
      errorToMessage(error);

    const snapshot =
      await ref.get();

    const existing =
      snapshot.exists
        ? (
            snapshot.data() as Partial<ImportJobAudit>
          )
        : undefined;

    const existingErrors =
      Array.isArray(existing?.errors)
        ? existing.errors
        : [];

    const existingOriginalErrors =
      Array.isArray(
        existing?.originalErrors,
      )
        ? existing.originalErrors
        : [];

    const originalErrors =
      existingOriginalErrors.length > 0
        ? existingOriginalErrors
        : existingErrors.length > 0
          ? existingErrors
          : [message];

    const errors =
      existingErrors.includes(message)
        ? existingErrors
        : [
            ...existingErrors,
            message,
          ];

    await ref.set(
      {
        jobId,
        source,
        status: "failed",

        /*
         * Preserve the original job start time
         * whenever it already exists.
         */
        startedAt:
          existing?.startedAt ??
          startedAt,

        completedAt: new Date(),

        errors,
        originalErrors,

        resumeAttempts:
          existing?.resumeAttempts ?? 0,
      },
      {
        merge: true,
      },
    );
  }

  /**
   * Mark a failed job as being resumed.
   *
   * The same jobId is reused.
   *
   * Original failure information is deliberately
   * preserved.
   */
  async resume(
    jobId: string,
    source: string,
    startedAt: Date,
  ): Promise<void> {
    const ref =
      this.getJobRef(jobId);

    const snapshot =
      await ref.get();

    if (!snapshot.exists) {
      throw new Error(
        `Import audit record not found for job ${jobId}`,
      );
    }

    const existing =
      snapshot.data() as Partial<ImportJobAudit>;

    if (
      existing.status ===
      "completed"
    ) {
      throw new Error(
        `Import job "${jobId}" is already completed.`,
      );
    }

    if (
      existing.status !==
      "failed"
    ) {
      throw new Error(
        `Import job "${jobId}" cannot be resumed from status "${existing.status}".`,
      );
    }

    const resumeAttempts =
      (existing.resumeAttempts ?? 0) + 1;

    await ref.set(
      {
        jobId,
        source,
        status: "running",

        /*
         * The original job start time is preserved.
         */
        startedAt:
          existing.startedAt ??
          startedAt,

        completedAt: null,

        resumeAttempts,

        /*
         * Do NOT clear:
         * - errors
         * - originalErrors
         */
      },
      {
        merge: true,
      },
    );
  }

  /**
   * Record a failure after a recovery attempt.
   *
   * The original failure remains untouched.
   * The new failure is appended to the history.
   */
  async markFailed(
    jobId: string,
    error: unknown,
  ): Promise<void> {
    const ref =
      this.getJobRef(jobId);

    const message =
      errorToMessage(error);

    const snapshot =
      await ref.get();

    if (!snapshot.exists) {
      throw new Error(
        `Import audit record not found for job ${jobId}`,
      );
    }

    const existing =
      snapshot.data() as Partial<ImportJobAudit>;

    const existingErrors =
      Array.isArray(existing.errors)
        ? existing.errors
        : [];

    const existingOriginalErrors =
      Array.isArray(
        existing.originalErrors,
      )
        ? existing.originalErrors
        : [];

    const errors =
      existingErrors.includes(message)
        ? existingErrors
        : [
            ...existingErrors,
            message,
          ];

    const originalErrors =
      existingOriginalErrors.length > 0
        ? existingOriginalErrors
        : existingErrors.length > 0
          ? existingErrors
          : [message];

    await ref.set(
      {
        status: "failed",
        completedAt: new Date(),

        /*
         * Preserve all failure history.
         */
        errors,
        originalErrors,

        resumeAttempts:
          existing.resumeAttempts ?? 0,
      },
      {
        merge: true,
      },
    );
  }
}
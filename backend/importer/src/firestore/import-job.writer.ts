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
  unchanged: number;
  verified: number;

  /**
   * Latest/current failure information.
   *
   * Cleared after successful completion.
   */
  errors: string[];

  /**
   * Original failure(s) that caused the job
   * to enter recovery.
   *
   * Never cleared by a successful resume.
   */
  originalErrors?: string[];

  /**
   * Number of resume attempts made against
   * this job ID.
   */
  resumeAttempts?: number;
}

function errorToMessage(
  error: unknown,
): string {
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

  /**
   * ----------------------------------------------------------
   * START
   * ----------------------------------------------------------
   *
   * Creates the initial audit record.
   *
   * Transition:
   *
   * nonexistent -> running
   */
  async start(
    jobId: string,
    source: string,
    startedAt: Date,
  ): Promise<void> {
    const ref =
      this.getJobRef(jobId);

    const existing =
      await ref.get();

    if (existing.exists) {
      throw new Error(
        `Import audit record already exists for job ${jobId}`,
      );
    }

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
      unchanged: 0,
      verified: 0,

      errors: [],
      originalErrors: [],

      resumeAttempts: 0,
    };

    await ref.set(job);
  }

  /**
   * ----------------------------------------------------------
   * COMPLETE
   * ----------------------------------------------------------
   *
   * Completes a currently running job.
   *
   * Valid transitions:
   *
   * running -> completed
   *
   * A failed job is not completed directly by the writer.
   * It must first be resumed:
   *
   * failed -> running -> completed
   *
   * All statistics come directly from
   * ImporterPipelineResult, which itself comes directly
   * from ContentWriter.
   */
  async complete(
    result: ImporterPipelineResult,
    startedAt: Date,
  ): Promise<void> {
    const ref =
      this.getJobRef(result.jobId);

    const snapshot =
      await ref.get();

    if (!snapshot.exists) {
      throw new Error(
        `Import audit record not found for job ${result.jobId}`,
      );
    }

    const existing =
      snapshot.data() as Partial<ImportJobAudit>;

    /*
     * Prevent:
     *
     * completed -> completed
     * completed -> anything
     */
    if (
      existing.status ===
      "completed"
    ) {
      throw new Error(
        `Import job "${result.jobId}" is already completed.`,
      );
    }

    /*
     * M8.5 requires completion to happen
     * only from running.
     *
     * A failed job must explicitly pass
     * through resume().
     */
    if (
      existing.status !==
      "running"
    ) {
      throw new Error(
        `Import job "${result.jobId}" cannot be completed from status "${existing.status}".`,
      );
    }

    /*
     * IMPORTANT:
     *
     * These values are copied directly from
     * the actual pipeline/write result.
     *
     * No recalculation occurs here.
     */
    const job = {
      jobId: result.jobId,
      source: result.source,

      status:
        "completed" as const,

      startedAt:
        existing.startedAt ??
        startedAt,

      completedAt:
        new Date(),

      collected:
        result.collected,

      normalized:
        result.normalized,

      written:
        result.written,

      created:
        result.created,

      updated:
        result.updated,

      unchanged:
        result.unchanged,

      verified:
        result.verified,

      /*
       * Current failure state is cleared
       * after successful completion.
       *
       * originalErrors is intentionally NOT
       * included, so merge:true preserves it.
       */
      errors: [],
    };

    await ref.set(
      job,
      {
        merge: true,
      },
    );
  }

  /**
   * ----------------------------------------------------------
   * FAIL
   * ----------------------------------------------------------
   *
   * Records an initial or normal-run failure.
   *
   * Transition:
   *
   * running -> failed
   *
   * The first failure is copied into
   * originalErrors and is never lost.
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
            snapshot.data() as
              Partial<ImportJobAudit>
          )
        : undefined;

    /*
     * Preserve existing current errors.
     */
    const existingErrors =
      Array.isArray(
        existing?.errors,
      )
        ? existing.errors
        : [];

    /*
     * Preserve original failure history.
     */
    const existingOriginalErrors =
      Array.isArray(
        existing?.originalErrors,
      )
        ? existing.originalErrors
        : [];

    /*
     * The first failure becomes
     * the original failure.
     */
    const originalErrors =
      existingOriginalErrors.length >
      0
        ? existingOriginalErrors
        : existingErrors.length > 0
          ? existingErrors
          : [message];

    /*
     * Avoid duplicating the same failure.
     */
    const errors =
      existingErrors.includes(
        message,
      )
        ? existingErrors
        : [
            ...existingErrors,
            message,
          ];

    await ref.set(
      {
        jobId,
        source,

        status:
          "failed" as const,

        /*
         * Preserve original job start time.
         */
        startedAt:
          existing?.startedAt ??
          startedAt,

        completedAt:
          new Date(),

        errors,
        originalErrors,

        resumeAttempts:
          existing?.resumeAttempts ??
          0,
      },
      {
        merge: true,
      },
    );
  }

  /**
   * ----------------------------------------------------------
   * RESUME
   * ----------------------------------------------------------
   *
   * Transition:
   *
   * failed -> running
   *
   * The same jobId is reused.
   *
   * Completed jobs cannot be resumed.
   * Running jobs cannot be resumed again.
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
      snapshot.data() as
        Partial<ImportJobAudit>;

    /*
     * Prevent:
     *
     * completed -> running
     */
    if (
      existing.status ===
      "completed"
    ) {
      throw new Error(
        `Import job "${jobId}" is already completed.`,
      );
    }

    /*
     * Only failed jobs may be resumed.
     */
    if (
      existing.status !==
      "failed"
    ) {
      throw new Error(
        `Import job "${jobId}" cannot be resumed from status "${existing.status}".`,
      );
    }

    const resumeAttempts =
      (
        existing.resumeAttempts ??
        0
      ) + 1;

    await ref.set(
      {
        jobId,
        source,

        status:
          "running" as const,

        /*
         * Original start time is preserved.
         */
        startedAt:
          existing.startedAt ??
          startedAt,

        completedAt:
          null,

        resumeAttempts,

        /*
         * Deliberately preserve:
         *
         * errors
         * originalErrors
         */
      },
      {
        merge: true,
      },
    );
  }

  /**
   * ----------------------------------------------------------
   * MARK FAILED
   * ----------------------------------------------------------
   *
   * Records a failure during a recovery attempt.
   *
   * Transition:
   *
   * running -> failed
   *
   * Original failure information is never replaced.
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
      snapshot.data() as
        Partial<ImportJobAudit>;

    const existingErrors =
      Array.isArray(
        existing.errors,
      )
        ? existing.errors
        : [];

    const existingOriginalErrors =
      Array.isArray(
        existing.originalErrors,
      )
        ? existing.originalErrors
        : [];

    /*
     * Append the new failure to the
     * current failure history.
     */
    const errors =
      existingErrors.includes(
        message,
      )
        ? existingErrors
        : [
            ...existingErrors,
            message,
          ];

    /*
     * Never replace originalErrors.
     */
    const originalErrors =
      existingOriginalErrors.length >
      0
        ? existingOriginalErrors
        : existingErrors.length > 0
          ? existingErrors
          : [message];

    await ref.set(
      {
        status:
          "failed" as const,

        completedAt:
          new Date(),

        errors,
        originalErrors,

        resumeAttempts:
          existing.resumeAttempts ??
          0,
      },
      {
        merge: true,
      },
    );
  }
}
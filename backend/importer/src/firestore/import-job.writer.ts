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

  errors: string[];
}

export class ImportJobWriter {
  private readonly db = firestore();

  async start(
    jobId: string,
    source: string,
    startedAt: Date,
  ): Promise<void> {
    const ref = this.db
      .collection("system")
      .doc("importJobs")
      .collection("runs")
      .doc(jobId);

    const job: ImportJobAudit = {
      jobId,
      source,
      status: "running",
      startedAt,
      collected: 0,
      normalized: 0,
      written: 0,
      created: 0,
      updated: 0,
      verified: 0,
      errors: [],
    };

    await ref.set(job);
  }

  async complete(
    result: ImporterPipelineResult,
    startedAt: Date,
  ): Promise<void> {
    const ref = this.db
      .collection("system")
      .doc("importJobs")
      .collection("runs")
      .doc(result.jobId);

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
    };

    await ref.set(job, { merge: true });
  }

  async fail(
    jobId: string,
    source: string,
    startedAt: Date,
    error: unknown,
  ): Promise<void> {
    const ref = this.db
      .collection("system")
      .doc("importJobs")
      .collection("runs")
      .doc(jobId);

    const message =
      error instanceof Error
        ? error.message
        : String(error);

    await ref.set(
      {
        jobId,
        source,
        status: "failed",
        startedAt,
        completedAt: new Date(),
        errors: [message],
      },
      { merge: true },
    );
  }

  async resume(
    jobId: string,
    source: string,
    startedAt: Date,
  ): Promise<void> {
    const ref = this.db
      .collection("system")
      .doc("importJobs")
      .collection("runs")
      .doc(jobId);

    await ref.set(
      {
        jobId,
        source,
        status: "running",
        startedAt,
        completedAt: null,
        errors: [],
      },
      { merge: true },
    );
  }

  async markFailed(
    jobId: string,
    error: unknown,
  ): Promise<void> {
    const ref = this.db
      .collection("system")
      .doc("importJobs")
      .collection("runs")
      .doc(jobId);

    const message =
      error instanceof Error
        ? error.message
        : String(error);

    await ref.set(
      {
        status: "failed",
        errors: [message],
        completedAt: new Date(),
      },
      { merge: true },
    );
  }
}
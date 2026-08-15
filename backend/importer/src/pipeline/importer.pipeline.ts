import crypto from "node:crypto";

import { CollectorFactory } from "../collector/index.js";

import {
  ImportJobReader,
  ImportJobWriter,
} from "../firestore/index.js";

import {
  ContentWriter,
  type ContentWriteResult,
} from "../firestore/content.writer.js";

import { FirestoreService } from "../firestore/service.js";

import { ContentNormalizer } from "../normalizer/index.js";

import {
  createImportExecutionSummary,
  type ImportExecutionSummary,
} from "../observability/importer.execution-summary.js";

import {
  importerLogger,
} from "../observability/importer.logger.js";

import { Pipeline } from "../shared/index.js";

import { ContentValidator } from "../validator/index.js";

export interface ImporterPipelineOptions {
  source: "json" | "manual";
}

export interface ImporterPipelineResult {
  jobId: string;
  source: string;

  collected: number;
  normalized: number;

  written: number;
  created: number;
  updated: number;
  unchanged: number;
  verified: number;

  executionSummary?: ImportExecutionSummary;
}

export class ImporterPipeline {
  private readonly source:
    "json" | "manual";

  constructor(
    options: ImporterPipelineOptions,
  ) {
    this.source =
      options.source;
  }

  async run(): Promise<ImporterPipelineResult> {
    const jobId =
      crypto.randomUUID();

    const startedAt =
      new Date();

    const jobWriter =
      new ImportJobWriter();

    /*
     * --------------------------------------------------------
     * Firestore
     * --------------------------------------------------------
     */

    const firestoreService =
      new FirestoreService();

    const contentWriter =
      new ContentWriter({
        firestore:
          firestoreService.getFirestore(),
      });

    let collected = 0;
    let normalized = 0;

    let written = 0;
    let created = 0;
    let updated = 0;
    let unchanged = 0;
    let verified = 0;

    let retries = 0;

    importerLogger.info(
      "Import pipeline started.",
      {
        jobId,
        source: this.source,
      },
    );

    console.log("");
    console.log(
      "## Import Pipeline",
    );
    console.log(
      "----------------------",
    );
    console.log(
      `Job ID : ${jobId}`,
    );
    console.log(
      `Source : ${this.source}`,
    );
    console.log("");

    await jobWriter.start(
      jobId,
      this.source,
      startedAt,
    );

    try {
      /*
       * ------------------------------------------------------
       * Collection
       * ------------------------------------------------------
       */

      const collector =
        CollectorFactory.create(
          this.source,
        );

      const documents =
        await collector.collect();

      collected =
        documents.length;

      console.log(
        `Collected : ${collected}`,
      );

      /*
       * ------------------------------------------------------
       * Normalization
       * ------------------------------------------------------
       */

      const normalizer =
        new ContentNormalizer();

      const normalizedDocuments =
        normalizer.normalize(
          documents,
        );

      normalized =
        normalizedDocuments.length;

      console.log(
        `Normalized : ${normalized}`,
      );

      /*
       * ------------------------------------------------------
       * Validation
       * ------------------------------------------------------
       */

      const validator =
        new ContentValidator();

      const validation =
        validator.validate(
          normalizedDocuments,
        );

      console.log("");
      console.log(
        "## Content Validation",
      );
      console.log(
        "----------------------",
      );

      if (
        validation.errors.length >
        0
      ) {
        console.error(
          `❌ Errors : ${validation.errors.length}`,
        );

        validation.errors.forEach(
          (error: string) => {
            console.error(
              `• ${error}`,
            );
          },
        );
      }

      if (
        validation.warnings.length >
        0
      ) {
        console.warn(
          `⚠ Warnings : ${validation.warnings.length}`,
        );

        validation.warnings.forEach(
          (warning: string) => {
            console.warn(
              `• ${warning}`,
            );
          },
        );
      }

      if (
        !validation.valid
      ) {
        throw new Error(
          "Content validation failed.",
        );
      }

      console.log(
        "✅ Content validation passed.",
      );

      /*
       * ------------------------------------------------------
       * Existing pipeline summary
       * ------------------------------------------------------
       */

      const pipeline =
        new Pipeline({
          jobId,
          source: this.source,
          documents:
            normalizedDocuments,
        });

      console.log("");
      console.log(
        "## Pipeline",
      );
      console.log(
        "----------------------",
      );

      pipeline.summary();

      /*
       * ------------------------------------------------------
       * Content write
       * ------------------------------------------------------
       */

      const writeResult:
        ContentWriteResult =
        await contentWriter.write(
          normalizedDocuments,
        );

      written =
        writeResult.written;

      created =
        writeResult.created;

      updated =
        writeResult.updated;

      unchanged =
        writeResult.unchanged;

      verified =
        writeResult.verified;

      console.log("");
      console.log(
        "## Firestore Content Writer",
      );
      console.log(
        "---------------------------",
      );

      console.log(
        `✅ Written  : ${written}`,
      );

      console.log(
        `   Created  : ${created}`,
      );

      console.log(
        `   Updated  : ${updated}`,
      );

      console.log(
        `   Unchanged: ${unchanged}`,
      );

      console.log(
        `   Verified : ${verified}`,
      );

      const result:
        ImporterPipelineResult = {
        jobId,
        source: this.source,

        collected,
        normalized,

        written,
        created,
        updated,
        unchanged,
        verified,
      };

      /*
       * ------------------------------------------------------
       * Complete audit
       * ------------------------------------------------------
       */

      await jobWriter.complete(
        result,
        startedAt,
      );

      const executionSummary =
        createImportExecutionSummary({
          jobId,
          source: this.source,
          startedAt,
          status: "completed",

          collected,
          normalized,

          written,
          created,
          updated,
          unchanged,
          verified,

          retries,
        });

      result.executionSummary =
        executionSummary;

      importerLogger.info(
        "Import execution summary.",
        {
          jobId,
          source: this.source,
          status:
            executionSummary.status,
          durationMs:
            executionSummary.durationMs,

          collected,
          normalized,
          written,
          created,
          updated,
          unchanged,
          verified,
          retries,
        },
      );

      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : String(error);

      importerLogger.error(
        "Import pipeline failed.",
        {
          jobId,
          source: this.source,
          error: errorMessage,
        },
      );

      try {
        await jobWriter.fail(
          jobId,
          this.source,
          startedAt,
          error,
        );
      } catch (
        auditError: unknown
      ) {
        const auditErrorMessage =
          auditError instanceof Error
            ? auditError.message
            : String(auditError);

        importerLogger.error(
          "Failed to write import failure audit record.",
          {
            jobId,
            source: this.source,
            error:
              `Original error: ${errorMessage}; Audit error: ${auditErrorMessage}`,
          },
        );
      }

      throw error;
    }
  }

  /**
   * Resume a previously failed import.
   *
   * Rules:
   *
   * 1. Job must exist.
   * 2. Completed jobs cannot be resumed.
   * 3. Only failed jobs may be resumed.
   * 4. The original jobId is always reused.
   */
  async resume(
    jobId: string,
  ): Promise<ImporterPipelineResult> {
    const jobReader =
      new ImportJobReader();

    const auditRecord =
      await jobReader.get(
        jobId,
      );

    if (!auditRecord) {
      throw new Error(
        `Import audit record not found for job ${jobId}`,
      );
    }

    if (
      auditRecord.status ===
      "completed"
    ) {
      throw new Error(
        `Import job "${jobId}" is already completed.`,
      );
    }

    if (
      auditRecord.status !==
      "failed"
    ) {
      throw new Error(
        `Import job "${jobId}" cannot be resumed from status "${auditRecord.status}".`,
      );
    }

    const source =
      auditRecord.source ===
      "manual"
        ? "manual"
        : "json";

    importerLogger.info(
      "Resuming failed import job.",
      {
        jobId,
        source,
        status:
          auditRecord.status,

        resumeAttempts:
          auditRecord.resumeAttempts ??
          0,
      },
    );

    const resumedPipeline =
      new ImporterPipeline({
        source,
      });

    /*
     * Important:
     *
     * No crypto.randomUUID().
     *
     * The original jobId is passed through.
     */
    return resumedPipeline.runWithJobId(
      jobId,
    );
  }

  /**
   * Execute a recovery using an existing job ID.
   */
  private async runWithJobId(
    jobId: string,
  ): Promise<ImporterPipelineResult> {
    const startedAt =
      new Date();

    const jobWriter =
      new ImportJobWriter();

    const firestoreService =
      new FirestoreService();

    const contentWriter =
      new ContentWriter({
        firestore:
          firestoreService.getFirestore(),
      });

    let collected = 0;
    let normalized = 0;

    let written = 0;
    let created = 0;
    let updated = 0;
    let unchanged = 0;
    let verified = 0;

    let retries = 0;

    /*
     * Mark the existing job as running.
     *
     * This increments resumeAttempts while
     * preserving original failure information.
     */
    await jobWriter.resume(
      jobId,
      this.source,
      startedAt,
    );

    importerLogger.info(
      "Resumed import pipeline started.",
      {
        jobId,
        source: this.source,
      },
    );

    try {
      /*
       * ------------------------------------------------------
       * Collection
       * ------------------------------------------------------
       */

      const collector =
        CollectorFactory.create(
          this.source,
        );

      const documents =
        await collector.collect();

      collected =
        documents.length;

      /*
       * ------------------------------------------------------
       * Normalization
       * ------------------------------------------------------
       */

      const normalizer =
        new ContentNormalizer();

      const normalizedDocuments =
        normalizer.normalize(
          documents,
        );

      normalized =
        normalizedDocuments.length;

      /*
       * ------------------------------------------------------
       * Validation
       * ------------------------------------------------------
       */

      const validator =
        new ContentValidator();

      const validation =
        validator.validate(
          normalizedDocuments,
        );

      if (
        !validation.valid
      ) {
        throw new Error(
          "Content validation failed.",
        );
      }

      /*
       * ------------------------------------------------------
       * Content write
       * ------------------------------------------------------
       */

      const writeResult:
        ContentWriteResult =
        await contentWriter.write(
          normalizedDocuments,
        );

      written =
        writeResult.written;

      created =
        writeResult.created;

      updated =
        writeResult.updated;

      unchanged =
        writeResult.unchanged;

      verified =
        writeResult.verified;

      const result:
        ImporterPipelineResult = {
        jobId,
        source: this.source,

        collected,
        normalized,

        written,
        created,
        updated,
        unchanged,
        verified,
      };

      /*
       * ------------------------------------------------------
       * Complete existing job
       * ------------------------------------------------------
       */

      await jobWriter.complete(
        result,
        startedAt,
      );

      const executionSummary =
        createImportExecutionSummary({
          jobId,
          source: this.source,
          startedAt,
          status: "completed",

          collected,
          normalized,

          written,
          created,
          updated,
          unchanged,
          verified,

          retries,
        });

      result.executionSummary =
        executionSummary;

      importerLogger.info(
        "Resumed import pipeline completed.",
        {
          jobId,
          source: this.source,
          status:
            executionSummary.status,
          durationMs:
            executionSummary.durationMs,

          collected,
          normalized,
          written,
          created,
          updated,
          unchanged,
          verified,
          retries,
        },
      );

      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : String(error);

      const executionSummary =
        createImportExecutionSummary({
          jobId,
          source: this.source,
          startedAt,
          status: "failed",

          collected,
          normalized,

          written,
          created,
          updated,
          unchanged,
          verified,

          retries,
          error: errorMessage,
        });

      importerLogger.error(
        "Resumed import pipeline failed.",
        {
          jobId,
          source: this.source,
          error: errorMessage,

          collected,
          normalized,
          written,
          created,
          updated,
          unchanged,
          verified,
          retries,

          durationMs:
            executionSummary.durationMs,
        },
      );

      /*
       * Important:
       *
       * markFailed() preserves the original failure
       * and appends the new recovery failure.
       */
      try {
        await jobWriter.markFailed(
          jobId,
          error,
        );
      } catch (
        auditError: unknown
      ) {
        const auditErrorMessage =
          auditError instanceof Error
            ? auditError.message
            : String(auditError);

        importerLogger.error(
          "Failed to record resumed import failure.",
          {
            jobId,
            source: this.source,
            error:
              `Original error: ${errorMessage}; Audit error: ${auditErrorMessage}`,
          },
        );
      }

      /*
       * Never replace the actual import error
       * with an audit-write error.
       */
      throw error;
    }
  }
}
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

  /*
   * These values must always come directly
   * from ContentWriter.
   */
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

  /**
   * ----------------------------------------------------------
   * NORMAL IMPORT
   * ----------------------------------------------------------
   *
   * Lifecycle:
   *
   * nonexistent -> running
   *
   * success:
   *
   * running -> completed
   *
   * failure:
   *
   * running -> failed
   */
  async run(): Promise<ImporterPipelineResult> {
    const jobId =
      crypto.randomUUID();

    return this.runWithJobId(
      jobId,
      false,
    );
  }

  /**
   * ----------------------------------------------------------
   * RESUME
   * ----------------------------------------------------------
   *
   * Reads the existing audit record first.
   *
   * Rules:
   *
   * 1. Job must exist.
   * 2. Job must be failed.
   * 3. Completed jobs cannot be resumed.
   * 4. Same jobId is reused.
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

    /*
     * IMPORTANT:
     *
     * Do not create another UUID.
     *
     * The existing jobId is reused.
     */
    const resumedPipeline =
      new ImporterPipeline({
        source,
      });

    return resumedPipeline.runWithJobId(
      jobId,
      true,
    );
  }

  /**
   * ----------------------------------------------------------
   * EXECUTE PIPELINE WITH A SPECIFIC JOB ID
   * ----------------------------------------------------------
   *
   * For normal imports:
   *
   * jobId is newly generated and start()
   * creates running audit.
   *
   * For recovery:
   *
   * jobId already exists and resume()
   * changes failed -> running.
   */
  private async runWithJobId(
    jobId: string,
    isResume: boolean,
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
     * --------------------------------------------------------
     * Audit state transition
     * --------------------------------------------------------
     */

    if (isResume) {
      /*
       * failed -> running
       *
       * This also increments resumeAttempts.
       */
      await jobWriter.resume(
        jobId,
        this.source,
        startedAt,
      );
    } else {
      /*
       * nonexistent -> running
       */
      await jobWriter.start(
        jobId,
        this.source,
        startedAt,
      );
    }

    importerLogger.info(
      isResume
        ? "Resumed import pipeline started."
        : "Import pipeline started.",
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
       * Pipeline summary
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
       * Firestore content write
       * ------------------------------------------------------
       *
       * ContentWriter is the source of truth for:
       *
       * written
       * created
       * updated
       * unchanged
       * verified
       */
      const writeResult:
        ContentWriteResult =
        await contentWriter.write(
          normalizedDocuments,
        );

      /*
       * Copy the actual write result.
       *
       * Do not calculate these independently.
       */
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

      /*
       * ------------------------------------------------------
       * Build final result
       * ------------------------------------------------------
       *
       * This object contains exactly the values
       * returned by ContentWriter.
       */
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
       * Audit completion
       * ------------------------------------------------------
       *
       * State:
       *
       * normal:
       * running -> completed
       *
       * recovery:
       * running -> completed
       *
       * In both cases the exact writeResult
       * statistics are persisted.
       */
      await jobWriter.complete(
        result,
        startedAt,
      );

      /*
       * ------------------------------------------------------
       * Execution summary
       * ------------------------------------------------------
       */

      const executionSummary =
        createImportExecutionSummary({
          jobId,
          source: this.source,

          startedAt,

          status:
            "completed",

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
        isResume
          ? "Resumed import pipeline completed."
          : "Import execution summary.",
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
    } catch (
      error: unknown
    ) {
      /*
       * IMPORTANT:
       *
       * Preserve the actual pipeline error.
       */
      const errorMessage =
        error instanceof Error
          ? error.message
          : String(error);

      importerLogger.error(
        isResume
          ? "Resumed import pipeline failed."
          : "Import pipeline failed.",
        {
          jobId,
          source: this.source,

          error:
            errorMessage,

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

      /*
       * ------------------------------------------------------
       * Failure audit
       * ------------------------------------------------------
       *
       * Normal:
       *
       * running -> failed
       *
       * Recovery:
       *
       * running -> failed
       *
       * In recovery, markFailed() preserves
       * originalErrors.
       */
      try {
        if (isResume) {
          await jobWriter.markFailed(
            jobId,
            error,
          );
        } else {
          await jobWriter.fail(
            jobId,
            this.source,
            startedAt,
            error,
          );
        }
      } catch (
        auditError: unknown
      ) {
        /*
         * M8.5 REQUIREMENT:
         *
         * Audit-write failure must NEVER hide
         * the original import failure.
         */
        const auditErrorMessage =
          auditError instanceof Error
            ? auditError.message
            : String(auditError);

        importerLogger.error(
          isResume
            ? "Failed to record resumed import failure."
            : "Failed to write import failure audit record.",
          {
            jobId,
            source: this.source,

            originalError:
              errorMessage,

            auditError:
              auditErrorMessage,
          },
        );
      }

      /*
       * ALWAYS throw the original error.
       */
      throw error;
    }
  }
}
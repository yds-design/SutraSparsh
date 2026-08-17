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

import {
  importerMetrics,
} from "../observability/importer.metrics.js";

import { Pipeline } from "../shared/index.js";

import { ContentValidator } from "../validator/index.js";

import type { PipelineContext } from "../types/index.js";

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
        phase: "pipeline",
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

      importerMetrics.setCollected(
        collected,
      );

      importerLogger.info(
        "Import collection completed.",
        {
          jobId,
          source: this.source,
          phase: "collection",
          collected,
        },
      );

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

      importerMetrics.setNormalized(
        normalized,
      );

      importerLogger.info(
        "Import normalization completed.",
        {
          jobId,
          source: this.source,
          phase: "normalization",
          normalized,
        },
      );

      console.log(
        `Normalized : ${normalized}`,
      );

      /*
       * ------------------------------------------------------
       * Validation
       * ------------------------------------------------------
       */

      console.log("");
      console.log(
        "## Content Validation",
      );
      console.log(
        "----------------------",
      );

      const validator =
        new ContentValidator();

      const validation =
        validator.validate(
          normalizedDocuments,
        );

      if (!validation.valid) {
        const validationError =
          validation.errors.join(
            "; ",
          );

        importerLogger.error(
          "Import validation failed.",
          {
            jobId,
            source: this.source,
            phase: "validation",
            error:
              validationError,
            errorCount:
              validation.errors.length,
          },
        );

        throw new Error(
          validationError,
        );
      }

      console.log(
        "✅ Content validation passed.",
      );

      /*
       * ------------------------------------------------------
       * Pipeline
       * ------------------------------------------------------
       */

      console.log("");
      console.log(
        "## Pipeline",
      );
      console.log(
        "----------------------",
      );

      const pipelineContext:
        PipelineContext = {
        jobId,
        source: this.source,
        documents:
          normalizedDocuments,
      };

      const pipeline =
        new Pipeline(
          pipelineContext,
        );

      pipeline.summary();

      /*
       * ------------------------------------------------------
       * Content Write
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

      importerMetrics.setWritten(
        written,
      );

      importerMetrics.setCreated(
        created,
      );

      importerMetrics.setUpdated(
        updated,
      );

      importerMetrics.setUnchanged(
        unchanged,
      );

      importerMetrics.setVerified(
        verified,
      );

      importerMetrics.setRetries(
        retries,
      );

      importerLogger.info(
        "Import content write completed.",
        {
          jobId,
          source: this.source,
          phase: "write",

          written,
          created,
          updated,
          unchanged,
          verified,

          retries,
        },
      );

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
       * Result
       * ------------------------------------------------------
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
       * Complete Audit
       * ------------------------------------------------------
       */

      await jobWriter.complete(
        result,
        startedAt,
      );

      /*
       * ------------------------------------------------------
       * Execution Summary
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

      importerMetrics.recordDuration(
        startedAt,
      );

      importerLogger.info(
        "Import execution summary.",
        {
          jobId,
          source: this.source,
          phase: "summary",

          status:
            executionSummary.status,

          durationMs:
            executionSummary.durationMs,

          collected:
            executionSummary.collected,

          normalized:
            executionSummary.normalized,

          written:
            executionSummary.written,

          created:
            executionSummary.created,

          updated:
            executionSummary.updated,

          unchanged:
            executionSummary.unchanged,

          verified:
            executionSummary.verified,

          retries:
            executionSummary.retries,
        },
      );

      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : String(error);

      /*
       * ------------------------------------------------------
       * Failed Execution Summary
       * ------------------------------------------------------
       */

      const executionSummary =
        createImportExecutionSummary({
          jobId,
          source: this.source,

          startedAt,

          status:
            "failed",

          collected,
          normalized,

          written,
          created,
          updated,
          unchanged,
          verified,

          retries,

          error:
            errorMessage,
        });

      importerMetrics.recordDuration(
        startedAt,
      );

      importerMetrics.setRetries(
        retries,
      );

      importerLogger.error(
        "Import execution summary.",
        {
          jobId,
          source: this.source,
          phase: "summary",

          status:
            executionSummary.status,

          durationMs:
            executionSummary.durationMs,

          collected:
            executionSummary.collected,

          normalized:
            executionSummary.normalized,

          written:
            executionSummary.written,

          created:
            executionSummary.created,

          updated:
            executionSummary.updated,

          unchanged:
            executionSummary.unchanged,

          verified:
            executionSummary.verified,

          retries,

          error:
            errorMessage,
        },
      );

      importerLogger.error(
        "Import pipeline failed.",
        {
          jobId,
          source: this.source,
          phase: "pipeline",
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

          durationMs:
            executionSummary.durationMs,
        },
      );

      /*
       * ------------------------------------------------------
       * Failure Audit
       * ------------------------------------------------------
       */

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
            phase: "audit",
            error:
              `Original error: ${errorMessage}; Audit error: ${auditErrorMessage}`,
          },
        );
      }

      throw error;
    }
  }

  async resume(
    jobId: string,
  ): Promise<ImporterPipelineResult> {
    const reader =
      new ImportJobReader();

    const existing =
      await reader.get(
        jobId,
      );

    if (!existing) {
      throw new Error(
        `Import audit record not found for job ${jobId}`,
      );
    }

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

    const startedAt =
      existing.startedAt;

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

    const retries = 0;

    importerLogger.info(
      "Resumed import pipeline started.",
      {
        jobId,
        source: this.source,
        phase: "recovery",
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

    await jobWriter.resume(
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

      console.log("");
      console.log(
        "## Content Validation",
      );
      console.log(
        "----------------------",
      );

      const validator =
        new ContentValidator();

      const validation =
        validator.validate(
          normalizedDocuments,
        );

      if (!validation.valid) {
        throw new Error(
          validation.errors.join(
            "; ",
          ),
        );
      }

      console.log(
        "✅ Content validation passed.",
      );

      /*
       * ------------------------------------------------------
       * Pipeline
       * ------------------------------------------------------
       */

      console.log("");
      console.log(
        "## Pipeline",
      );
      console.log(
        "----------------------",
      );

      const pipelineContext:
        PipelineContext = {
        jobId,
        source: this.source,
        documents:
          normalizedDocuments,
      };

      const pipeline =
        new Pipeline(
          pipelineContext,
        );

      pipeline.summary();

      /*
       * ------------------------------------------------------
       * Write
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

      /*
       * ------------------------------------------------------
       * Result
       * ------------------------------------------------------
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
       * Complete Existing Job
       * ------------------------------------------------------
       */

      await jobWriter.complete(
        result,
        startedAt,
      );

      /*
       * ------------------------------------------------------
       * Execution Summary
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

      importerMetrics.recordDuration(
        startedAt,
      );

      importerLogger.info(
        "Resumed import pipeline completed.",
        {
          jobId,
          source: this.source,
          phase: "recovery",

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

          status:
            "failed",

          collected,
          normalized,

          written,
          created,
          updated,
          unchanged,
          verified,

          retries,

          error:
            errorMessage,
        });

      importerMetrics.recordDuration(
        startedAt,
      );

      importerLogger.error(
        "Resumed import pipeline failed.",
        {
          jobId,
          source: this.source,
          phase: "recovery",

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

          error:
            errorMessage,
        },
      );

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
            phase: "audit",

            error:
              `Original error: ${errorMessage}; Audit error: ${auditErrorMessage}`,
          },
        );
      }

      /*
       * ------------------------------------------------------
       * Never replace the actual
       * import error with an
       * audit-write error.
       * ------------------------------------------------------
       */

      throw error;
    }
  }
}
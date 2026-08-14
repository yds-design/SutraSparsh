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
  private readonly source: "json" | "manual";

  constructor(options: ImporterPipelineOptions) {
    this.source = options.source;
  }

  async run(): Promise<ImporterPipelineResult> {
    const jobId = crypto.randomUUID();
    const startedAt = new Date();

    const jobWriter = new ImportJobWriter();

    let collected = 0;
    let normalized = 0;

    let written = 0;
    let created = 0;
    let updated = 0;
    let unchanged = 0;
    let verified = 0;

    let retries = 0;

    importerLogger.info("Import pipeline started.", {
      jobId,
      source: this.source,
    });

    console.log("");
    console.log("## Import Pipeline");
    console.log("----------------------");
    console.log(`Job ID : ${jobId}`);
    console.log(`Source : ${this.source}`);
    console.log("");

    await jobWriter.start(
      jobId,
      this.source,
      startedAt,
    );

    try {
      /*
       * Collection
       */
      const collector = CollectorFactory.create(
        this.source,
      );

      const documents = await collector.collect();

      collected = documents.length;

      importerLogger.info(
        "Import collection completed.",
        {
          jobId,
          source: this.source,
          collected,
        },
      );

      console.log(`Collected : ${collected}`);

      /*
       * Normalization
       */
      const normalizer = new ContentNormalizer();

      const normalizedDocuments =
        normalizer.normalize(documents);

      normalized = normalizedDocuments.length;

      importerLogger.info(
        "Import normalization completed.",
        {
          jobId,
          source: this.source,
          collected,
          normalized,
        },
      );

      console.log(`Normalized : ${normalized}`);

      /*
       * Validation
       */
      const validator = new ContentValidator();

      const validation = validator.validate(
        normalizedDocuments,
      );

      console.log("");
      console.log("## Content Validation");
      console.log("----------------------");

      if (validation.errors.length > 0) {
        console.error(
          `❌ Errors : ${validation.errors.length}`,
        );

        validation.errors.forEach(
          (error: string) => {
            console.error(`• ${error}`);
          },
        );
      }

      if (validation.warnings.length > 0) {
        console.warn(
          `⚠ Warnings : ${validation.warnings.length}`,
        );

        validation.warnings.forEach(
          (warning: string) => {
            console.warn(`• ${warning}`);
          },
        );
      }

      if (!validation.valid) {
        console.error("");
        console.error(
          "❌ Content validation failed.",
        );

        importerLogger.error(
          "Import content validation failed.",
          {
            jobId,
            source: this.source,
            error: validation.errors.join("; "),
          },
        );

        throw new Error(
          "Content validation failed.",
        );
      }

      console.log(
        "✅ Content validation passed.",
      );

      importerLogger.info(
        "Import content validation passed.",
        {
          jobId,
          source: this.source,
        },
      );

      /*
       * Pipeline
       */
      const pipeline = new Pipeline({
        jobId,
        source: this.source,
        documents: normalizedDocuments,
      });

      console.log("");
      console.log("## Pipeline");
      console.log("----------------------");

      pipeline.summary();

      /*
       * Firestore content writer
       */
      console.log("");
      console.log(
        "## Firestore Content Writer",
      );
      console.log(
        "---------------------------",
      );

      const contentWriter = new ContentWriter();

      let writeResult: ContentWriteResult;

      try {
        writeResult =
          await contentWriter.write(
            normalizedDocuments,
          );
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : String(error);

        importerLogger.error(
          "Firestore content writing failed.",
          {
            jobId,
            source: this.source,
            error: errorMessage,
          },
        );

        if (error instanceof Error) {
          throw error;
        }

        throw new Error(
          "Firestore content writing failed.",
          {
            cause: error,
          },
        );
      }

      written = writeResult.written;
      created = writeResult.created;
      updated = writeResult.updated;
      unchanged = writeResult.unchanged;
      verified = writeResult.verified;

      importerLogger.info(
        "Firestore content writing completed.",
        {
          jobId,
          source: this.source,
          written,
          created,
          updated,
          unchanged,
          verified,
        },
      );

      console.log(`✅ Written  : ${written}`);
      console.log(`   Created  : ${created}`);
      console.log(`   Updated  : ${updated}`);
      console.log(`   Unchanged: ${unchanged}`);
      console.log(`   Verified : ${verified}`);

      /*
       * Build normal pipeline result.
       */
      const result: ImporterPipelineResult = {
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
       * Complete audit.
       */
      await jobWriter.complete(
        result,
        startedAt,
      );

      importerLogger.info(
        "Import audit marked completed.",
        {
          jobId,
          source: this.source,
          written,
          verified,
        },
      );

      /*
       * Verify audit record.
       */
      const jobReader = new ImportJobReader();

      const auditRecord =
        await jobReader.get(result.jobId);

      if (!auditRecord) {
        throw new Error(
          `Import audit record not found for job ${result.jobId}`,
        );
      }

      if (
        auditRecord.status !==
        "completed"
      ) {
        throw new Error(
          `Import audit status is "${auditRecord.status}" instead of "completed".`,
        );
      }

      if (
        auditRecord.written !==
          result.written ||
        auditRecord.verified !==
          result.verified
      ) {
        throw new Error(
          "Import audit statistics do not match pipeline result.",
        );
      }

      console.log("");
      console.log(
        "## Import Audit Verification",
      );
      console.log(
        "-----------------------------",
      );

      console.log(
        "✅ Audit record read successfully.",
      );

      console.log(
        `   Status   : ${auditRecord.status}`,
      );

      console.log(
        `   Written  : ${auditRecord.written}`,
      );

      console.log(
        `   Verified : ${auditRecord.verified}`,
      );

      importerLogger.info(
        "Import audit verification completed.",
        {
          jobId,
          source: this.source,
          status: auditRecord.status,
          written: auditRecord.written,
          verified: auditRecord.verified,
        },
      );

      /*
       * Successful execution summary.
       */
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
          status: executionSummary.status,
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
       * Failed execution summary.
       */
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

      /*
       * IMPORTANT:
       * Do not pass `error: executionSummary.error`
       * because exactOptionalPropertyTypes rejects
       * string | undefined when the property is optional.
       *
       * We know errorMessage exists here, so pass that
       * concrete string instead.
       */
      importerLogger.error(
        "Import execution summary.",
        {
          jobId,
          source: this.source,
          status: executionSummary.status,
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

          error: errorMessage,
        },
      );

      console.error("");
      console.error(
        "❌ Import pipeline failed.",
      );

      console.error(errorMessage);

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

        console.error(
          "✅ Import failure recorded in audit.",
        );

        importerLogger.info(
          "Import failure recorded in audit.",
          {
            jobId,
            source: this.source,
          },
        );
      } catch (auditError: unknown) {
        console.error(
          "⚠ Failed to write import audit record.",
        );

        const auditErrorMessage =
          auditError instanceof Error
            ? auditError.message
            : String(auditError);

        console.error(
          auditErrorMessage,
        );

        /*
         * ImportLogContext intentionally supports
         * only `error`, so combine both failures
         * into that supported field.
         */
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

  async resume(
    jobId: string,
  ): Promise<ImporterPipelineResult> {
    const jobReader = new ImportJobReader();

    const auditRecord =
      await jobReader.get(jobId);

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
      auditRecord.source === "manual"
        ? "manual"
        : "json";

    importerLogger.info(
      "Resuming failed import job.",
      {
        jobId,
        source,
        status: auditRecord.status,
      },
    );

    const resumedPipeline =
      new ImporterPipeline({
        source,
      });

    return resumedPipeline.runWithJobId(
      jobId,
    );
  }

  private async runWithJobId(
    jobId: string,
  ): Promise<ImporterPipelineResult> {
    const startedAt = new Date();

    const jobWriter = new ImportJobWriter();

    let collected = 0;
    let normalized = 0;

    let written = 0;
    let created = 0;
    let updated = 0;
    let unchanged = 0;
    let verified = 0;

    let retries = 0;

    importerLogger.info(
      "Resumed import pipeline started.",
      {
        jobId,
        source: this.source,
      },
    );

    try {
      /*
       * Collection
       */
      const collector =
        CollectorFactory.create(
          this.source,
        );

      const documents =
        await collector.collect();

      collected = documents.length;

      /*
       * Normalization
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
       * Validation
       */
      const validator =
        new ContentValidator();

      const validation =
        validator.validate(
          normalizedDocuments,
        );

      if (!validation.valid) {
        importerLogger.error(
          "Resumed import validation failed.",
          {
            jobId,
            source: this.source,
            error:
              validation.errors.join("; "),
          },
        );

        throw new Error(
          "Content validation failed.",
        );
      }

      /*
       * Firestore write
       */
      const contentWriter =
        new ContentWriter();

      const writeResult =
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
       * Complete audit.
       */
      await jobWriter.complete(
        result,
        startedAt,
      );

      /*
       * Execution summary for resumed
       * successful execution.
       */
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
          written,
          created,
          updated,
          unchanged,
          verified,
        },
      );

      importerLogger.info(
        "Import execution summary.",
        {
          jobId,
          source: this.source,
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
       * Failed resumed execution summary.
       */
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
        "Import execution summary.",
        {
          jobId,
          source: this.source,
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

          error: errorMessage,
        },
      );

      importerLogger.error(
        "Resumed import pipeline failed.",
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
      } catch (auditError: unknown) {
        /*
         * Preserve the original execution
         * failure. Log the audit failure
         * without introducing unsupported
         * ImportLogContext properties.
         */
        const auditErrorMessage =
          auditError instanceof Error
            ? auditError.message
            : String(auditError);

        importerLogger.error(
          "Failed to write resumed import failure audit record.",
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
}
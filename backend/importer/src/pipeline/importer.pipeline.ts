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
import { importerLogger } from "../observability/importer.logger.js";
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
}

export class ImporterPipeline {
  private readonly source: "json" | "manual";

  constructor(
    options: ImporterPipelineOptions,
  ) {
    this.source = options.source;
  }

  async run(): Promise<ImporterPipelineResult> {
    const jobId = crypto.randomUUID();
    const startedAt = new Date();

    const jobWriter = new ImportJobWriter();

    importerLogger.info(
      "Import pipeline started.",
      {
        jobId,
        source: this.source,
      },
    );

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
      const collector =
        CollectorFactory.create(
          this.source,
        );

      const documents =
        await collector.collect();

      importerLogger.info(
        "Import collection completed.",
        {
          jobId,
          source: this.source,
          collected: documents.length,
        },
      );

      console.log(
        `Collected : ${documents.length}`,
      );

      const normalizer =
        new ContentNormalizer();

      const normalizedDocuments =
        normalizer.normalize(documents);

      importerLogger.info(
        "Import normalization completed.",
        {
          jobId,
          source: this.source,
          collected: documents.length,
          normalized:
            normalizedDocuments.length,
        },
      );

      console.log(
        `Normalized : ${normalizedDocuments.length}`,
      );

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

      if (
        validation.warnings.length > 0
      ) {
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
            errors:
              validation.errors,
            warnings:
              validation.warnings,
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
          warnings:
            validation.warnings.length,
        },
      );

      const pipeline = new Pipeline({
        jobId,
        source: this.source,
        documents: normalizedDocuments,
      });

      console.log("");
      console.log("## Pipeline");
      console.log("----------------------");

      pipeline.summary();

      console.log("");
      console.log(
        "## Firestore Content Writer",
      );
      console.log(
        "---------------------------",
      );

      const contentWriter =
        new ContentWriter();

      let writeResult: ContentWriteResult;

      try {
        writeResult =
          await contentWriter.write(
            normalizedDocuments,
          );
      } catch (error: unknown) {
        importerLogger.error(
          "Firestore content writing failed.",
          {
            jobId,
            source: this.source,
            error:
              error instanceof Error
                ? error.message
                : String(error),
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

      importerLogger.info(
        "Firestore content writing completed.",
        {
          jobId,
          source: this.source,
          written:
            writeResult.written,
          created:
            writeResult.created,
          updated:
            writeResult.updated,
          unchanged:
            writeResult.unchanged,
          verified:
            writeResult.verified,
        },
      );

      console.log(
        `✅ Written  : ${writeResult.written}`,
      );

      console.log(
        `   Created  : ${writeResult.created}`,
      );

      console.log(
        `   Updated  : ${writeResult.updated}`,
      );

      console.log(
        `   Unchanged: ${writeResult.unchanged}`,
      );

      console.log(
        `   Verified : ${writeResult.verified}`,
      );

      const result: ImporterPipelineResult =
        {
          jobId,
          source: this.source,
          collected: documents.length,
          normalized:
            normalizedDocuments.length,
          written: writeResult.written,
          created: writeResult.created,
          updated: writeResult.updated,
          unchanged:
            writeResult.unchanged,
          verified:
            writeResult.verified,
        };

      await jobWriter.complete(
        result,
        startedAt,
      );

      importerLogger.info(
        "Import audit marked completed.",
        {
          jobId,
          source: this.source,
          written: result.written,
          verified: result.verified,
        },
      );

      const jobReader =
        new ImportJobReader();

      const auditRecord =
        await jobReader.get(
          result.jobId,
        );

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
          written:
            auditRecord.written,
          verified:
            auditRecord.verified,
        },
      );

      return result;
    } catch (error: unknown) {
      console.error("");
      console.error(
        "❌ Import pipeline failed.",
      );

      const errorMessage =
        error instanceof Error
          ? error.message
          : String(error);

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
      } catch (
        auditError: unknown
      ) {
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

        importerLogger.error(
          "Failed to write import failure audit record.",
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

      throw error;
    }
  }

  async resume(
    jobId: string,
  ): Promise<ImporterPipelineResult> {
    const jobReader =
      new ImportJobReader();

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
      auditRecord.source ===
      "manual"
        ? "manual"
        : "json";

    importerLogger.info(
      "Resuming failed import job.",
      {
        jobId,
        source,
        previousStatus:
          auditRecord.status,
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

    const jobWriter =
      new ImportJobWriter();

    importerLogger.info(
      "Resumed import pipeline started.",
      {
        jobId,
        source: this.source,
      },
    );

    try {
      const collector =
        CollectorFactory.create(
          this.source,
        );

      const documents =
        await collector.collect();

      const normalizer =
        new ContentNormalizer();

      const normalizedDocuments =
        normalizer.normalize(documents);

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
            errors:
              validation.errors,
            warnings:
              validation.warnings,
          },
        );

        throw new Error(
          "Content validation failed.",
        );
      }

      const contentWriter =
        new ContentWriter();

      const writeResult =
        await contentWriter.write(
          normalizedDocuments,
        );

      const result: ImporterPipelineResult =
        {
          jobId,
          source: this.source,
          collected: documents.length,
          normalized:
            normalizedDocuments.length,
          written: writeResult.written,
          created: writeResult.created,
          updated: writeResult.updated,
          unchanged:
            writeResult.unchanged,
          verified:
            writeResult.verified,
        };

      await jobWriter.complete(
        result,
        startedAt,
      );

      importerLogger.info(
        "Resumed import pipeline completed.",
        {
          jobId,
          source: this.source,
          written: result.written,
          created: result.created,
          updated: result.updated,
          unchanged: result.unchanged,
          verified: result.verified,
        },
      );

      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : String(error);

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
      } catch {
        // Preserve the original failure.
      }

      throw error;
    }
  }
}
import crypto from "node:crypto";

import { CollectorFactory } from "../collector/index.js";
import {
  ImportJobReader,
  ImportJobWriter,
} from "../firestore/index.js";
import { ContentWriter } from "../firestore/content.writer.js";
import { ContentNormalizer } from "../normalizer/index.js";
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
  verified: number;
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
      const result =
        await this.execute(jobId, this.source);

      await jobWriter.complete(
        result,
        startedAt,
      );

      await this.verifyAudit(
        result,
      );

      return result;
    } catch (error: unknown) {
      console.error("");
      console.error(
        "❌ Import pipeline failed.",
      );

      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error(String(error));
      }

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
      } catch (auditError: unknown) {
        console.error(
          "⚠ Failed to write import audit record.",
        );

        if (auditError instanceof Error) {
          console.error(
            auditError.message,
          );
        } else {
          console.error(
            String(auditError),
          );
        }
      }

      throw error;
    }
  }

  async resume(
    jobId: string,
  ): Promise<ImporterPipelineResult> {
    const jobReader = new ImportJobReader();
    const jobWriter = new ImportJobWriter();

    const auditRecord =
      await jobReader.get(jobId);

    if (!auditRecord) {
      throw new Error(
        `Import audit record not found for job ${jobId}.`,
      );
    }

    if (auditRecord.status !== "failed") {
      throw new Error(
        `Import job "${jobId}" cannot be resumed because its status is "${auditRecord.status}".`,
      );
    }

    const source =
      auditRecord.source as "json" | "manual";

    const startedAt =
      auditRecord.startedAt instanceof Date
        ? auditRecord.startedAt
        : new Date(auditRecord.startedAt);

    console.log("");
    console.log("## Import Resume");
    console.log("----------------------");
    console.log(`Job ID : ${jobId}`);
    console.log(`Source : ${source}`);
    console.log("");

    await jobWriter.resume(
      jobId,
      source,
      startedAt,
    );

    try {
      const result =
        await this.execute(
          jobId,
          source,
        );

      await jobWriter.complete(
        result,
        startedAt,
      );

      await this.verifyAudit(
        result,
      );

      return result;
    } catch (error: unknown) {
      console.error("");
      console.error(
        "❌ Resumed import pipeline failed.",
      );

      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error(String(error));
      }

      try {
        await jobWriter.fail(
          jobId,
          source,
          startedAt,
          error,
        );

        console.error(
          "✅ Resume failure recorded in audit.",
        );
      } catch (auditError: unknown) {
        console.error(
          "⚠ Failed to update resume failure audit.",
        );

        if (auditError instanceof Error) {
          console.error(
            auditError.message,
          );
        } else {
          console.error(
            String(auditError),
          );
        }
      }

      throw error;
    }
  }

  private async execute(
    jobId: string,
    source: "json" | "manual",
  ): Promise<ImporterPipelineResult> {
    // ------------------------------------------------------
    // Collector
    // ------------------------------------------------------

    const collector =
      CollectorFactory.create(source);

    const documents =
      await collector.collect();

    console.log(
      `Collected : ${documents.length}`,
    );

    // ------------------------------------------------------
    // Content Normalization
    // ------------------------------------------------------

    const normalizer =
      new ContentNormalizer();

    const normalizedDocuments =
      normalizer.normalize(documents);

    console.log(
      `Normalized : ${normalizedDocuments.length}`,
    );

    // ------------------------------------------------------
    // Content Validation
    // ------------------------------------------------------

    const validator =
      new ContentValidator();

    const validation =
      validator.validate(
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

      throw new Error(
        "Content validation failed.",
      );
    }

    console.log(
      "✅ Content validation passed.",
    );

    // ------------------------------------------------------
    // Pipeline State
    // ------------------------------------------------------

    const pipeline =
      new Pipeline({
        jobId,
        source,
        documents: normalizedDocuments,
      });

    console.log("");
    console.log("## Pipeline");
    console.log("----------------------");

    pipeline.summary();

    // ------------------------------------------------------
    // Firestore Content Writer
    // ------------------------------------------------------

    console.log("");
    console.log(
      "## Firestore Content Writer",
    );
    console.log(
      "---------------------------",
    );

    const contentWriter =
      new ContentWriter();

    const writeResult =
      await contentWriter.write(
        normalizedDocuments,
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
      `   Verified : ${writeResult.verified}`,
    );

    // ------------------------------------------------------
    // Import Result
    // ------------------------------------------------------

    return {
      jobId,
      source,
      collected: documents.length,
      normalized: normalizedDocuments.length,
      written: writeResult.written,
      created: writeResult.created,
      updated: writeResult.updated,
      verified: writeResult.verified,
    };
  }

  private async verifyAudit(
    result: ImporterPipelineResult,
  ): Promise<void> {
    const jobReader =
      new ImportJobReader();

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
  }
}
import crypto from "node:crypto";

import { CollectorFactory } from "../collector/index.js";
import { ContentNormalizer } from "../normalizer/index.js";
import { ContentValidator } from "../validator/index.js";
import { ContentWriter } from "../firestore/content.writer.js";
import { Pipeline } from "../shared/index.js";

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

    console.log("");
    console.log("## Import Pipeline");
    console.log("----------------------");
    console.log(`Job ID : ${jobId}`);
    console.log(`Source : ${this.source}`);
    console.log("");

    try {
      // ------------------------------------------------------
      // Collector
      // ------------------------------------------------------

      const collector = CollectorFactory.create(
        this.source,
      );

      const documents = await collector.collect();

      console.log(`Collected : ${documents.length}`);

      // ------------------------------------------------------
      // Normalizer
      // ------------------------------------------------------

      const normalizer = new ContentNormalizer();

      const normalizedDocuments =
        normalizer.normalize(documents);

      console.log(
        `Normalized : ${normalizedDocuments.length}`,
      );

      // ------------------------------------------------------
      // Validator
      // ------------------------------------------------------

      const validator = new ContentValidator();

      const validation =
        validator.validate(normalizedDocuments);

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
        console.error(
          `❌ Validation failed : ${validation.errors.length} error(s)`,
        );

        validation.errors.forEach(
          (error: string) => {
            console.error(`• ${error}`);
          },
        );

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

      const pipeline = new Pipeline({
        jobId,
        source: this.source,
        documents: normalizedDocuments,
      });

      pipeline.summary();

      // ------------------------------------------------------
      // Firestore Content Writer
      // ------------------------------------------------------

      console.log("");
      console.log("## Firestore Content Writer");
      console.log("---------------------------");

      const writer = new ContentWriter();

      const writeResult =
        await writer.write(normalizedDocuments);

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
      // Result
      // ------------------------------------------------------

      return {
        jobId,
        source: this.source,
        collected: documents.length,
        normalized: normalizedDocuments.length,
        written: writeResult.written,
        created: writeResult.created,
        updated: writeResult.updated,
        verified: writeResult.verified,
      };
    } catch (error: unknown) {
      console.error("");
      console.error("❌ Import pipeline failed.");

      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error(String(error));
      }

      throw error;
    }
  }
}
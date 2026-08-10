import crypto from "node:crypto";
import process from "node:process";

import { CollectorFactory } from "./collector/index.js";
import { validateEnvironment } from "./config/validator.js";
import { FirestoreService } from "./firestore/service.js";
import { ImportJobReader } from "./firestore/import-job.reader.js";
import { ContentNormalizer } from "./normalizer/index.js";
import { Pipeline } from "./shared/index.js";
import { ContentValidator } from "./validator/index.js";
import { ContentWriter } from "./firestore/content.writer.js";
import { ImporterPipeline } from "./pipeline/index.js";

export async function bootstrap(): Promise<void> {
  console.log("");
  console.log("================================");
  console.log(" SutraSparsh Import Engine");
  console.log(" Version 1.0.0");
  console.log("================================");
  console.log("");

  // ----------------------------------------------------------
  // Environment Validation
  // ----------------------------------------------------------

  const environmentValidation = validateEnvironment();

  if (!environmentValidation.valid) {
    console.error("❌ Environment validation failed.");
    console.error("");

    environmentValidation.errors.forEach((error: string) => {
      console.error(`• ${error}`);
    });

    console.error("");
    process.exit(1);
  }

  if (environmentValidation.warnings.length > 0) {
    console.log("Warnings");
    console.log("--------------------------------");

    environmentValidation.warnings.forEach((warning: string) => {
      console.log(`⚠ ${warning}`);
    });

    console.log("");
  }

  console.log("✅ Environment validation passed.");
  console.log("");

  // ----------------------------------------------------------
  // Firebase / Firestore
  // ----------------------------------------------------------

  const firestore = new FirestoreService();

  console.log("✅ Firebase initialized.");
  console.log("");

  // ----------------------------------------------------------
  // Firestore Collections
  // ----------------------------------------------------------

  console.log("## Top-level collections");
  console.log("");

  const collections = await firestore.listCollections();

  if (collections.length === 0) {
    console.log("(No collections found)");
  } else {
    collections.forEach((collection: string) => {
      console.log(`• ${collection}`);
    });
  }

  console.log("");

  // ----------------------------------------------------------
  // Firestore Write Verification
  // ----------------------------------------------------------

  console.log("Writing health document...");

  await firestore.writeHealthCheck();

  console.log("✅ Health document written successfully.");
  console.log("");

  // ----------------------------------------------------------
  // Import Pipeline
  // ----------------------------------------------------------

  const pipeline = new Pipeline({
    jobId: crypto.randomUUID(),
    source: "json",
    documents: [],
  });

  console.log("## Import Pipeline");
  console.log("----------------------");
  console.log("");

  const importerPipeline = new ImporterPipeline({
    source: "json",
  });

  const result = await importerPipeline.run();

  // ----------------------------------------------------------
  // Keep Pipeline Summary
  // ----------------------------------------------------------

  pipeline.setDocuments([]);

  console.log("");

  // ----------------------------------------------------------
  // Import Summary
  // ----------------------------------------------------------

  console.log("## Import Summary");
  console.log("----------------------");

  console.log(`Job ID     : ${result.jobId}`);
  console.log(`Source     : ${result.source}`);
  console.log(`Collected  : ${result.collected}`);
  console.log(`Normalized : ${result.normalized}`);
  console.log(`Written    : ${result.written}`);
  console.log(`Created    : ${result.created}`);
  console.log(`Updated    : ${result.updated}`);
  console.log(`Verified   : ${result.verified}`);

  // ----------------------------------------------------------
  // Import Run History
  // ----------------------------------------------------------

  console.log("");
  console.log("## Import Run History");
  console.log("---------------------");

  const reader = new ImportJobReader();

  const recentRuns = await reader.list(10);

  if (recentRuns.length === 0) {
    console.log("No import runs found.");
  } else {
    recentRuns.forEach((run, index) => {
      console.log("");
      console.log(`Run ${index + 1}`);
      console.log(`Job ID     : ${run.jobId}`);
      console.log(`Source     : ${run.source}`);
      console.log(`Status     : ${run.status}`);
      console.log(`Written    : ${run.written}`);
      console.log(`Verified   : ${run.verified}`);
    });
  }

  const runSummary = await reader.getSummary();

  console.log("");
  console.log("## Import Run Summary");
  console.log("---------------------");
  console.log(`Total     : ${runSummary.total}`);
  console.log(`Completed : ${runSummary.completed}`);
  console.log(`Failed    : ${runSummary.failed}`);

  console.log("");
  console.log("## Latest Import Run");
  console.log("--------------------");

  const latestRun = await reader.getLatest();

  if (!latestRun) {
    console.log("No import runs found.");
  } else {
    console.log(`Job ID     : ${latestRun.jobId}`);
    console.log(`Source     : ${latestRun.source}`);
    console.log(`Status     : ${latestRun.status}`);
    console.log(`Written    : ${latestRun.written}`);
    console.log(`Verified   : ${latestRun.verified}`);
  }

  // ----------------------------------------------------------
  // Ready
  // ----------------------------------------------------------

  console.log("");
  console.log("================================");
  console.log(" Importer Ready");
  console.log("================================");
  console.log("");

  console.log("Sprint 2.3 – Phase 3.14 completed.");
}

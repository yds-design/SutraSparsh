import process from "node:process";

import { validateEnvironment } from "./config/validator.js";
import { FirestoreService } from "./firestore/service.js";
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

    environmentValidation.errors.forEach(
      (error: string) => {
        console.error(`• ${error}`);
      },
    );

    console.error("");
    process.exit(1);
  }

  if (environmentValidation.warnings.length > 0) {
    console.log("Warnings");
    console.log("--------------------------------");

    environmentValidation.warnings.forEach(
      (warning: string) => {
        console.log(`⚠ ${warning}`);
      },
    );

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
    collections.forEach(
      (collection: string) => {
        console.log(`• ${collection}`);
      },
    );
  }

  console.log("");

  // ----------------------------------------------------------
  // Firestore Health Check
  // ----------------------------------------------------------

  console.log("Writing health document...");

  await firestore.writeHealthCheck();

  console.log(
    "✅ Health document written successfully.",
  );
  console.log("");

  // ----------------------------------------------------------
  // Import Pipeline
  // ----------------------------------------------------------

  const pipeline = new ImporterPipeline({
    source: "json",
  });

  const result = await pipeline.run();

  // ----------------------------------------------------------
  // Final Import Summary
  // ----------------------------------------------------------

  console.log("");
  console.log("================================");
  console.log(" Importer Ready");
  console.log("================================");
  console.log("");

  console.log("Import Summary");
  console.log("----------------------");
  console.log(`Job ID     : ${result.jobId}`);
  console.log(`Source     : ${result.source}`);
  console.log(`Collected  : ${result.collected}`);
  console.log(`Normalized : ${result.normalized}`);
  console.log(`Written    : ${result.written}`);
  console.log(`Created    : ${result.created}`);
  console.log(`Updated    : ${result.updated}`);
  console.log(`Verified   : ${result.verified}`);
  console.log("");

  console.log(
    "Sprint 2.3 – Phase 3.8 completed.",
  );
}
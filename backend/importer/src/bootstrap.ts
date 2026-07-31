import crypto from "node:crypto";
import process from "node:process";

import { CollectorFactory } from "./collector/index.js";
import { validateEnvironment } from "./config/validator.js";
import { FirestoreService } from "./firestore/service.js";
import { Pipeline } from "./shared/index.js";

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

  const validation = validateEnvironment();

  if (!validation.valid) {
    console.error("❌ Environment validation failed.");
    console.error("");

    validation.errors.forEach((error: string) => {
      console.error(`• ${error}`);
    });

    console.error("");
    process.exit(1);
  }

  if (validation.warnings.length > 0) {
    console.log("Warnings");
    console.log("--------------------------------");

    validation.warnings.forEach((warning: string) => {
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
  // List Firestore Collections
  // ----------------------------------------------------------

  console.log("Top-level collections");
  console.log("---------------------");

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
    source: "manual",
    documents: [],
  });

  const collector = CollectorFactory.create("manual");

  const documents = await collector.collect();

  pipeline.setDocuments(documents);

  pipeline.summary();

  // ----------------------------------------------------------
  // Ready
  // ----------------------------------------------------------

  console.log("================================");
  console.log(" Importer Ready");
  console.log("================================");
  console.log("");

  console.log("Sprint 2.3 – Phase 3.2 completed.");
}
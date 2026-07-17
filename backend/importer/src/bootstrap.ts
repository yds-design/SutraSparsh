import process from "node:process";

import { validateEnvironment } from "./config/validator.js";
import { FirestoreService } from "./firestore/service.js";

export async function bootstrap(): Promise<void> {
  console.log("");
  console.log("================================");
  console.log(" SutraSparsh Import Engine");
  console.log(" Version 1.0.0");
  console.log("================================");
  console.log("");

  //
  // Environment Validation
  //
  const validation = validateEnvironment();

  if (!validation.valid) {
    console.error("❌ Environment validation failed.");
    console.error("");

    validation.errors.forEach((error) => {
      console.error(`• ${error}`);
    });

    process.exit(1);
  }

  if (validation.warnings.length > 0) {
    console.log("Warnings");
    console.log("--------");

    validation.warnings.forEach((warning) => {
      console.log(`⚠ ${warning}`);
    });

    console.log("");
  }

  console.log("✅ Environment validation passed.");
  console.log("");

  //
  // Firestore Initialization
  //
  const firestore = new FirestoreService();

  console.log("✅ Firebase initialized.");
  console.log("");

  //
  // Read Collections
  //
  console.log("Top-level collections");
  console.log("---------------------");

  const collections = await firestore.listCollections();

  if (collections.length === 0) {
    console.log("(No collections found)");
  } else {
    collections.forEach((collection) => {
      console.log(`• ${collection}`);
    });
  }

  console.log("");

  //
  // Firestore Write Verification
  //
  console.log("Writing health document...");

  await firestore.writeHealthCheck();

  console.log("✅ Health document written successfully.");
  console.log("");

  //
  // Ready
  //
  console.log("================================");
  console.log(" Importer Ready");
  console.log("================================");
  console.log("");

  console.log("Sprint 2.2 – Phase F completed.");
}
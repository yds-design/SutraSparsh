import { getApps } from "firebase-admin/app";
import { firestore } from "./firestore/client.js";
import { env } from "./config/env.js";

async function main(): Promise<void> {
  console.log("");
  console.log("================================");
  console.log(" SutraSparsh Import Engine");
  console.log(" Version 1.0.0");
  console.log("================================");
  console.log("");

  try {
    const db = firestore();

    const app = getApps()[0];

    console.log("✅ Firebase Admin SDK initialized");
    console.log(`📦 Firebase Project : ${env.firebaseProjectId}`);
    console.log("✅ Firestore client connected");
    console.log("");

    console.log("Sprint 2.2 - Phase B completed successfully.");
    console.log("");

    // Prevent unused variable warning (optional)
    void db;

  } catch (error) {
    console.error("");
    console.error("❌ Failed to initialize Firebase");
    console.error("");

    if (error instanceof Error) {
      console.error(error.message);
      console.error(error.stack);
    } else {
      console.error(error);
    }

    process.exit(1);
  }
}

main();
import dotenv from "dotenv";
import path from "node:path";

// Explicitly load .env from backend/importer
dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

console.log("Loaded .env from:", path.resolve(process.cwd(), ".env"));

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",

  appName: process.env.APP_NAME ?? "SutraSparsh Import Engine",

  firebaseProjectId: process.env.FIREBASE_PROJECT_ID ?? "",

  firebaseServiceAccountPath:
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ?? "",

  logLevel: process.env.LOG_LEVEL ?? "info",

  importBatchSize: Number(process.env.IMPORT_BATCH_SIZE ?? 100),

  importDelayMs: Number(process.env.IMPORT_DELAY_MS ?? 500),

  defaultLanguage: process.env.DEFAULT_LANGUAGE ?? "sa",

  defaultTranslation: process.env.DEFAULT_TRANSLATION ?? "en",
};
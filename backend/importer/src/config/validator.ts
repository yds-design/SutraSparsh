import fs from "node:fs";
import path from "node:path";
import { env } from "./env.js";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateEnvironment(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // ----------------------------------------------------------
  // Required Environment Variables
  // ----------------------------------------------------------

  if (!env.firebaseProjectId.trim()) {
    errors.push("FIREBASE_PROJECT_ID is missing.");
  }

  if (!env.firebaseServiceAccountPath.trim()) {
    errors.push("FIREBASE_SERVICE_ACCOUNT_PATH is missing.");
  }

  // ----------------------------------------------------------
  // Service Account File
  // ----------------------------------------------------------

  const serviceAccountPath = path.resolve(
    process.cwd(),
    env.firebaseServiceAccountPath
  );

  if (!fs.existsSync(serviceAccountPath)) {
    errors.push(
      `Firebase service account not found:\n${serviceAccountPath}`
    );
  }

  // ----------------------------------------------------------
  // Batch Size
  // ----------------------------------------------------------

  if (env.importBatchSize <= 0) {
    errors.push("IMPORT_BATCH_SIZE must be greater than zero.");
  }

  if (env.importBatchSize > 1000) {
    warnings.push(
      "IMPORT_BATCH_SIZE is very high. Recommended value is below 500."
    );
  }

  // ----------------------------------------------------------
  // Import Delay
  // ----------------------------------------------------------

  if (env.importDelayMs < 0) {
    errors.push("IMPORT_DELAY_MS cannot be negative.");
  }

  // ----------------------------------------------------------
  // Log Level
  // ----------------------------------------------------------

  const allowedLogLevels = [
    "debug",
    "info",
    "warn",
    "error",
  ];

  if (!allowedLogLevels.includes(env.logLevel.toLowerCase())) {
    errors.push(
      `Invalid LOG_LEVEL "${env.logLevel}". Allowed values: ${allowedLogLevels.join(
        ", "
      )}`
    );
  }

  // ----------------------------------------------------------
  // Languages
  // ----------------------------------------------------------

  if (!env.defaultLanguage.trim()) {
    warnings.push("DEFAULT_LANGUAGE is empty.");
  }

  if (!env.defaultTranslation.trim()) {
    warnings.push("DEFAULT_TRANSLATION is empty.");
  }

  // ----------------------------------------------------------
  // NODE_ENV
  // ----------------------------------------------------------

  const allowedNodeEnvs = [
    "development",
    "test",
    "production",
  ];

  if (!allowedNodeEnvs.includes(env.nodeEnv.toLowerCase())) {
    warnings.push(
      `NODE_ENV "${env.nodeEnv}" is unusual.`
    );
  }

  // ----------------------------------------------------------

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
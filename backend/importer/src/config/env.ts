import path from "node:path";
import fs from "node:fs";

// Load .env if present
try {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match && match[1] && !process.env[match[1]]) {
        const value = (match[2] || "").trim().replace(/^["']|["']$/g, "");
        process.env[match[1]] = value;
      }
    }
  }
} catch {
  // Graceful fallback if filesystem access fails
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  appName: process.env.APP_NAME ?? "SutraSparsh Import Engine",
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID ?? "",
  firebaseServiceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH ?? "",
  logLevel: process.env.LOG_LEVEL ?? "info",
  importBatchSize: Number(process.env.IMPORT_BATCH_SIZE ?? 100),
  importDelayMs: Number(process.env.IMPORT_DELAY_MS ?? 500),
  defaultLanguage: process.env.DEFAULT_LANGUAGE ?? "sa",
  defaultTranslation: process.env.DEFAULT_TRANSLATION ?? "en",
};
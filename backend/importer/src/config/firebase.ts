import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

import { initializeApp, cert, getApps } from "firebase-admin/app";

export function initializeFirebase() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccountPath = path.resolve(
    process.cwd(),
    "config",
    "firebase-service-account.json"
  );

  if (!existsSync(serviceAccountPath)) {
    throw new Error(
      `Firebase service account not found:\n${serviceAccountPath}`
    );
  }

  const serviceAccount = JSON.parse(
    readFileSync(serviceAccountPath, "utf8")
  );

  return initializeApp({
    credential: cert(serviceAccount),
  });
}
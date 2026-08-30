import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

import { initializeApp, cert, getApps, type App } from "firebase-admin/app";

export function initializeFirebase(): App | null {
  try {
    if (getApps().length > 0 && getApps()[0]) {
      return getApps()[0];
    }

    const serviceAccountPath =
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
      path.resolve(
        process.cwd(),
        "backend",
        "importer",
        "config",
        "firebase-service-account.json"
      );

    if (!existsSync(serviceAccountPath)) {
      return null;
    }

    const serviceAccount = JSON.parse(
      readFileSync(serviceAccountPath, "utf8")
    );

    return initializeApp({
      credential: cert(serviceAccount),
    });
  } catch (err) {
    return null;
  }
}

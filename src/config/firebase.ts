import {
  readFileSync,
  existsSync,
} from "node:fs";

import path from "node:path";

import {
  cert,
  getApps,
  initializeApp,
  type App,
} from "firebase-admin/app";

const SERVICE_ACCOUNT_PATH =
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
  path.resolve(
    process.cwd(),
    "backend",
    "importer",
    "config",
    "firebase-service-account.json",
  );

export function initializeFirebase(): App | null {
  try {
    const existingApps = getApps();

    if (existingApps.length > 0 && existingApps[0]) {
      return existingApps[0];
    }

    if (process.env.FIREBASE_CONFIG) {
      try {
        const config = JSON.parse(process.env.FIREBASE_CONFIG);
        return initializeApp(config);
      } catch (e) {
        console.warn("Could not parse FIREBASE_CONFIG env variable:", e);
      }
    }

    if (!existsSync(SERVICE_ACCOUNT_PATH)) {
      console.warn(
        `Firebase service account not found at: ${SERVICE_ACCOUNT_PATH}. Operating in in-memory fallback mode.`,
      );
      return null;
    }

    const serviceAccount = JSON.parse(
      readFileSync(SERVICE_ACCOUNT_PATH, "utf8"),
    );

    return initializeApp({
      credential: cert(serviceAccount),
    });
  } catch (error) {
    console.warn("Firebase initialization warning (using in-memory store):", error);
    return null;
  }
}

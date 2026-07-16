import admin from "firebase-admin";
import fs from "node:fs";
import path from "node:path";

import { env } from "./env.js";
import { logger } from "./logger.js";

const serviceAccountPath = path.resolve(
  process.cwd(),
  env.firebaseServiceAccountPath
);

if (!fs.existsSync(serviceAccountPath)) {
  throw new Error(
    `Firebase service account not found: ${serviceAccountPath}`
  );
}

const serviceAccount = JSON.parse(
  fs.readFileSync(serviceAccountPath, "utf8")
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: env.firebaseProjectId,
  });

  logger.info("Firebase Admin initialized.");
}

export const firestore = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();
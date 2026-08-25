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
  path.resolve(
    process.cwd(),
    "backend",
    "importer",
    "config",
    "firebase-service-account.json",
  );

export function initializeFirebase(): App {
  const existingApps =
    getApps();

  if (existingApps.length > 0) {
    return existingApps[0];
  }

  if (
    !existsSync(
      SERVICE_ACCOUNT_PATH,
    )
  ) {
    throw new Error(
      `Firebase service account not found:\n${SERVICE_ACCOUNT_PATH}`,
    );
  }

  const serviceAccount =
    JSON.parse(
      readFileSync(
        SERVICE_ACCOUNT_PATH,
        "utf8",
      ),
    );

  return initializeApp({
    credential:
      cert(serviceAccount),
  });
}
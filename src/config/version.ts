/**
 * SutraSparsh Version & Build Metadata (M20.1.2 / M20.1.3)
 */

export interface VersionMetadata {
  version: string;
  name: string;
  environment: string;
  buildTime: string;
  commitHash: string;
  framework: string;
  nodeVersion: string;
  phaseStatus: string;
}

export const APP_VERSION_METADATA: VersionMetadata = {
  version: "1.0.0",
  name: "SutraSparsh",
  environment: process.env.NODE_ENV === "production" ? "production" : (process.env.APP_ENV || "development"),
  buildTime: new Date().toISOString(),
  commitHash: "1bed6d6",
  framework: "React 19 + Express 5 + Vite 8",
  nodeVersion: process.version || "v22",
  phaseStatus: "Phase 23 (All Phases 1–23 Certified; Phase 1 Lockdown Active)",
};

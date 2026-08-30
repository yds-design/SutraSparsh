/**
 * SutraSparsh Environment Configuration & Validation (Phase 13 / M20.1)
 */

export type EnvironmentTier = "local" | "development" | "staging" | "production";

export interface AppEnvironmentConfig {
  tier: EnvironmentTier;
  isProduction: boolean;
  isDevelopment: boolean;
  appName: string;
  appVersion: string;
  port: number;
  firebaseProjectId: string;
  hasServiceAccount: boolean;
  rateLimitMaxRequests: number;
  rateLimitWindowMs: number;
  logLevel: string;
  cacheTtlSeconds: number;
}

export function getEnvironmentConfig(): AppEnvironmentConfig {
  const nodeEnv = process.env.NODE_ENV || "development";
  const appEnv = (process.env.APP_ENV?.toLowerCase() || (nodeEnv === "production" ? "production" : "development")) as EnvironmentTier;

  const tier: EnvironmentTier = ["local", "development", "staging", "production"].includes(appEnv)
    ? appEnv
    : "development";

  return {
    tier,
    isProduction: tier === "production" || nodeEnv === "production",
    isDevelopment: tier === "development" || tier === "local",
    appName: process.env.APP_NAME || "SutraSparsh",
    appVersion: process.env.APP_VERSION || "1.0.0",
    port: Number(process.env.PORT) || 3000,
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID || "sutrasparsh-dev",
    hasServiceAccount: Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_PATH),
    rateLimitMaxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 120,
    rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
    logLevel: process.env.LOG_LEVEL || "info",
    cacheTtlSeconds: Number(process.env.CACHE_TTL_SECONDS) || 300,
  };
}

export const envConfig = getEnvironmentConfig();

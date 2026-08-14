import process from "node:process";

export interface ImporterRetryConfig {
  attempts: number;
  delayMs: number;
  backoffMultiplier: number;
}

export interface ImporterConfig {
  source: "json" | "manual";

  retry: ImporterRetryConfig;

  idempotency: {
    enabled: boolean;
  };
}

const MAX_RETRY_ATTEMPTS = 10;
const MAX_RETRY_DELAY_MS = 60_000;
const MAX_BACKOFF_MULTIPLIER = 10;

function parsePositiveInteger(
  value: string | undefined,
  fallback: number,
): number {
  if (value === undefined || value.trim() === "") {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(
      `Invalid positive integer configuration value "${value}".`,
    );
  }

  return parsed;
}

function parsePositiveNumber(
  value: string | undefined,
  fallback: number,
): number {
  if (value === undefined || value.trim() === "") {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(
      `Invalid positive number configuration value "${value}".`,
    );
  }

  return parsed;
}

function parseBoolean(
  value: string | undefined,
  fallback: boolean,
): boolean {
  if (value === undefined || value.trim() === "") {
    return fallback;
  }

  const normalized = value
    .trim()
    .toLowerCase();

  if (normalized === "true") {
    return true;
  }

  if (normalized === "false") {
    return false;
  }

  throw new Error(
    `Invalid boolean configuration value "${value}".`,
  );
}

export function loadImporterConfig(): ImporterConfig {
  const source =
    process.env.IMPORTER_SOURCE === "manual"
      ? "manual"
      : "json";

  const config: ImporterConfig = {
    source,

    retry: {
      attempts: parsePositiveInteger(
        process.env.IMPORTER_RETRY_ATTEMPTS,
        3,
      ),

      delayMs: parsePositiveNumber(
        process.env.IMPORTER_RETRY_DELAY_MS,
        250,
      ),

      backoffMultiplier:
        parsePositiveNumber(
          process.env
            .IMPORTER_RETRY_BACKOFF_MULTIPLIER,
          2,
        ),
    },

    idempotency: {
      enabled: parseBoolean(
        process.env
          .IMPORTER_IDEMPOTENCY_ENABLED,
        true,
      ),
    },
  };

  validateImporterConfig(config);

  return config;
}

export function validateImporterConfig(
  config: ImporterConfig,
): void {
  /*
   * Retry attempts
   */
  if (
    config.retry.attempts < 1 ||
    !Number.isInteger(
      config.retry.attempts,
    )
  ) {
    throw new Error(
      "Importer retry attempts must be a positive integer.",
    );
  }

  if (
    config.retry.attempts >
    MAX_RETRY_ATTEMPTS
  ) {
    throw new Error(
      `Importer retry attempts must not exceed ${MAX_RETRY_ATTEMPTS}.`,
    );
  }

  /*
   * Retry delay
   */
  if (
    config.retry.delayMs <= 0 ||
    !Number.isFinite(
      config.retry.delayMs,
    )
  ) {
    throw new Error(
      "Importer retry delay must be greater than zero.",
    );
  }

  if (
    config.retry.delayMs >
    MAX_RETRY_DELAY_MS
  ) {
    throw new Error(
      `Importer retry delay must not exceed ${MAX_RETRY_DELAY_MS}ms.`,
    );
  }

  /*
   * Retry backoff multiplier
   */
  if (
    config.retry.backoffMultiplier <= 0 ||
    !Number.isFinite(
      config.retry.backoffMultiplier,
    )
  ) {
    throw new Error(
      "Importer retry backoff multiplier must be greater than zero.",
    );
  }

  if (
    config.retry.backoffMultiplier >
    MAX_BACKOFF_MULTIPLIER
  ) {
    throw new Error(
      `Importer retry backoff multiplier must not exceed ${MAX_BACKOFF_MULTIPLIER}.`,
    );
  }
}

export const importerConfig =
  loadImporterConfig();
import { describe, expect, it } from "vitest";

import {
  loadImporterConfig,
  validateImporterConfig,
  type ImporterConfig,
} from "./importer.config.js";

describe("Importer Configuration", () => {
  describe("loadImporterConfig", () => {
    it("loads the default configuration", () => {
      const originalEnvironment = {
        source: process.env.IMPORTER_SOURCE,
        attempts:
          process.env.IMPORTER_RETRY_ATTEMPTS,
        delay:
          process.env.IMPORTER_RETRY_DELAY_MS,
        backoff:
          process.env
            .IMPORTER_RETRY_BACKOFF_MULTIPLIER,
        idempotency:
          process.env
            .IMPORTER_IDEMPOTENCY_ENABLED,
      };

      delete process.env.IMPORTER_SOURCE;
      delete process.env.IMPORTER_RETRY_ATTEMPTS;
      delete process.env.IMPORTER_RETRY_DELAY_MS;
      delete process.env.IMPORTER_RETRY_BACKOFF_MULTIPLIER;
      delete process.env.IMPORTER_IDEMPOTENCY_ENABLED;

      try {
        const config =
          loadImporterConfig();

        expect(config).toEqual({
          source: "json",

          retry: {
            attempts: 3,
            delayMs: 250,
            backoffMultiplier: 2,
          },

          idempotency: {
            enabled: true,
          },
        });
      } finally {
        restoreEnvironmentVariable(
          "IMPORTER_SOURCE",
          originalEnvironment.source,
        );

        restoreEnvironmentVariable(
          "IMPORTER_RETRY_ATTEMPTS",
          originalEnvironment.attempts,
        );

        restoreEnvironmentVariable(
          "IMPORTER_RETRY_DELAY_MS",
          originalEnvironment.delay,
        );

        restoreEnvironmentVariable(
          "IMPORTER_RETRY_BACKOFF_MULTIPLIER",
          originalEnvironment.backoff,
        );

        restoreEnvironmentVariable(
          "IMPORTER_IDEMPOTENCY_ENABLED",
          originalEnvironment.idempotency,
        );
      }
    });

    it("loads a manual source configuration", () => {
      const previous =
        process.env.IMPORTER_SOURCE;

      process.env.IMPORTER_SOURCE =
        "manual";

      try {
        const config =
          loadImporterConfig();

        expect(config.source).toBe(
          "manual",
        );
      } finally {
        restoreEnvironmentVariable(
          "IMPORTER_SOURCE",
          previous,
        );
      }
    });

    it("loads valid retry configuration", () => {
      const previous = {
        attempts:
          process.env.IMPORTER_RETRY_ATTEMPTS,
        delay:
          process.env.IMPORTER_RETRY_DELAY_MS,
        backoff:
          process.env
            .IMPORTER_RETRY_BACKOFF_MULTIPLIER,
      };

      process.env.IMPORTER_RETRY_ATTEMPTS =
        "5";

      process.env.IMPORTER_RETRY_DELAY_MS =
        "500";

      process.env.IMPORTER_RETRY_BACKOFF_MULTIPLIER =
        "3";

      try {
        const config =
          loadImporterConfig();

        expect(config.retry).toEqual({
          attempts: 5,
          delayMs: 500,
          backoffMultiplier: 3,
        });
      } finally {
        restoreEnvironmentVariable(
          "IMPORTER_RETRY_ATTEMPTS",
          previous.attempts,
        );

        restoreEnvironmentVariable(
          "IMPORTER_RETRY_DELAY_MS",
          previous.delay,
        );

        restoreEnvironmentVariable(
          "IMPORTER_RETRY_BACKOFF_MULTIPLIER",
          previous.backoff,
        );
      }
    });

    it("loads idempotency as disabled", () => {
      const previous =
        process.env
          .IMPORTER_IDEMPOTENCY_ENABLED;

      process.env.IMPORTER_IDEMPOTENCY_ENABLED =
        "false";

      try {
        const config =
          loadImporterConfig();

        expect(
          config.idempotency.enabled,
        ).toBe(false);
      } finally {
        restoreEnvironmentVariable(
          "IMPORTER_IDEMPOTENCY_ENABLED",
          previous,
        );
      }
    });

    it("rejects an invalid boolean value", () => {
      const previous =
        process.env
          .IMPORTER_IDEMPOTENCY_ENABLED;

      process.env.IMPORTER_IDEMPOTENCY_ENABLED =
        "yes";

      try {
        expect(() =>
          loadImporterConfig(),
        ).toThrow(
          'Invalid boolean configuration value "yes".',
        );
      } finally {
        restoreEnvironmentVariable(
          "IMPORTER_IDEMPOTENCY_ENABLED",
          previous,
        );
      }
    });
  });

  describe("validateImporterConfig", () => {
    it("accepts a valid configuration", () => {
      const config: ImporterConfig = {
        source: "json",

        retry: {
          attempts: 3,
          delayMs: 250,
          backoffMultiplier: 2,
        },

        idempotency: {
          enabled: true,
        },
      };

      expect(() =>
        validateImporterConfig(config),
      ).not.toThrow();
    });

    it("rejects zero retry attempts", () => {
      const config =
        createConfig({
          attempts: 0,
        });

      expect(() =>
        validateImporterConfig(config),
      ).toThrow(
        "Importer retry attempts must be a positive integer.",
      );
    });

    it("rejects non-integer retry attempts", () => {
      const config =
        createConfig({
          attempts: 2.5,
        });

      expect(() =>
        validateImporterConfig(config),
      ).toThrow(
        "Importer retry attempts must be a positive integer.",
      );
    });

    it("rejects retry attempts above the production limit", () => {
      const config =
        createConfig({
          attempts: 11,
        });

      expect(() =>
        validateImporterConfig(config),
      ).toThrow(
        "Importer retry attempts must not exceed 10.",
      );
    });

    it("rejects retry delay above the production limit", () => {
      const config =
        createConfig({
          delayMs: 60_001,
        });

      expect(() =>
        validateImporterConfig(config),
      ).toThrow(
        "Importer retry delay must not exceed 60000ms.",
      );
    });

    it("rejects a non-positive retry delay", () => {
      const config =
        createConfig({
          delayMs: 0,
        });

      expect(() =>
        validateImporterConfig(config),
      ).toThrow(
        "Importer retry delay must be greater than zero.",
      );
    });

    it("rejects backoff multiplier above the production limit", () => {
      const config =
        createConfig({
          backoffMultiplier: 11,
        });

      expect(() =>
        validateImporterConfig(config),
      ).toThrow(
        "Importer retry backoff multiplier must not exceed 10.",
      );
    });

    it("rejects a non-positive backoff multiplier", () => {
      const config =
        createConfig({
          backoffMultiplier: 0,
        });

      expect(() =>
        validateImporterConfig(config),
      ).toThrow(
        "Importer retry backoff multiplier must be greater than zero.",
      );
    });
  });
});

function createConfig(
  overrides: Partial<
    ImporterConfig["retry"]
  > = {},
): ImporterConfig {
  return {
    source: "json",

    retry: {
      attempts: 3,
      delayMs: 250,
      backoffMultiplier: 2,
      ...overrides,
    },

    idempotency: {
      enabled: true,
    },
  };
}

function restoreEnvironmentVariable(
  name: string,
  value: string | undefined,
): void {
  if (value === undefined) {
    delete process.env[name];
    return;
  }

  process.env[name] = value;
}
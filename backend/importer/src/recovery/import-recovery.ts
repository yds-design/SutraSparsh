import {
  importerLogger,
} from "../observability/importer.logger.js";

export type ImportRecoveryStatus =
  | "recovered"
  | "failed"
  | "skipped";

export interface ImportRecoveryResult {
  status: ImportRecoveryStatus;
  jobId: string;
  attempts: number;
  recovered: boolean;
  error?: string;
}

export interface ImportRecoveryOptions {
  jobId: string;
  maxAttempts?: number;
  retryDelayMs?: number;
}

export interface ImportRecoveryOperation {
  (): Promise<void>;
}

export async function recoverImport(
  operation: ImportRecoveryOperation,
  options: ImportRecoveryOptions,
): Promise<ImportRecoveryResult> {
  const {
    jobId,
    maxAttempts = 3,
    retryDelayMs = 500,
  } = options;

  const startedAt =
    Date.now();

  if (maxAttempts <= 0) {
    importerLogger.warn(
      "Import recovery skipped because maxAttempts is not positive.",
      {
        jobId,
        phase: "recovery",
        attempt: 0,
        retries: 0,
        status: "skipped",
      },
    );

    return {
      status: "skipped",
      jobId,
      attempts: 0,
      recovered: false,
    };
  }

  let attempts = 0;
  let lastError: unknown;

  while (
    attempts < maxAttempts
  ) {
    attempts += 1;

    importerLogger.info(
      "Import recovery attempt started.",
      {
        jobId,
        phase: "recovery",
        attempt: attempts,
        retries: Math.max(
          attempts - 1,
          0,
        ),
      },
    );

    try {
      await operation();

      const durationMs =
        Date.now() -
        startedAt;

      importerLogger.info(
        "Import recovery completed successfully.",
        {
          jobId,
          phase: "recovery",
          attempt: attempts,
          retries: Math.max(
            attempts - 1,
            0,
          ),
          durationMs,
          status: "recovered",
        },
      );

      return {
        status: "recovered",
        jobId,
        attempts,
        recovered: true,
      };
    } catch (error: unknown) {
      lastError = error;

      const message =
        error instanceof Error
          ? error.message
          : String(error);

      if (
        attempts >= maxAttempts
      ) {
        importerLogger.errorWithException(
          "Import recovery exhausted all attempts.",
          error,
          {
            jobId,
            phase: "recovery",
            attempt: attempts,
            retries: Math.max(
              attempts - 1,
              0,
            ),
            durationMs:
              Date.now() -
              startedAt,
            status: "failed",
          },
        );

        return {
          status: "failed",
          jobId,
          attempts,
          recovered: false,
          error: message,
        };
      }

      importerLogger.warn(
        "Import recovery attempt failed; retrying.",
        {
          jobId,
          phase: "recovery",
          attempt: attempts,
          retries: attempts,
          error: message,
          errorType:
            error instanceof Error
              ? error.name
              : typeof error,
          retryDelayMs,
        },
      );

      await delay(
        retryDelayMs,
      );
    }
  }

  const fallbackError =
    lastError instanceof Error
      ? lastError.message
      : String(lastError);

  importerLogger.error(
    "Import recovery terminated unexpectedly.",
    {
      jobId,
      phase: "recovery",
      attempt: attempts,
      retries: Math.max(
        attempts - 1,
        0,
      ),
      durationMs:
        Date.now() -
        startedAt,
      status: "failed",
      error: fallbackError,
    },
  );

  return {
    status: "failed",
    jobId,
    attempts,
    recovered: false,
    error: fallbackError,
  };
}

function delay(
  delayMs: number,
): Promise<void> {
  if (delayMs <= 0) {
    return Promise.resolve();
  }

  return new Promise(
    (resolve) => {
      setTimeout(
        resolve,
        delayMs,
      );
    },
  );
}
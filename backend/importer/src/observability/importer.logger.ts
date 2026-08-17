export type ImportLogLevel =
  | "debug"
  | "info"
  | "warn"
  | "error";

export interface ImportLogContext {
  jobId?: string;
  source?: string;
  phase?: string;

  attempt?: number;
  retries?: number;

  durationMs?: number;

  collected?: number;
  normalized?: number;

  written?: number;
  created?: number;
  updated?: number;
  unchanged?: number;
  verified?: number;

  status?: string;

  error?: string;
  errorType?: string;

  [key: string]: unknown;
}

export interface ImportLogEntry {
  timestamp: string;
  level: ImportLogLevel;
  message: string;
  context?: ImportLogContext;
}

function normalizeError(
  error: unknown,
): Pick<
  ImportLogContext,
  "error" | "errorType"
> {
  if (error instanceof Error) {
    return {
      error: error.message,
      errorType: error.name,
    };
  }

  return {
    error: String(error),
    errorType: typeof error,
  };
}

function writeLog(
  level: ImportLogLevel,
  message: string,
  context?: ImportLogContext,
): void {
  const entry: ImportLogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(context &&
      Object.keys(context).length > 0
      ? {
          context,
        }
      : {}),
  };

  const serialized =
    JSON.stringify(entry);

  switch (level) {
    case "error":
      console.error(serialized);
      break;

    case "warn":
      console.warn(serialized);
      break;

    case "debug":
      console.debug(serialized);
      break;

    case "info":
    default:
      console.log(serialized);
      break;
  }
}

export const importerLogger = {
  debug(
    message: string,
    context?: ImportLogContext,
  ): void {
    writeLog(
      "debug",
      message,
      context,
    );
  },

  info(
    message: string,
    context?: ImportLogContext,
  ): void {
    writeLog(
      "info",
      message,
      context,
    );
  },

  warn(
    message: string,
    context?: ImportLogContext,
  ): void {
    writeLog(
      "warn",
      message,
      context,
    );
  },

  error(
    message: string,
    context?: ImportLogContext,
  ): void {
    writeLog(
      "error",
      message,
      context,
    );
  },

  errorWithException(
    message: string,
    error: unknown,
    context?: ImportLogContext,
  ): void {
    writeLog(
      "error",
      message,
      {
        ...context,
        ...normalizeError(error),
      },
    );
  },
};
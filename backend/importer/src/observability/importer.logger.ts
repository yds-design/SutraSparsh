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
  durationMs?: number;
  collected?: number;
  normalized?: number;
  written?: number;
  created?: number;
  updated?: number;
  unchanged?: number;
  verified?: number;
  retries?: number;
  error?: string;
}

export interface ImportLogger {
  debug(
    message: string,
    context?: ImportLogContext,
  ): void;

  info(
    message: string,
    context?: ImportLogContext,
  ): void;

  warn(
    message: string,
    context?: ImportLogContext,
  ): void;

  error(
    message: string,
    context?: ImportLogContext,
  ): void;
}

function writeLog(
  level: ImportLogLevel,
  message: string,
  context?: ImportLogContext,
): void {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(context ?? {}),
  };

  const output = JSON.stringify(payload);

  if (level === "error") {
    console.error(output);
    return;
  }

  if (level === "warn") {
    console.warn(output);
    return;
  }

  console.log(output);
}

export const importerLogger: ImportLogger = {
  debug(message, context) {
    writeLog("debug", message, context);
  },

  info(message, context) {
    writeLog("info", message, context);
  },

  warn(message, context) {
    writeLog("warn", message, context);
  },

  error(message, context) {
    writeLog("error", message, context);
  },
};
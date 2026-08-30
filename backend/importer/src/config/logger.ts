export interface Logger {
  debug: (message: string, meta?: unknown) => void;
  info: (message: string, meta?: unknown) => void;
  warn: (message: string, meta?: unknown) => void;
  error: (message: string, meta?: unknown) => void;
}

export const logger: Logger = {
  debug: (msg: string, meta?: unknown) => {
    if (process.env.LOG_LEVEL === "debug") {
      console.debug(`[${new Date().toISOString()}] DEBUG : ${msg}`, meta || "");
    }
  },
  info: (msg: string, meta?: unknown) => {
    console.log(`[${new Date().toISOString()}] INFO : ${msg}`, meta || "");
  },
  warn: (msg: string, meta?: unknown) => {
    console.warn(`[${new Date().toISOString()}] WARN : ${msg}`, meta || "");
  },
  error: (msg: string, meta?: unknown) => {
    console.error(`[${new Date().toISOString()}] ERROR : ${msg}`, meta || "");
  },
};
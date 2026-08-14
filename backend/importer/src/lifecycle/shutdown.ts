import process from "node:process";

export type ShutdownSignal =
  | "SIGINT"
  | "SIGTERM";

export interface ShutdownControllerOptions {
  timeoutMs?: number;
  exit?: (
    code: number,
  ) => void;
}

export interface ShutdownController {
  shutdown(
    signal: ShutdownSignal,
  ): Promise<void>;

  register(): void;

  unregister(): void;

  isShuttingDown(): boolean;
}

function validateTimeout(
  timeoutMs: number,
): void {
  if (
    !Number.isFinite(timeoutMs) ||
    timeoutMs < 0
  ) {
    throw new Error(
      "Shutdown timeout must be a non-negative finite number.",
    );
  }
}

export function createShutdownController(
  options: ShutdownControllerOptions = {},
): ShutdownController {
  const timeoutMs =
    options.timeoutMs ?? 10_000;

  const exit =
    options.exit ??
    ((code: number) => {
      process.exit(code);
    });

  let shuttingDown = false;
  let handlersRegistered = false;

  let shutdownPromise:
    | Promise<void>
    | undefined;

  const handleShutdown = (
    signal: ShutdownSignal,
  ): void => {
    void controller.shutdown(signal);
  };

  const sigintHandler = (): void => {
    handleShutdown("SIGINT");
  };

  const sigtermHandler = (): void => {
    handleShutdown("SIGTERM");
  };

  const controller: ShutdownController = {
    shutdown(
      signal: ShutdownSignal,
    ): Promise<void> {
      /*
       * Important:
       *
       * Return the exact same Promise instance when
       * shutdown is already running.
       *
       * Do not make this method `async`, because an
       * async method can wrap the returned Promise
       * and break Promise identity checks.
       */
      if (shutdownPromise) {
        return shutdownPromise;
      }

      shuttingDown = true;

      shutdownPromise = (async () => {
        try {
          validateTimeout(timeoutMs);

          if (timeoutMs > 0) {
            await new Promise<void>(
              (resolve) => {
                const timer =
                  setTimeout(
                    resolve,
                    timeoutMs,
                  );

                /*
                 * Do not keep the Node.js process
                 * alive solely because of the
                 * shutdown timeout.
                 */
                if (
                  typeof timer ===
                    "object" &&
                  timer !== null &&
                  "unref" in timer &&
                  typeof (
                    timer as {
                      unref?: () => void;
                    }
                  ).unref === "function"
                ) {
                  (
                    timer as {
                      unref: () => void;
                    }
                  ).unref();
                }
              },
            );
          }

          exit(0);
        } catch (error) {
          /*
           * Shutdown configuration errors and
           * shutdown failures should terminate
           * with a non-zero exit code.
           */
          console.error(
            `Shutdown failed during ${signal}.`,
          );

          if (error instanceof Error) {
            console.error(
              error.message,
            );
          } else {
            console.error(
              String(error),
            );
          }

          exit(1);
        }
      })();

      return shutdownPromise;
    },

    register(): void {
      if (handlersRegistered) {
        return;
      }

      process.once(
        "SIGINT",
        sigintHandler,
      );

      process.once(
        "SIGTERM",
        sigtermHandler,
      );

      handlersRegistered = true;
    },

    unregister(): void {
      if (!handlersRegistered) {
        return;
      }

      process.removeListener(
        "SIGINT",
        sigintHandler,
      );

      process.removeListener(
        "SIGTERM",
        sigtermHandler,
      );

      handlersRegistered = false;
    },

    isShuttingDown(): boolean {
      return shuttingDown;
    },
  };

  return controller;
}

export function registerShutdownHandlers(
  options: ShutdownControllerOptions = {},
): ShutdownController {
  const controller =
    createShutdownController(
      options,
    );

  controller.register();

  return controller;
}
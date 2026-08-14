import process from "node:process";

import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  createShutdownController,
  registerShutdownHandlers,
} from "./shutdown.js";

describe(
  "ShutdownController",
  () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it(
      "starts in a non-shutting-down state",
      () => {
        const controller =
          createShutdownController({
            timeoutMs: 0,
          });

        expect(
          controller.isShuttingDown(),
        ).toBe(false);
      },
    );

    it(
      "marks the importer as shutting down",
      async () => {
        const exit =
          vi.fn();

        const controller =
          createShutdownController({
            timeoutMs: 0,
            exit,
          });

        const shutdownPromise =
          controller.shutdown(
            "SIGTERM",
          );

        expect(
          controller.isShuttingDown(),
        ).toBe(true);

        await shutdownPromise;

        expect(
          exit,
        ).toHaveBeenCalledWith(0);
      },
    );

    it(
      "exits successfully after SIGINT",
      async () => {
        const exit =
          vi.fn();

        const controller =
          createShutdownController({
            timeoutMs: 0,
            exit,
          });

        await controller.shutdown(
          "SIGINT",
        );

        expect(
          exit,
        ).toHaveBeenCalledTimes(1);

        expect(
          exit,
        ).toHaveBeenCalledWith(0);
      },
    );

    it(
      "does not execute shutdown twice concurrently",
      async () => {
        const exit =
          vi.fn();

        const controller =
          createShutdownController({
            timeoutMs: 0,
            exit,
          });

        const first =
          controller.shutdown(
            "SIGTERM",
          );

        const second =
          controller.shutdown(
            "SIGTERM",
          );

        expect(
          first,
        ).toBe(second);

        await Promise.all([
          first,
          second,
        ]);

        expect(
          exit,
        ).toHaveBeenCalledTimes(1);
      },
    );

    it(
      "registers SIGINT and SIGTERM handlers",
      () => {
        const onceSpy =
          vi.spyOn(
            process,
            "once",
          );

        const controller =
          createShutdownController({
            timeoutMs: 0,
            exit: vi.fn(),
          });

        controller.register();

        expect(
          onceSpy,
        ).toHaveBeenCalledWith(
          "SIGINT",
          expect.any(Function),
        );

        expect(
          onceSpy,
        ).toHaveBeenCalledWith(
          "SIGTERM",
          expect.any(Function),
        );

        controller.unregister();
      },
    );

    it(
      "does not register handlers more than once",
      () => {
        const onceSpy =
          vi.spyOn(
            process,
            "once",
          );

        const controller =
          createShutdownController({
            timeoutMs: 0,
            exit: vi.fn(),
          });

        controller.register();
        controller.register();

        expect(
          onceSpy,
        ).toHaveBeenCalledTimes(2);

        controller.unregister();
      },
    );

    it(
      "unregisters signal handlers",
      () => {
        const removeListenerSpy =
          vi.spyOn(
            process,
            "removeListener",
          );

        const controller =
          createShutdownController({
            timeoutMs: 0,
            exit: vi.fn(),
          });

        controller.register();
        controller.unregister();

        expect(
          removeListenerSpy,
        ).toHaveBeenCalledWith(
          "SIGINT",
          expect.any(Function),
        );

        expect(
          removeListenerSpy,
        ).toHaveBeenCalledWith(
          "SIGTERM",
          expect.any(Function),
        );
      },
    );

    it(
      "does not unregister handlers twice",
      () => {
        const removeListenerSpy =
          vi.spyOn(
            process,
            "removeListener",
          );

        const controller =
          createShutdownController({
            timeoutMs: 0,
            exit: vi.fn(),
          });

        controller.unregister();

        expect(
          removeListenerSpy,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      "registerShutdownHandlers creates and registers a controller",
      () => {
        const onceSpy =
          vi.spyOn(
            process,
            "once",
          );

        const controller =
          registerShutdownHandlers({
            timeoutMs: 0,
            exit: vi.fn(),
          });

        expect(
          controller.isShuttingDown(),
        ).toBe(false);

        expect(
          onceSpy,
        ).toHaveBeenCalledWith(
          "SIGINT",
          expect.any(Function),
        );

        expect(
          onceSpy,
        ).toHaveBeenCalledWith(
          "SIGTERM",
          expect.any(Function),
        );

        controller.unregister();
      },
    );

    it(
      "fails shutdown when timeout configuration is invalid",
      async () => {
        const exit =
          vi.fn();

        const controller =
          createShutdownController({
            timeoutMs: -1,
            exit,
          });

        await controller.shutdown(
          "SIGTERM",
        );

        expect(
          exit,
        ).toHaveBeenCalledWith(1);
      },
    );
  },
);
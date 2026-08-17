import { beforeEach, describe, expect, it, vi } from "vitest";

import { importerLogger } from "../../src/observability/importer.logger.js";

describe("importerLogger", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("writes info messages as structured JSON", () => {
    const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

    importerLogger.info("Import started.", {
      jobId: "job-001",
      source: "json",
      phase: "collection",
    });

    expect(consoleLog).toHaveBeenCalledTimes(1);

    const output = consoleLog.mock.calls[0]?.[0];

    expect(typeof output).toBe("string");

    const payload = JSON.parse(output as string);

    expect(payload).toEqual(
      expect.objectContaining({
        level: "info",
        message: "Import started.",
        context: expect.objectContaining({
          jobId: "job-001",
          phase: "collection",
          source: "json",
        }),
      }),
    );

    expect(payload.timestamp).toEqual(expect.any(String));
  });

  it("writes warning messages to console.warn", () => {
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

    importerLogger.warn("Import retry scheduled.", {
      jobId: "job-002",
      phase: "firestore-write",
      attempt: 2,
      retries: 1,
    });

    expect(consoleWarn).toHaveBeenCalledTimes(1);

    expect(consoleLog).not.toHaveBeenCalled();

    const output = consoleWarn.mock.calls[0]?.[0];

    const payload = JSON.parse(output as string);

    expect(payload).toEqual(
      expect.objectContaining({
        level: "warn",
        message: "Import retry scheduled.",
        context: expect.objectContaining({
          jobId: "job-002",
          phase: "firestore-write",
          retries: 1,
        }),
      }),
    );
  });

  it("writes error messages to console.error", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

    importerLogger.error("Import failed.", {
      jobId: "job-003",
      phase: "firestore-write",
      error: "Firestore unavailable",
    });

    expect(consoleError).toHaveBeenCalledTimes(1);

    expect(consoleWarn).not.toHaveBeenCalled();
    expect(consoleLog).not.toHaveBeenCalled();

    const output = consoleError.mock.calls[0]?.[0];

    const payload = JSON.parse(output as string);

    expect(payload).toEqual(
      expect.objectContaining({
        level: "error",
        message: "Import failed.",
        context: expect.objectContaining({
          jobId: "job-003",
          phase: "firestore-write",
          error: "Firestore unavailable",
        }),
      }),
    );
  });

  it("supports messages without context", () => {
    const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

    importerLogger.info("Importer ready.");

    expect(consoleLog).toHaveBeenCalledTimes(1);

    const output = consoleLog.mock.calls[0]?.[0];

    const payload = JSON.parse(output as string);

    expect(payload).toEqual(
      expect.objectContaining({
        level: "info",
        message: "Importer ready.",
      }),
    );

    expect(payload.timestamp).toEqual(expect.any(String));
  });

  it("preserves numeric observability fields", () => {
    const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

    importerLogger.info("Import completed.", {
      jobId: "job-004",
      collected: 10,
      normalized: 9,
      written: 8,
      created: 5,
      updated: 2,
      unchanged: 1,
      verified: 8,
      retries: 2,
      durationMs: 1250,
    });

    const output = consoleLog.mock.calls[0]?.[0];

    const payload = JSON.parse(output as string);

    expect(payload).toEqual(
      expect.objectContaining({
        level: "info",
        message: "Import completed.",
        context: expect.objectContaining({
          collected: 10,
          normalized: 9,
          written: 8,
          created: 5,
          updated: 2,
          unchanged: 1,
          verified: 8,
          retries: 2,
          durationMs: 1250,
        }),
      }),
    );
  });

  it("produces valid JSON for every log level", () => {
    const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    importerLogger.info("info");
    importerLogger.warn("warn");
    importerLogger.error("error");

    expect(consoleLog).toHaveBeenCalledTimes(1);

    expect(consoleWarn).toHaveBeenCalledTimes(1);

    expect(consoleError).toHaveBeenCalledTimes(1);

    expect(() =>
      JSON.parse(consoleLog.mock.calls[0]?.[0] as string),
    ).not.toThrow();

    expect(() =>
      JSON.parse(consoleWarn.mock.calls[0]?.[0] as string),
    ).not.toThrow();

    expect(() =>
      JSON.parse(consoleError.mock.calls[0]?.[0] as string),
    ).not.toThrow();
  });
});

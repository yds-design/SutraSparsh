import { describe, expect, it, vi } from "vitest";

import { ImportJobReader } from "../../src/firestore/import-job.reader.js";

describe("ImportJobReader", () => {
  it("returns null when the job does not exist", async () => {
    const get = vi.fn().mockResolvedValue({
      exists: false,
    });

    const reader = Object.create(
      ImportJobReader.prototype,
    ) as ImportJobReader;

    Object.defineProperty(reader, "db", {
      value: {
        collection: vi.fn().mockReturnValue({
          doc: vi.fn().mockReturnValue({
            collection: vi.fn().mockReturnValue({
              doc: vi.fn().mockReturnValue({
                get,
              }),
            }),
          }),
        }),
      },
    });

    const result = await reader.get("missing-job");

    expect(result).toBeNull();
    expect(get).toHaveBeenCalledOnce();
  });

  it("returns the audit document when it exists", async () => {
    const audit = {
      jobId: "test-job",
      source: "json",
      status: "completed",
      startedAt: new Date(),
      completedAt: new Date(),
      collected: 2,
      normalized: 2,
      written: 2,
      created: 0,
      updated: 2,
      verified: 2,
      errors: [],
    };

    const get = vi.fn().mockResolvedValue({
      exists: true,
      data: () => audit,
    });

    const reader = Object.create(
      ImportJobReader.prototype,
    ) as ImportJobReader;

    Object.defineProperty(reader, "db", {
      value: {
        collection: vi.fn().mockReturnValue({
          doc: vi.fn().mockReturnValue({
            collection: vi.fn().mockReturnValue({
              doc: vi.fn().mockReturnValue({
                get,
              }),
            }),
          }),
        }),
      },
    });

    const result = await reader.get("test-job");

    expect(result).toEqual(audit);
    expect(get).toHaveBeenCalledOnce();
  });
});
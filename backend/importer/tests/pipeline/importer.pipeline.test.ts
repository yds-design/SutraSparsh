import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const mockStart = vi.fn();
const mockComplete = vi.fn();
const mockFail = vi.fn();

const mockCollect = vi.fn();

const mockNormalize = vi.fn();

const mockValidate = vi.fn();

const mockWrite = vi.fn();

const mockGet = vi.fn();

vi.mock("../../src/firestore/index.js", () => ({
  ImportJobWriter: class {
    start = mockStart;
    complete = mockComplete;
    fail = mockFail;
  },

  ImportJobReader: class {
    get = mockGet;
  },
}));

vi.mock("../../src/collector/index.js", () => ({
  CollectorFactory: {
    create: vi.fn(() => ({
      collect: mockCollect,
    })),
  },
}));

vi.mock("../../src/normalizer/index.js", () => ({
  ContentNormalizer: class {
    normalize = mockNormalize;
  },
}));

vi.mock("../../src/validator/index.js", () => ({
  ContentValidator: class {
    validate = mockValidate;
  },
}));

vi.mock("../../src/firestore/content.writer.js", () => ({
  ContentWriter: class {
    write = mockWrite;
  },
}));

vi.mock("../../src/shared/index.js", () => ({
  Pipeline: class {
    summary = vi.fn();
  },
}));

import { ImporterPipeline } from "../../src/pipeline/importer.pipeline.js";

function createDocument(id = "content-001") {
  return {
    id,
    title: "Test title",
    content: "Test content",
  };
}

function completedAudit(jobId: string) {
  return {
    jobId,
    status: "completed",
    source: "json",
    written: 1,
    verified: 1,
  };
}

describe("ImporterPipeline", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockStart.mockResolvedValue(undefined);
    mockComplete.mockResolvedValue(undefined);
    mockFail.mockResolvedValue(undefined);

    mockCollect.mockResolvedValue([
      createDocument(),
    ]);

    mockNormalize.mockReturnValue([
      createDocument(),
    ]);

    mockValidate.mockReturnValue({
      valid: true,
      errors: [],
      warnings: [],
    });

    mockWrite.mockResolvedValue({
      written: 1,
      created: 1,
      updated: 0,
      unchanged: 0,
      verified: 1,
    });

    mockGet.mockImplementation(
      async (jobId: string) =>
        completedAudit(jobId),
    );
  });

  it("starts and completes a successful import", async () => {
    const pipeline =
      new ImporterPipeline({
        source: "json",
      });

    const result =
      await pipeline.run();

    expect(result.source).toBe("json");
    expect(result.collected).toBe(1);
    expect(result.normalized).toBe(1);
    expect(result.written).toBe(1);
    expect(result.created).toBe(1);
    expect(result.updated).toBe(0);
    expect(result.unchanged).toBe(0);
    expect(result.verified).toBe(1);

    expect(mockStart).toHaveBeenCalledTimes(
      1,
    );

    expect(mockComplete).toHaveBeenCalledTimes(
      1,
    );

    expect(mockFail).not.toHaveBeenCalled();

    expect(mockGet).toHaveBeenCalledTimes(
      1,
    );
  });

  it("records a failed audit when collection fails", async () => {
    const error = new Error(
      "Collector failed",
    );

    mockCollect.mockRejectedValueOnce(error);

    const pipeline =
      new ImporterPipeline({
        source: "json",
      });

    await expect(
      pipeline.run(),
    ).rejects.toThrow(
      "Collector failed",
    );

    expect(mockStart).toHaveBeenCalledTimes(
      1,
    );

    expect(mockComplete).not.toHaveBeenCalled();

    expect(mockFail).toHaveBeenCalledTimes(
      1,
    );

    expect(mockFail).toHaveBeenCalledWith(
      expect.any(String),
      "json",
      expect.any(Date),
      error,
    );
  });

  it("records a failed audit when validation fails", async () => {
    const errorMessage =
      "Content validation failed.";

    mockValidate.mockReturnValueOnce({
      valid: false,
      errors: ["Invalid content"],
      warnings: [],
    });

    const pipeline =
      new ImporterPipeline({
        source: "json",
      });

    await expect(
      pipeline.run(),
    ).rejects.toThrow(errorMessage);

    expect(mockComplete).not.toHaveBeenCalled();

    expect(mockFail).toHaveBeenCalledTimes(
      1,
    );

    expect(mockWrite).not.toHaveBeenCalled();
  });

  it("records a failed audit when Firestore writing fails", async () => {
    const error = new Error(
      "Firestore write failed",
    );

    mockWrite.mockRejectedValueOnce(error);

    const pipeline =
      new ImporterPipeline({
        source: "json",
      });

    await expect(
      pipeline.run(),
    ).rejects.toThrow(
      "Firestore write failed",
    );

    expect(mockComplete).not.toHaveBeenCalled();

    expect(mockFail).toHaveBeenCalledTimes(
      1,
    );
  });

  it("does not hide an audit-write failure when recording the original failure", async () => {
    const originalError = new Error(
      "Firestore write failed",
    );

    mockWrite.mockRejectedValueOnce(
      originalError,
    );

    mockFail.mockRejectedValueOnce(
      new Error("Audit write failed"),
    );

    const pipeline =
      new ImporterPipeline({
        source: "json",
      });

    await expect(
      pipeline.run(),
    ).rejects.toThrow(
      "Firestore write failed",
    );

    expect(mockFail).toHaveBeenCalledTimes(
      1,
    );
  });

  it("preserves retry exhaustion as the original Firestore error", async () => {
    const error = new Error(
      "Firestore content batch write failed.",
    );

    mockWrite.mockRejectedValueOnce(error);

    const pipeline =
      new ImporterPipeline({
        source: "json",
      });

    await expect(
      pipeline.run(),
    ).rejects.toThrow(
      "Firestore content batch write failed.",
    );

    expect(mockComplete).not.toHaveBeenCalled();

    expect(mockFail).toHaveBeenCalledTimes(
      1,
    );
  });
});
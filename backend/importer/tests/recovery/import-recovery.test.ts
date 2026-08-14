import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const mockGet = vi.fn();
const mockStart = vi.fn();
const mockComplete = vi.fn();
const mockFail = vi.fn();

const mockCollect = vi.fn();
const mockNormalize = vi.fn();
const mockValidate = vi.fn();
const mockWrite = vi.fn();

vi.mock(
  "../../src/firestore/index.js",
  () => ({
    ImportJobReader: class {
      get = mockGet;
    },

    ImportJobWriter: class {
      start = mockStart;
      complete = mockComplete;
      fail = mockFail;
      resume = vi.fn();
    },
  }),
);

vi.mock(
  "../../src/collector/index.js",
  () => ({
    CollectorFactory: {
      create: vi.fn(() => ({
        collect: mockCollect,
      })),
    },
  }),
);

vi.mock(
  "../../src/normalizer/index.js",
  () => ({
    ContentNormalizer: class {
      normalize = mockNormalize;
    },
  }),
);

vi.mock(
  "../../src/validator/index.js",
  () => ({
    ContentValidator: class {
      validate = mockValidate;
    },
  }),
);

vi.mock(
  "../../src/firestore/content.writer.js",
  () => ({
    ContentWriter: class {
      write = mockWrite;
    },
  }),
);

vi.mock(
  "../../src/shared/index.js",
  () => ({
    Pipeline: class {
      summary = vi.fn();
    },
  }),
);

import { ImporterPipeline } from "../../src/pipeline/importer.pipeline.js";

const jobId =
  "11111111-1111-4111-8111-111111111111";

function createDocument() {
  return {
    id: "content-001",
    title: "Test title",
    content: "Test content",
    metadata: {
      language: "sanskrit",
      source: "json",
    },
  };
}

function failedAudit() {
  return {
    jobId,
    status: "failed",
    source: "json",
    written: 0,
    verified: 0,
  };
}

function completedAudit() {
  return {
    jobId,
    status: "completed",
    source: "json",
    written: 1,
    verified: 1,
  };
}

describe("Importer Recovery", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockStart.mockResolvedValue(
      undefined,
    );

    mockComplete.mockResolvedValue(
      undefined,
    );

    mockFail.mockResolvedValue(
      undefined,
    );

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
  });

  it(
    "resumes a failed import using the same job ID",
    async () => {
      mockGet.mockResolvedValueOnce(
        failedAudit(),
      );

      const pipeline =
        new ImporterPipeline({
          source: "json",
        });

      const result =
        await pipeline.resume(jobId);

      expect(
        result.jobId,
      ).toBe(jobId);

      expect(
        result.source,
      ).toBe("json");

      expect(
        result.written,
      ).toBe(1);

      expect(
        result.verified,
      ).toBe(1);

      expect(
        mockComplete,
      ).toHaveBeenCalledTimes(1);

      const completeArgument =
        mockComplete.mock.calls[0]?.[0];

      expect(
        completeArgument.jobId,
      ).toBe(jobId);
    },
  );

  it(
    "does not create a new job ID during resume",
    async () => {
      mockGet.mockResolvedValueOnce(
        failedAudit(),
      );

      const pipeline =
        new ImporterPipeline({
          source: "json",
        });

      const result =
        await pipeline.resume(jobId);

      expect(
        result.jobId,
      ).toBe(jobId);

      expect(
        mockStart,
      ).not.toHaveBeenCalled();
    },
  );

  it(
    "rejects resume when the audit record does not exist",
    async () => {
      /*
       * ImportJobReader.get() returns null
       * when the document does not exist.
       */
      mockGet.mockResolvedValueOnce(
        null,
      );

      const pipeline =
        new ImporterPipeline({
          source: "json",
        });

      await expect(
        pipeline.resume(jobId),
      ).rejects.toThrow(
        `Import audit record not found for job ${jobId}`,
      );

      expect(
        mockCollect,
      ).not.toHaveBeenCalled();

      expect(
        mockWrite,
      ).not.toHaveBeenCalled();
    },
  );

  it(
    "rejects resume for a completed job",
    async () => {
      mockGet.mockResolvedValueOnce(
        completedAudit(),
      );

      const pipeline =
        new ImporterPipeline({
          source: "json",
        });

      await expect(
        pipeline.resume(jobId),
      ).rejects.toThrow(
        `Import job "${jobId}" is already completed.`,
      );

      expect(
        mockCollect,
      ).not.toHaveBeenCalled();

      expect(
        mockWrite,
      ).not.toHaveBeenCalled();
    },
  );

  it(
    "rejects resume for an unsupported audit status",
    async () => {
      mockGet.mockResolvedValueOnce({
        jobId,
        status: "running",
        source: "json",
        written: 0,
        verified: 0,
      });

      const pipeline =
        new ImporterPipeline({
          source: "json",
        });

      await expect(
        pipeline.resume(jobId),
      ).rejects.toThrow(
        `Import job "${jobId}" cannot be resumed from status "running".`,
      );

      expect(
        mockCollect,
      ).not.toHaveBeenCalled();

      expect(
        mockWrite,
      ).not.toHaveBeenCalled();
    },
  );

  it(
    "records a failure when resumed execution fails",
    async () => {
      mockGet.mockResolvedValueOnce(
        failedAudit(),
      );

      const error = new Error(
        "Firestore content batch write failed.",
      );

      mockWrite.mockRejectedValueOnce(
        error,
      );

      const pipeline =
        new ImporterPipeline({
          source: "json",
        });

      await expect(
        pipeline.resume(jobId),
      ).rejects.toThrow(
        "Firestore content batch write failed.",
      );

      expect(
        mockComplete,
      ).not.toHaveBeenCalled();

      expect(
        mockFail,
      ).toHaveBeenCalledTimes(1);

      expect(
        mockFail.mock.calls[0]?.[0],
      ).toBe(jobId);
    },
  );

  it(
    "does not retry the entire import after ContentWriter rejects",
    async () => {
      mockGet.mockResolvedValueOnce(
        failedAudit(),
      );

      const error = new Error(
        "temporary Firestore failure",
      );

      mockWrite.mockRejectedValueOnce(
        error,
      );

      const pipeline =
        new ImporterPipeline({
          source: "json",
        });

      await expect(
        pipeline.resume(jobId),
      ).rejects.toThrow(
        "temporary Firestore failure",
      );

      expect(
        mockComplete,
      ).not.toHaveBeenCalled();

      expect(
        mockFail,
      ).toHaveBeenCalledTimes(1);

      /*
       * ContentWriter owns Firestore retry behavior.
       * The pipeline must not silently retry the
       * entire import after ContentWriter rejects.
       */
      expect(
        mockWrite,
      ).toHaveBeenCalledTimes(1);
    },
  );
});
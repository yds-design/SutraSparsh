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
const mockResume = vi.fn();
const mockMarkFailed = vi.fn();

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
      resume = mockResume;
      markFailed = mockMarkFailed;
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

vi.mock(
  "../../src/firestore/service.js",
  () => ({
    FirestoreService: class {
      getFirestore = vi.fn(
        () => ({}),
      );
    },
  }),
);

vi.mock(
  "../../src/observability/importer.execution-summary.js",
  () => ({
    createImportExecutionSummary:
      vi.fn(() => ({
        status: "completed",
        durationMs: 0,
        collected: 1,
        normalized: 1,
        written: 1,
        created: 1,
        updated: 0,
        unchanged: 0,
        verified: 1,
        retries: 0,
      })),
  }),
);

vi.mock(
  "../../src/observability/importer.logger.js",
  () => ({
    importerLogger: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
  }),
);

import {
  ImporterPipeline,
} from "../../src/pipeline/importer.pipeline.js";

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

function failedAudit(
  overrides: Record<
    string,
    unknown
  > = {},
) {
  return {
    jobId,
    status: "failed",
    source: "json",

    startedAt: new Date(
      "2026-01-01T00:00:00.000Z",
    ),

    written: 0,
    verified: 0,

    errors: [
      "Original failure",
    ],

    originalErrors: [
      "Original failure",
    ],

    resumeAttempts: 0,

    ...overrides,
  };
}

function completedAudit() {
  return {
    jobId,
    status: "completed",
    source: "json",
    written: 1,
    verified: 1,
    errors: [],
    originalErrors: [],
    resumeAttempts: 0,
  };
}

describe(
  "Importer Recovery",
  () => {
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

      mockResume.mockResolvedValue(
        undefined,
      );

      mockMarkFailed.mockResolvedValue(
        undefined,
      );

      mockCollect.mockResolvedValue(
        [createDocument()],
      );

      mockNormalize.mockReturnValue(
        [createDocument()],
      );

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
          await pipeline.resume(
            jobId,
          );

        expect(
          result.jobId,
        ).toBe(jobId);

        expect(
          mockResume,
        ).toHaveBeenCalledTimes(
          1,
        );

        expect(
          mockResume.mock.calls[0]?.[0],
        ).toBe(jobId);

        expect(
          mockComplete,
        ).toHaveBeenCalledTimes(
          1,
        );

        expect(
          mockComplete.mock.calls[0]?.[0]
            .jobId,
        ).toBe(jobId);

        expect(
          mockStart,
        ).not.toHaveBeenCalled();
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
          await pipeline.resume(
            jobId,
          );

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
        mockGet.mockResolvedValueOnce(
          null,
        );

        const pipeline =
          new ImporterPipeline({
            source: "json",
          });

        await expect(
          pipeline.resume(
            jobId,
          ),
        ).rejects.toThrow(
          `Import audit record not found for job ${jobId}`,
        );

        expect(
          mockCollect,
        ).not.toHaveBeenCalled();

        expect(
          mockWrite,
        ).not.toHaveBeenCalled();

        expect(
          mockResume,
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
          pipeline.resume(
            jobId,
          ),
        ).rejects.toThrow(
          `Import job "${jobId}" is already completed.`,
        );

        expect(
          mockCollect,
        ).not.toHaveBeenCalled();

        expect(
          mockWrite,
        ).not.toHaveBeenCalled();

        expect(
          mockResume,
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
          pipeline.resume(
            jobId,
          ),
        ).rejects.toThrow(
          `Import job "${jobId}" cannot be resumed from status "running".`,
        );

        expect(
          mockCollect,
        ).not.toHaveBeenCalled();

        expect(
          mockWrite,
        ).not.toHaveBeenCalled();

        expect(
          mockResume,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      "records a failure when resumed execution fails",
      async () => {
        mockGet.mockResolvedValueOnce(
          failedAudit(),
        );

        const error =
          new Error(
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
          pipeline.resume(
            jobId,
          ),
        ).rejects.toThrow(
          "Firestore content batch write failed.",
        );

        expect(
          mockComplete,
        ).not.toHaveBeenCalled();

        expect(
          mockMarkFailed,
        ).toHaveBeenCalledTimes(
          1,
        );

        expect(
          mockMarkFailed.mock.calls[0]?.[0],
        ).toBe(jobId);

        expect(
          mockMarkFailed.mock.calls[0]?.[1],
        ).toBe(error);
      },
    );

    it(
      "does not retry the entire import after ContentWriter rejects",
      async () => {
        mockGet.mockResolvedValueOnce(
          failedAudit(),
        );

        const error =
          new Error(
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
          pipeline.resume(
            jobId,
          ),
        ).rejects.toThrow(
          "temporary Firestore failure",
        );

        expect(
          mockWrite,
        ).toHaveBeenCalledTimes(
          1,
        );

        expect(
          mockComplete,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      "preserves the original failure when recovery fails again",
      async () => {
        mockGet.mockResolvedValueOnce(
          failedAudit({
            errors: [
              "Original failure",
            ],
            originalErrors: [
              "Original failure",
            ],
            resumeAttempts: 2,
          }),
        );

        const recoveryError =
          new Error(
            "Recovery attempt failed",
          );

        mockWrite.mockRejectedValueOnce(
          recoveryError,
        );

        const pipeline =
          new ImporterPipeline({
            source: "json",
          });

        await expect(
          pipeline.resume(
            jobId,
          ),
        ).rejects.toThrow(
          "Recovery attempt failed",
        );

        expect(
          mockMarkFailed,
        ).toHaveBeenCalledWith(
          jobId,
          recoveryError,
        );
      },
    );

    it(
      "increments recovery attempt state instead of creating a new job",
      async () => {
        mockGet.mockResolvedValueOnce(
          failedAudit({
            resumeAttempts: 2,
          }),
        );

        const pipeline =
          new ImporterPipeline({
            source: "json",
          });

        await pipeline.resume(
          jobId,
        );

        expect(
          mockResume,
        ).toHaveBeenCalledWith(
          jobId,
          "json",
          expect.any(Date),
        );

        expect(
          mockStart,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      "writes audit statistics exactly from actual content write results",
      async () => {
        /*
         * Simulate the actual result returned by
         * ContentWriter for a mixed import:
         *
         * written   = 2
         * created   = 1
         * updated   = 1
         * unchanged = 1
         * verified  = 3
         */
        const actualWriteResult = {
          written: 2,
          created: 1,
          updated: 1,
          unchanged: 1,
          verified: 3,
        };

        mockWrite.mockResolvedValueOnce(
          actualWriteResult,
        );

        const pipeline =
          new ImporterPipeline({
            source: "json",
          });

        const result =
          await pipeline.run();

        /*
         * First verify that the pipeline itself
         * exposes the actual ContentWriter
         * statistics.
         */
        expect(
          result.written,
        ).toBe(
          actualWriteResult.written,
        );

        expect(
          result.created,
        ).toBe(
          actualWriteResult.created,
        );

        expect(
          result.updated,
        ).toBe(
          actualWriteResult.updated,
        );

        expect(
          result.unchanged,
        ).toBe(
          actualWriteResult.unchanged,
        );

        expect(
          result.verified,
        ).toBe(
          actualWriteResult.verified,
        );

        /*
         * The audit completion must receive
         * exactly the same values.
         */
        expect(
          mockComplete,
        ).toHaveBeenCalledTimes(
          1,
        );

        const auditedResult =
          mockComplete.mock.calls[0]?.[0];

        expect(
          auditedResult,
        ).toBeDefined();

        expect(
          auditedResult.written,
        ).toBe(
          actualWriteResult.written,
        );

        expect(
          auditedResult.created,
        ).toBe(
          actualWriteResult.created,
        );

        expect(
          auditedResult.updated,
        ).toBe(
          actualWriteResult.updated,
        );

        expect(
          auditedResult.unchanged,
        ).toBe(
          actualWriteResult.unchanged,
        );

        expect(
          auditedResult.verified,
        ).toBe(
          actualWriteResult.verified,
        );
      },
    );
  },
);
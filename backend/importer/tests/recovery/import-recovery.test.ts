import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ImportJobAudit } from "../../src/firestore/import-job.writer.js";
import { ImportRecovery } from "../../src/recovery/import-recovery.js";
const mockGet = vi.fn();
const mockReader = { get: mockGet };
const createJob = (status: ImportJobAudit["status"]): ImportJobAudit => ({
  jobId: "job-001",
  source: "json",
  status,
  startedAt: new Date(),
  completedAt: status === "completed" ? new Date() : undefined,
  collected: 2,
  normalized: 2,
  written: 2,
  created: 1,
  updated: 1,
  verified: 2,
  errors: status === "failed" ? ["Firestore write failed"] : [],
});
describe("ImportRecovery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("allows recovery of a failed job", async () => {
    mockGet.mockResolvedValueOnce(createJob("failed"));
    const recovery = new ImportRecovery(mockReader as never);
    const result = await recovery.inspect("job-001");
    expect(result.recoverable).toBe(true);
    expect(result.job?.status).toBe("failed");
    expect(result.reason).toBeUndefined();
  });
  it("allows recovery of a running job", async () => {
    mockGet.mockResolvedValueOnce(createJob("running"));
    const recovery = new ImportRecovery(mockReader as never);
    const result = await recovery.inspect("job-001");
    expect(result.recoverable).toBe(true);
    expect(result.job?.status).toBe("running");
  });
  it("rejects a completed job", async () => {
    mockGet.mockResolvedValueOnce(createJob("completed"));
    const recovery = new ImportRecovery(mockReader as never);
    const result = await recovery.inspect("job-001");
    expect(result.recoverable).toBe(false);
    expect(result.job?.status).toBe("completed");
    expect(result.reason).toContain('status "completed"');
  });
  it("handles a missing job", async () => {
    mockGet.mockResolvedValueOnce(null);
    const recovery = new ImportRecovery(mockReader as never);
    const result = await recovery.inspect("missing-job");
    expect(result.recoverable).toBe(false);
    expect(result.job).toBeNull();
    expect(result.reason).toContain('Import job "missing-job" was not found.');
  });
  it("returns a recoverable job from requireRecoverable", async () => {
    mockGet.mockResolvedValueOnce(createJob("failed"));
    const recovery = new ImportRecovery(mockReader as never);
    const job = await recovery.requireRecoverable("job-001");
    expect(job.jobId).toBe("job-001");
    expect(job.status).toBe("failed");
  });
  it("throws when requireRecoverable receives a completed job", async () => {
    mockGet.mockResolvedValueOnce(createJob("completed"));
    const recovery = new ImportRecovery(mockReader as never);
    await expect(recovery.requireRecoverable("job-001")).rejects.toThrow(
      'status "completed"',
    );
  });
  it("throws when requireRecoverable receives a missing job", async () => {
    mockGet.mockResolvedValueOnce(null);
    const recovery = new ImportRecovery(mockReader as never);
    await expect(recovery.requireRecoverable("missing-job")).rejects.toThrow(
      'Import job "missing-job" was not found.',
    );
  });
});

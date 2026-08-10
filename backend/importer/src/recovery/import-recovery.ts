import type { ImportJobAudit } from "../firestore/import-job.writer.js";
import { ImportJobReader } from "../firestore/import-job.reader.js";
export type RecoverableImportStatus = "running" | "failed";
export interface ImportRecoveryResult {
  recoverable: boolean;
  job: ImportJobAudit | null;
  reason?: string;
}
export class ImportRecovery {
  private readonly reader: ImportJobReader;
  constructor(reader = new ImportJobReader()) {
    this.reader = reader;
  }
  async inspect(jobId: string): Promise<ImportRecoveryResult> {
    const job = await this.reader.get(jobId);
    if (!job) {
      return {
        recoverable: false,
        job: null,
        reason: `Import job "${jobId}" was not found.`,
      };
    }
    if (job.status !== "running" && job.status !== "failed") {
      return {
        recoverable: false,
        job,
        reason:
          `Import job "${jobId}" has status "${job.status}" ` +
          "and does not require recovery.",
      };
    }
    return { recoverable: true, job };
  }
  async requireRecoverable(jobId: string): Promise<ImportJobAudit> {
    const result = await this.inspect(jobId);
    if (!result.recoverable || !result.job) {
      throw new Error(
        result.reason ?? `Import job "${jobId}" cannot be recovered.`,
      );
    }
    return result.job;
  }
}

import type { ImportJobAudit } from "./import-job.writer.js";
import { firestore } from "./client.js";

export class ImportJobReader {
  private readonly db = firestore();

  /**
   * Read a single import job by job ID.
   */
  async get(
    jobId: string,
  ): Promise<ImportJobAudit | null> {
    const ref = this.db
      .collection("system")
      .doc("importJobs")
      .collection("runs")
      .doc(jobId);

    const snapshot = await ref.get();

    if (!snapshot.exists) {
      return null;
    }

    return snapshot.data() as ImportJobAudit;
  }

  /**
   * Read recent import jobs.
   *
   * Newest jobs are returned first.
   */
  async list(
    limit = 10,
  ): Promise<ImportJobAudit[]> {
    if (limit <= 0) {
      return [];
    }

    const snapshot = await this.db
      .collection("system")
      .doc("importJobs")
      .collection("runs")
      .orderBy("startedAt", "desc")
      .limit(limit)
      .get();

    return snapshot.docs.map(
      (doc) => doc.data() as ImportJobAudit,
    );
  }
}
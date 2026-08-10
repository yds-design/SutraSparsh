import type { ImportJobAudit } from "./import-job.writer.js";
import { firestore } from "./client.js";

export class ImportJobReader {
  private readonly db = firestore();

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
}
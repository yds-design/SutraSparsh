import type {
  ImportJobAudit,
  ImportJobStatus,
} from "./import-job.writer.js";

import { firestore } from "./client.js";

export class ImportJobReader {
  private readonly db = firestore();

  private getJobRef(jobId: string) {
    return this.db
      .collection("system")
      .doc("importJobs")
      .collection("runs")
      .doc(jobId);
  }

  /**
   * Read a single import job by job ID.
   */
  async get(
    jobId: string,
  ): Promise<ImportJobAudit | null> {
    const snapshot =
      await this.getJobRef(jobId).get();

    if (!snapshot.exists) {
      return null;
    }

    return snapshot.data() as ImportJobAudit;
  }

  /**
   * Read recent import jobs.
   */
  async list(
    limit = 10,
  ): Promise<ImportJobAudit[]> {
    if (limit <= 0) {
      return [];
    }

    const snapshot =
      await this.db
        .collection("system")
        .doc("importJobs")
        .collection("runs")
        .orderBy(
          "startedAt",
          "desc",
        )
        .limit(limit)
        .get();

    return snapshot.docs.map(
      (doc) =>
        doc.data() as ImportJobAudit,
    );
  }

  async getSummary(): Promise<{
    total: number;
    completed: number;
    failed: number;
  }> {
    const snapshot =
      await this.db
        .collection("system")
        .doc("importJobs")
        .collection("runs")
        .get();

    let completed = 0;
    let failed = 0;

    snapshot.docs.forEach(
      (doc) => {
        const data =
          doc.data() as ImportJobAudit;

        if (
          data.status ===
          "completed"
        ) {
          completed++;
        }

        if (
          data.status ===
          "failed"
        ) {
          failed++;
        }
      },
    );

    return {
      total: snapshot.size,
      completed,
      failed,
    };
  }

  async listByStatus(
    status: ImportJobStatus,
    limit = 10,
  ): Promise<ImportJobAudit[]> {
    if (limit <= 0) {
      return [];
    }

    const snapshot =
      await this.db
        .collection("system")
        .doc("importJobs")
        .collection("runs")
        .where(
          "status",
          "==",
          status,
        )
        .orderBy(
          "startedAt",
          "desc",
        )
        .limit(limit)
        .get();

    return snapshot.docs.map(
      (doc) =>
        doc.data() as ImportJobAudit,
    );
  }

  async listBySource(
    source: ImportJobAudit["source"],
    limit = 10,
  ): Promise<ImportJobAudit[]> {
    if (limit <= 0) {
      return [];
    }

    const snapshot =
      await this.db
        .collection("system")
        .doc("importJobs")
        .collection("runs")
        .where(
          "source",
          "==",
          source,
        )
        .orderBy(
          "startedAt",
          "desc",
        )
        .limit(limit)
        .get();

    return snapshot.docs.map(
      (doc) =>
        doc.data() as ImportJobAudit,
    );
  }

  async getLatest(): Promise<ImportJobAudit | null> {
    const snapshot =
      await this.db
        .collection("system")
        .doc("importJobs")
        .collection("runs")
        .orderBy(
          "startedAt",
          "desc",
        )
        .limit(1)
        .get();

    const firstDocument =
      snapshot.docs[0];

    if (!firstDocument) {
      return null;
    }

    return firstDocument.data() as ImportJobAudit;
  }

  async getLatestBySource(
    source: ImportJobAudit["source"],
  ): Promise<ImportJobAudit | null> {
    const snapshot =
      await this.db
        .collection("system")
        .doc("importJobs")
        .collection("runs")
        .where(
          "source",
          "==",
          source,
        )
        .orderBy(
          "startedAt",
          "desc",
        )
        .limit(1)
        .get();

    const firstDocument =
      snapshot.docs[0];

    if (!firstDocument) {
      return null;
    }

    return firstDocument.data() as ImportJobAudit;
  }
}
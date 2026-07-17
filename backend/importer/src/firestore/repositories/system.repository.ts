import { FieldValue } from "firebase-admin/firestore";
import { BaseRepository } from "../base.repository.js";

export class SystemRepository extends BaseRepository {

  async writeHealthCheck() {
    await this.collection("system")
      .doc("importer")
      .set(
        {
          status: "healthy",
          importerVersion: "1.0.0",
          nodeVersion: process.version,
          environment: process.env.NODE_ENV ?? "development",
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
  }

}
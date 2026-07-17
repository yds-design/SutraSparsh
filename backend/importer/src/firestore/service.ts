import { FieldValue } from "firebase-admin/firestore";
import { firestore } from "./client.js";

export class FirestoreService {
  private readonly db = firestore();

  public getDb() {
    return this.db;
  }

  public async listCollections(): Promise<string[]> {
    const collections = await this.db.listCollections();
    return collections.map((collection) => collection.id);
  }

  public async getDocument(
    collection: string,
    documentId: string
  ): Promise<FirebaseFirestore.DocumentData | null> {
    const snapshot = await this.db
      .collection(collection)
      .doc(documentId)
      .get();

    return snapshot.exists ? (snapshot.data() ?? null) : null;
  }

  /**
   * Verify Firestore write access
   */
  public async writeHealthCheck(): Promise<void> {
    await this.db
      .collection("system")
      .doc("importer")
      .set(
        {
          status: "healthy",
          importerVersion: "1.0.0",
          nodeVersion: process.version,
          environment: process.env.NODE_ENV ?? "development",
          startedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
  }
}
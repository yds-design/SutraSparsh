import { FieldValue } from "firebase-admin/firestore";

import type { Firestore } from "firebase-admin/firestore";

import { firestore } from "./client.js";

export class FirestoreService {
  private readonly db: Firestore;

  constructor() {
    this.db = firestore();
  }

  /**
   * Return the underlying Firestore instance.
   *
   * This is the primary accessor used by services such as
   * ContentWriter that need direct access to Firestore APIs
   * including collections, document references, batches and
   * transactions.
   */
  public getFirestore(): Firestore {
    return this.db;
  }

  /**
   * Backwards-compatible alias.
   *
   * Existing repositories/services may already use getDb().
   */
  public getDb(): Firestore {
    return this.db;
  }

  /**
   * List all top-level Firestore collections.
   */
  public async listCollections(): Promise<string[]> {
    const collections =
      await this.db.listCollections();

    return collections.map(
      (collection) => collection.id,
    );
  }

  /**
   * Read a single Firestore document.
   *
   * Returns null when the document does not exist.
   */
  public async getDocument(
    collection: string,
    documentId: string,
  ): Promise<
    FirebaseFirestore.DocumentData | null
  > {
    const snapshot =
      await this.db
        .collection(collection)
        .doc(documentId)
        .get();

    return snapshot.exists
      ? snapshot.data() ?? null
      : null;
  }

  /**
   * Verify Firestore write access.
   *
   * This writes a small health document under:
   *
   * system/importer
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
          environment:
            process.env.NODE_ENV ??
            "development",
          startedAt:
            FieldValue.serverTimestamp(),
          updatedAt:
            FieldValue.serverTimestamp(),
        },
        {
          merge: true,
        },
      );
  }
}
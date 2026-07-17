import { firestore } from "./client.js";

export class FirestoreService {
  private readonly db = firestore();

  /**
   * Return Firestore instance
   */
  public getDb() {
    return this.db;
  }

  /**
   * List all top-level collections
   */
  public async listCollections(): Promise<string[]> {
    const collections = await this.db.listCollections();
    return collections.map((collection) => collection.id);
  }

  /**
   * Read a document
   */
  public async getDocument(
    collection: string,
    documentId: string
  ): Promise<FirebaseFirestore.DocumentData | null> {
    const snapshot = await this.db
      .collection(collection)
      .doc(documentId)
      .get();

    if (!snapshot.exists) {
      return null;
    }

    return snapshot.data() ?? null;
  }
}
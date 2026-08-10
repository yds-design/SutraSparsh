import type { ContentDocument } from "../types/index.js";
import { firestore } from "./client.js";

export class ContentWriter {
  private readonly db = firestore();

  async write(documents: ContentDocument[]): Promise<number> {
    if (documents.length === 0) {
      return 0;
    }

    const batch = this.db.batch();

    for (const document of documents) {
      const ref = this.db
        .collection("content")
        .doc(document.id);

      batch.set(ref, {
        ...document,
        updatedAt: new Date(),
      });
    }

    await batch.commit();

    return documents.length;
  }
}
import type { ContentDocument } from "../types/index.js";
import { firestore } from "./client.js";

export interface ContentWriteResult {
  written: number;
  created: number;
  updated: number;
  verified: number;
}

export class ContentWriter {
  private readonly db = firestore();

  async write(
    documents: ContentDocument[],
  ): Promise<ContentWriteResult> {
    if (documents.length === 0) {
      return {
        written: 0,
        created: 0,
        updated: 0,
        verified: 0,
      };
    }

    const batch = this.db.batch();

    let created = 0;
    let updated = 0;

    for (const document of documents) {
      const ref = this.db
        .collection("content")
        .doc(document.id);

      const existing = await ref.get();

      if (existing.exists) {
        updated++;
      } else {
        created++;
      }

      batch.set(
        ref,
        {
          ...document,
          updatedAt: new Date(),
        },
        {
          merge: true,
        },
      );
    }

    await batch.commit();

    let verified = 0;

    for (const document of documents) {
      const ref = this.db
        .collection("content")
        .doc(document.id);

      const snapshot = await ref.get();

      if (!snapshot.exists) {
        throw new Error(
          `Firestore verification failed for document "${document.id}".`,
        );
      }

      verified++;
    }

    return {
      written: documents.length,
      created,
      updated,
      verified,
    };
  }
}
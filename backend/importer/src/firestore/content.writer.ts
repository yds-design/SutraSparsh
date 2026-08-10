import type { ContentDocument } from "../types/index.js";
import { retry } from "../shared/retry.js";
import { firestore } from "./client.js";

export interface ContentWriteResult {
  written: number;
  created: number;
  updated: number;
  verified: number;
}

export class ContentWriter {
  private readonly db = firestore();
  async write(documents: ContentDocument[]): Promise<ContentWriteResult> {
    if (documents.length === 0) {
      return { written: 0, created: 0, updated: 0, verified: 0 };
    }
    const batch = this.db.batch();

    let created = 0;
    let updated = 0;
    // ------------------------------------------------------
    // // Determine created /
    // updated documents
    // // ------------------------------------------------------
    for (const document of documents) {
      const ref = this.db.collection("content").doc(document.id);
      const existing = await retry(() => ref.get(), {
        attempts: 3,
        delayMs: 250,
        backoffMultiplier: 2,
        onRetry: (_error, attempt, delayMs) => {
          console.warn(`⚠ Content read retry ${attempt} in ${delayMs}ms...`);
        },
      });

      if (existing.exists) {
        updated++;
      } else {
        created++;
      }
      batch.set(ref, { ...document, updatedAt: new Date() }, { merge: true });
    }
    // ------------------------------------------------------
    // // Firestore Write
    // // ------------------------------------------------------
    await retry(() => batch.commit(), {
      attempts: 3,
      delayMs: 250,
      backoffMultiplier: 2,
      onRetry: (_error, attempt, delayMs) => {
        console.warn(`⚠ Content write retry ${attempt} in ${delayMs}ms...`);
      },
    });
    // ------------------------------------------------------
    // // Firestore Verification
    // // ------------------------------------------------------
    let verified = 0;
    for (const document of documents) {
      const ref = this.db.collection("content").doc(document.id);
      const snapshot = await retry(() => ref.get(), {
        attempts: 3,
        delayMs: 250,
        backoffMultiplier: 2,
        onRetry: (_error, attempt, delayMs) => {
          console.warn(
            `⚠ Content verification retry ${attempt} in ${delayMs}ms...`,
          );
        },
      });

      if (!snapshot.exists) {
        throw new Error(
          `Firestore verification failed for document "${document.id}".`,
        );
      }
      verified++;
    }
    // ------------------------------------------------------
    // // Result // ------------------------------------------------------
    return { written: documents.length, created, updated, verified };
  }
}

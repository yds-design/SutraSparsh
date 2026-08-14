import type { ContentDocument } from "../types/index.js";
import { importerConfig } from "../config/importer.config.js";
import { retry } from "../shared/retry.js";
import { firestore } from "./client.js";
import { importerLogger } from "../observability/importer.logger.js";

export interface ContentWriteResult {
  written: number;
  created: number;
  updated: number;
  unchanged: number;
  verified: number;
}

function contentEquals(
  existing: Record<string, unknown>,
  document: ContentDocument,
): boolean {
  const existingCopy = {
    ...existing,
  };

  delete existingCopy.updatedAt;

  const incomingCopy = {
    ...document,
  };

  delete (
    incomingCopy as Record<string, unknown>
  ).updatedAt;

  return (
    JSON.stringify(existingCopy) ===
    JSON.stringify(incomingCopy)
  );
}

export class ContentWriter {
  private readonly db = firestore();

  async write(
    documents: ContentDocument[],
  ): Promise<ContentWriteResult> {
    if (documents.length === 0) {
      importerLogger.info(
        "Content write skipped: no documents.",
      );

      return {
        written: 0,
        created: 0,
        updated: 0,
        unchanged: 0,
        verified: 0,
      };
    }

    importerLogger.info(
      `Starting content write for ${documents.length} document(s).`,
    );

    const batch = this.db.batch();

    let created = 0;
    let updated = 0;
    let unchanged = 0;

    for (const document of documents) {
      const ref = this.db
        .collection("content")
        .doc(document.id);

      let existing;

      try {
        existing = await retry(
          () => ref.get(),
          {
            attempts:
              importerConfig.retry.attempts,

            delayMs:
              importerConfig.retry.delayMs,

            backoffMultiplier:
              importerConfig.retry
                .backoffMultiplier,

            onRetry: (
              _error,
              attempt,
              delayMs,
            ) => {
              importerLogger.warn(
                `Content read retry ${attempt} for "${document.id}" in ${delayMs}ms.`,
              );
            },
          },
        );
      } catch (error: unknown) {
        importerLogger.error(
          `Content read failed for "${document.id}".`,
          {
            error:
              error instanceof Error
                ? error.message
                : String(error),
          },
        );

        throw new Error(
          `Firestore content read failed for document "${document.id}".`,
          {
            cause: error,
          },
        );
      }

      if (!existing.exists) {
        created++;

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

        continue;
      }

      if (
        importerConfig.idempotency.enabled
      ) {
        const existingData =
          typeof existing.data === "function"
            ? (
                existing.data() as
                  | Record<string, unknown>
                  | undefined
              )
            : undefined;

        if (
          existingData &&
          contentEquals(
            existingData,
            document,
          )
        ) {
          unchanged++;

          importerLogger.debug(
            `Content unchanged; skipping "${document.id}".`,
          );

          continue;
        }
      }

      updated++;

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

    const written =
      created + updated;

    importerLogger.info(
      `Content write plan: ${written} write(s), ${created} created, ${updated} updated, ${unchanged} unchanged.`,
    );

    /*
     * Nothing changed.
     *
     * Do not call Firestore commit when every document
     * is already identical to the incoming content.
     */
    if (written > 0) {
      try {
        await retry(
          () => batch.commit(),
          {
            attempts:
              importerConfig.retry.attempts,

            delayMs:
              importerConfig.retry.delayMs,

            backoffMultiplier:
              importerConfig.retry
                .backoffMultiplier,

            onRetry: (
              _error,
              attempt,
              delayMs,
            ) => {
              importerLogger.warn(
                `Content write retry ${attempt} in ${delayMs}ms.`,
              );
            },
          },
        );

        importerLogger.info(
          `Content batch committed successfully: ${written} document(s).`,
        );
      } catch (error: unknown) {
        importerLogger.error(
          "Firestore content batch write failed after retries.",
          {
            error:
              error instanceof Error
                ? error.message
                : String(error),
          },
        );

        throw new Error(
          "Firestore content batch write failed.",
          {
            cause: error,
          },
        );
      }
    } else {
      importerLogger.info(
        "Content batch commit skipped: all documents are unchanged.",
      );
    }

    /*
     * Verify every incoming document.
     *
     * Verification intentionally includes unchanged documents
     * because the result represents the final Firestore state
     * for the entire import set.
     */
    let verified = 0;

    for (const document of documents) {
      const ref = this.db
        .collection("content")
        .doc(document.id);

      let snapshot;

      try {
        snapshot = await retry(
          () => ref.get(),
          {
            attempts:
              importerConfig.retry.attempts,

            delayMs:
              importerConfig.retry.delayMs,

            backoffMultiplier:
              importerConfig.retry
                .backoffMultiplier,

            onRetry: (
              _error,
              attempt,
              delayMs,
            ) => {
              importerLogger.warn(
                `Content verification retry ${attempt} for "${document.id}" in ${delayMs}ms.`,
              );
            },
          },
        );
      } catch (error: unknown) {
        importerLogger.error(
          `Content verification read failed for "${document.id}".`,
          {
            error:
              error instanceof Error
                ? error.message
                : String(error),
          },
        );

        throw new Error(
          `Firestore verification read failed for document "${document.id}".`,
          {
            cause: error,
          },
        );
      }

      if (!snapshot.exists) {
        importerLogger.error(
          `Content verification failed for "${document.id}": document not found.`,
        );

        throw new Error(
          `Firestore verification failed for document "${document.id}".`,
        );
      }

      verified++;
    }

    importerLogger.info(
      `Content verification completed: ${verified}/${documents.length} document(s).`,
    );

    return {
      written,
      created,
      updated,
      unchanged,
      verified,
    };
  }
}
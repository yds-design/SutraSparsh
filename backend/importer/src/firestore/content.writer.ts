import type {
  Firestore,
  DocumentReference,
} from "firebase-admin/firestore";

import { importerConfig } from "../config/importer.config.js";
import { executeWithRetry } from "../shared/retry.js";
import type { ContentDocument } from "../types/content.js";

// Re-export the type so consumers can import it from this module if needed.
export type { ContentDocument } from "../types/content.js";

export interface ContentWriteResult {
  written: number;
  created: number;
  updated: number;
  unchanged: number;
  verified: number;
}

export interface ContentWriterOptions {
  firestore: Firestore;
}

/**
 * Converts arbitrary text into a Firestore-safe,
 * deterministic document ID.
 */
function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * M8.3
 *
 * Deterministic ID:
 *
 *   language + source + title
 *
 * Example:
 *
 *   sanskrit-json-rig-veda
 *
 * If the source already supplies an ID,
 * preserve it.
 */
export function createDeterministicDocumentId(
  document: ContentDocument,
): string {
  if (document.id?.trim()) {
    return document.id.trim();
  }

  const language = document.metadata.language;
  const source = document.metadata.source;
  const title = document.title;

  const parts = [language, source, title]
    .map(slugify)
    .filter(Boolean);

  const id = parts.join("-");

  if (!id) {
    throw new Error(
      "Unable to create deterministic document ID.",
    );
  }

  return id;
}

/**
 * Creates a canonical representation for comparison.
 *
 * Firestore may return object properties in an order
 * different from the incoming object, so JSON.stringify()
 * is not used directly.
 */
function normalizeForComparison(
  value: Record<string, unknown>,
): string {
  const normalized: Record<string, unknown> = {};

  for (const key of Object.keys(value).sort()) {
    if (
      key === "id" ||
      key === "createdAt" ||
      key === "updatedAt"
    ) {
      continue;
    }

    normalized[key] = normalizeValue(value[key]);
  }

  return JSON.stringify(normalized);
}

function normalizeValue(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(normalizeValue);
  }

  if (typeof value === "object") {
    const object = value as Record<string, unknown>;
    const normalized: Record<string, unknown> = {};

    for (const key of Object.keys(object).sort()) {
      normalized[key] = normalizeValue(object[key]);
    }

    return normalized;
  }

  return value;
}

function documentsAreEqual(
  existing: Record<string, unknown>,
  incoming: ContentDocument,
): boolean {
  return (
    normalizeForComparison(existing) ===
    normalizeForComparison(
      incoming as unknown as Record<string, unknown>,
    )
  );
}

interface PendingWrite {
  ref: DocumentReference;
  data: ContentDocument;
  type: "created" | "updated";
}

export class ContentWriter {
  private readonly firestore: Firestore;

  constructor(options: ContentWriterOptions) {
    this.firestore = options.firestore;
  }

  async write(
    documents: ContentDocument[],
  ): Promise<ContentWriteResult> {
    if (documents.length === 0) {
      console.log(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: "info",
          message:
            "Content write skipped: no documents.",
        }),
      );

      return {
        written: 0,
        created: 0,
        updated: 0,
        unchanged: 0,
        verified: 0,
      };
    }

    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "info",
        message:
          `Starting content write for ${documents.length} document(s).`,
      }),
    );

    const collection =
      this.firestore.collection("content");

    const writes: PendingWrite[] = [];

    let created = 0;
    let updated = 0;
    let unchanged = 0;

    // ----------------------------------------------------------
    // M8.3 — Build deterministic write plan
    // ----------------------------------------------------------

    for (const document of documents) {
      const documentId =
        createDeterministicDocumentId(document);

      const ref = collection.doc(documentId);

      const snapshot = await ref.get();

      const data: ContentDocument = {
        ...document,
        id: documentId,
      };

      // CREATE
      if (!snapshot.exists) {
        writes.push({
          ref,
          data,
          type: "created",
        });

        created += 1;
        continue;
      }

      const existing = snapshot.data();

      // Existing document should always have data,
      // but guard defensively.
      if (
        existing &&
        documentsAreEqual(existing, data)
      ) {
        unchanged += 1;

        console.log(
          JSON.stringify({
            timestamp: new Date().toISOString(),
            level: "debug",
            message:
              `Content unchanged; skipping "${documentId}".`,
          }),
        );

        continue;
      }

      // UPDATE
      writes.push({
        ref,
        data,
        type: "updated",
      });

      updated += 1;
    }

    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "info",
        message:
          `Content write plan: ${writes.length} write(s), ${created} created, ${updated} updated, ${unchanged} unchanged.`,
      }),
    );

    // ----------------------------------------------------------
    // M8.3 — No unnecessary Firestore commit
    // ----------------------------------------------------------

    if (writes.length === 0) {
      console.log(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: "info",
          message:
            "Content batch commit skipped: all documents are unchanged.",
        }),
      );

      return {
        written: 0,
        created,
        updated,
        unchanged,
        verified: documents.length,
      };
    }

    // ----------------------------------------------------------
    // Firestore batch
    // ----------------------------------------------------------

    const batch = this.firestore.batch();

    for (const write of writes) {
      batch.set(
        write.ref,
        write.data,
        {
          merge: true,
        },
      );
    }

    // ----------------------------------------------------------
    // M8.2 — Retry batch commit
    // ----------------------------------------------------------

    await executeWithRetry(
      async () => {
        await batch.commit();
      },
      {
        attempts:
          importerConfig.retry.attempts,

        delayMs:
          importerConfig.retry.delayMs,

        backoffMultiplier:
          importerConfig.retry.backoffMultiplier,

        onRetry: (
          error,
          attempt,
          delayMs,
        ) => {
          const message =
            error instanceof Error
              ? error.message
              : String(error);

          console.warn(
            `⚠ Content write retry ${attempt} in ${delayMs}ms...`,
          );

          console.warn(
            `   Reason: ${message}`,
          );
        },
      },
    );

    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "info",
        message:
          `Content batch committed successfully: ${writes.length} document(s).`,
      }),
    );

    // ----------------------------------------------------------
    // Verification
    // ----------------------------------------------------------

    let verified = unchanged;

    for (const write of writes) {
      const snapshot = await write.ref.get();

      if (!snapshot.exists) {
        throw new Error(
          `Firestore verification failed for document "${write.ref.id}".`,
        );
      }

      const existing = snapshot.data();

      if (
        !existing ||
        !documentsAreEqual(
          existing,
          write.data,
        )
      ) {
        throw new Error(
          `Firestore verification failed for document "${write.ref.id}".`,
        );
      }

      verified += 1;
    }

    const result: ContentWriteResult = {
      written: writes.length,
      created,
      updated,
      unchanged,
      verified,
    };

    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "info",
        message:
          `Content verification completed: ${verified}/${documents.length} document(s).`,
        written: result.written,
        created: result.created,
        updated: result.updated,
        unchanged: result.unchanged,
        verified: result.verified,
      }),
    );

    return result;
  }
}

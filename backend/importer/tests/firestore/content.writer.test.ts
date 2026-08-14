import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  ContentWriter,
  type ContentDocument,
} from "../../src/firestore/content.writer.js";

function createFirestoreMock(
  existingDocuments: Record<
    string,
    Record<string, unknown>
  > = {},
) {
  const documents = {
    ...existingDocuments,
  };

  const commit =
    vi.fn().mockImplementation(async () => {
      // Simulate the Firestore batch commit by applying
      // every queued batch.set() operation to the mock
      // document store.
      for (const operation of batchSet.mock.calls) {
        const [
          ref,
          data,
          options,
        ] = operation as [
          { id: string },
          Record<string, unknown>,
          { merge?: boolean } | undefined,
        ];

        const current =
          documents[ref.id];

        documents[ref.id] =
          options?.merge && current
            ? {
                ...current,
                ...data,
              }
            : {
                ...data,
              };
      }
    });

  const batchSet = vi.fn();

  const batch = {
    set: batchSet,
    commit,
  };

  const document = vi.fn(
    (id: string) => ({
      id,

      get: vi.fn().mockImplementation(
        async () => {
          const data =
            documents[id];

          return {
            exists:
              data !== undefined,

            data: () => data,
          };
        },
      ),
    }),
  );

  const collection = vi.fn(() => ({
    doc: document,
  }));

  return {
    firestore: {
      collection,
      batch: vi.fn(() => batch),
    } as any,

    batch,
    collection,
    document,
    documents,
  };
}

function createDocument(
  overrides: Partial<ContentDocument> = {},
): ContentDocument {
  return {
    id: "content-001",
    title: "Rig Veda",
    content: "Agni...",
    metadata: {
      language: "sanskrit",
      source: "json",
    },
    ...overrides,
  };
}

describe(
  "ContentWriter — M8.3 Idempotency",
  () => {
    it(
      "uses deterministic document IDs",
      async () => {
        const mock =
          createFirestoreMock();

        const writer =
          new ContentWriter({
            firestore:
              mock.firestore,
          });

        const document: ContentDocument = {
          title: "Rig Veda",
          content: "Agni...",
          metadata: {
            language: "sanskrit",
            source: "json",
          },
        };

        await writer.write([document]);

        expect(
          mock.document,
        ).toHaveBeenCalledWith(
          "sanskrit-json-rig-veda",
        );
      },
    );

    it(
      "does not write an unchanged document",
      async () => {
        const existing =
          createDocument();

        const mock =
          createFirestoreMock({
            "content-001":
              existing,
          });

        const writer =
          new ContentWriter({
            firestore:
              mock.firestore,
          });

        const result =
          await writer.write([
            existing,
          ]);

        expect(
          result.written,
        ).toBe(0);

        expect(
          result.created,
        ).toBe(0);

        expect(
          result.updated,
        ).toBe(0);

        expect(
          result.unchanged,
        ).toBe(1);

        expect(
          result.verified,
        ).toBe(1);

        expect(
          mock.batch.commit,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      "creates a document when the deterministic ID does not exist",
      async () => {
        const mock =
          createFirestoreMock();

        const writer =
          new ContentWriter({
            firestore:
              mock.firestore,
          });

        const result =
          await writer.write([
            createDocument(),
          ]);

        expect(
          result.written,
        ).toBe(1);

        expect(
          result.created,
        ).toBe(1);

        expect(
          result.updated,
        ).toBe(0);

        expect(
          result.unchanged,
        ).toBe(0);

        expect(
          result.verified,
        ).toBe(1);

        expect(
          mock.batch.set,
        ).toHaveBeenCalledTimes(1);

        expect(
          mock.batch.commit,
        ).toHaveBeenCalledTimes(1);
      },
    );

    it(
      "updates a document when content has changed",
      async () => {
        const existing =
          createDocument({
            title: "Old title",
            content: "Old content",
          });

        const incoming =
          createDocument({
            title: "New title",
            content: "New content",
          });

        const mock =
          createFirestoreMock({
            "content-001":
              existing,
          });

        const writer =
          new ContentWriter({
            firestore:
              mock.firestore,
          });

        const result =
          await writer.write([
            incoming,
          ]);

        expect(
          result.written,
        ).toBe(1);

        expect(
          result.created,
        ).toBe(0);

        expect(
          result.updated,
        ).toBe(1);

        expect(
          result.unchanged,
        ).toBe(0);

        expect(
          result.verified,
        ).toBe(1);

        expect(
          mock.batch.set,
        ).toHaveBeenCalledTimes(1);

        expect(
          mock.batch.commit,
        ).toHaveBeenCalledTimes(1);
      },
    );

    it(
      "is safe to run the same import repeatedly",
      async () => {
        const document =
          createDocument();

        const first =
          createFirestoreMock();

        const firstWriter =
          new ContentWriter({
            firestore:
              first.firestore,
          });

        const firstResult =
          await firstWriter.write([
            document,
          ]);

        expect(
          firstResult.created,
        ).toBe(1);

        const second =
          createFirestoreMock({
            "content-001":
              document,
          });

        const secondWriter =
          new ContentWriter({
            firestore:
              second.firestore,
          });

        const secondResult =
          await secondWriter.write([
            document,
          ]);

        expect(
          secondResult.created,
        ).toBe(0);

        expect(
          secondResult.updated,
        ).toBe(0);

        expect(
          secondResult.unchanged,
        ).toBe(1);

        expect(
          secondResult.written,
        ).toBe(0);

        expect(
          second.batch.commit,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      "reports mixed create, update and unchanged counts correctly",
      async () => {
        const unchanged =
          createDocument({
            id: "existing-unchanged",
            title: "Same",
            content: "Same content",
          });

        const updatedExisting =
          createDocument({
            id: "existing-updated",
            title: "Old",
            content: "Old content",
          });

        const newDocument =
          createDocument({
            id: "new-document",
            title: "New document",
            content: "New content",
          });

        const mock =
          createFirestoreMock({
            "existing-unchanged":
              unchanged,

            "existing-updated":
              updatedExisting,
          });

        const writer =
          new ContentWriter({
            firestore:
              mock.firestore,
          });

        const result =
          await writer.write([
            unchanged,

            {
              ...updatedExisting,
              title: "New",
              content: "New content",
            },

            newDocument,
          ]);

        expect(
          result.created,
        ).toBe(1);

        expect(
          result.updated,
        ).toBe(1);

        expect(
          result.unchanged,
        ).toBe(1);

        expect(
          result.written,
        ).toBe(2);

        expect(
          result.verified,
        ).toBe(3);

        expect(
          mock.batch.set,
        ).toHaveBeenCalledTimes(2);

        expect(
          mock.batch.commit,
        ).toHaveBeenCalledTimes(1);
      },
    );

    it(
      "does not commit when all documents are unchanged",
      async () => {
        const documents = {
          "content-001":
            createDocument({
              id: "content-001",
              title: "One",
              content: "Content one",
            }),

          "content-002":
            createDocument({
              id: "content-002",
              title: "Two",
              content: "Content two",
            }),
        };

        const mock =
          createFirestoreMock(
            documents,
          );

        const writer =
          new ContentWriter({
            firestore:
              mock.firestore,
          });

        const result =
          await writer.write(
            Object.values(documents),
          );

        expect(
          result.written,
        ).toBe(0);

        expect(
          result.created,
        ).toBe(0);

        expect(
          result.updated,
        ).toBe(0);

        expect(
          result.unchanged,
        ).toBe(2);

        expect(
          result.verified,
        ).toBe(2);

        expect(
          mock.batch.set,
        ).not.toHaveBeenCalled();

        expect(
          mock.batch.commit,
        ).not.toHaveBeenCalled();
      },
    );
  },
); 

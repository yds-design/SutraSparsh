import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockBatchSet,
  mockCommit,
  mockDoc,
  mockCollection,
  mockFirestore,
} = vi.hoisted(() => {
  const mockBatchSet = vi.fn();
  const mockCommit = vi.fn();

  const mockDoc = vi.fn();
  const mockCollection = vi.fn();

  const mockFirestore = vi.fn();

  return {
    mockBatchSet,
    mockCommit,
    mockDoc,
    mockCollection,
    mockFirestore,
  };
});

vi.mock("../../src/firestore/client.js", () => ({
  firestore: mockFirestore,
}));

import { ContentWriter } from "../../src/firestore/content.writer.js";

interface MockSnapshot {
  exists: boolean;
  data?: Record<string, unknown>;
}

function createSnapshot(
  exists: boolean,
  data?: Record<string, unknown>,
) {
  return {
    exists,
    ...(data !== undefined
      ? {
          data: () => data,
        }
      : {}),
  };
}

function setupFirestore(
  snapshots: MockSnapshot[],
) {
  let snapshotIndex = 0;

  mockDoc.mockImplementation((id: string) => ({
    id,

    get: vi.fn(async () => {
      const snapshot =
        snapshots.length > 0
          ? snapshots[
              Math.min(
                snapshotIndex++,
                snapshots.length - 1,
              )
            ]
          : undefined;

      return createSnapshot(
        snapshot?.exists ?? false,
        snapshot?.data,
      );
    }),
  }));

  mockCollection.mockReturnValue({
    doc: mockDoc,
  });

  mockFirestore.mockReturnValue({
    collection: mockCollection,
    batch: () => ({
      set: mockBatchSet,
      commit: mockCommit,
    }),
  });
}

describe("ContentWriter", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockBatchSet.mockReset();
    mockCommit.mockReset();
    mockDoc.mockReset();
    mockCollection.mockReset();
    mockFirestore.mockReset();

    mockCommit.mockResolvedValue(undefined);
  });

  it("returns zero for an empty document list", async () => {
    setupFirestore([]);

    const writer = new ContentWriter();

    const result = await writer.write([]);

    expect(result).toEqual({
      written: 0,
      created: 0,
      updated: 0,
      unchanged: 0,
      verified: 0,
    });

    expect(mockCollection).not.toHaveBeenCalled();
    expect(mockCommit).not.toHaveBeenCalled();
    expect(mockBatchSet).not.toHaveBeenCalled();
  });

  it("writes documents using deterministic document IDs", async () => {
    const documents = [
      {
        id: "content-001",
        title: "First",
        text: "First content",
      },
      {
        id: "content-002",
        title: "Second",
        text: "Second content",
      },
    ];

    setupFirestore([
      { exists: false },
      { exists: false },

      // Verification snapshots.
      {
        exists: true,
        data: {
          id: "content-001",
          title: "First",
          text: "First content",
        },
      },
      {
        exists: true,
        data: {
          id: "content-002",
          title: "Second",
          text: "Second content",
        },
      },
    ]);

    const writer = new ContentWriter();

    const result = await writer.write(documents);

    expect(result).toEqual({
      written: 2,
      created: 2,
      updated: 0,
      unchanged: 0,
      verified: 2,
    });

    expect(mockCollection).toHaveBeenCalledWith(
      "content",
    );

    expect(mockDoc).toHaveBeenCalledWith(
      "content-001",
    );

    expect(mockDoc).toHaveBeenCalledWith(
      "content-002",
    );

    expect(mockBatchSet).toHaveBeenCalledTimes(2);

    expect(mockBatchSet).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        id: "content-001",
        get: expect.any(Function),
      }),
      expect.objectContaining({
        id: "content-001",
        title: "First",
        text: "First content",
        updatedAt: expect.any(Date),
      }),
      {
        merge: true,
      },
    );

    expect(mockBatchSet).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        id: "content-002",
        get: expect.any(Function),
      }),
      expect.objectContaining({
        id: "content-002",
        title: "Second",
        text: "Second content",
        updatedAt: expect.any(Date),
      }),
      {
        merge: true,
      },
    );

    expect(mockCommit).toHaveBeenCalledTimes(1);
  });

  it("reports existing documents as updated", async () => {
    const documents = [
      {
        id: "content-001",
        title: "Updated title",
        text: "Updated content",
      },
    ];

    setupFirestore([
      {
        exists: true,
        data: {
          id: "content-001",
          title: "Old title",
          text: "Old content",
        },
      },

      // Verification snapshot.
      {
        exists: true,
        data: {
          id: "content-001",
          title: "Updated title",
          text: "Updated content",
        },
      },
    ]);

    const writer = new ContentWriter();

    const result = await writer.write(documents);

    expect(result).toEqual({
      written: 1,
      created: 0,
      updated: 1,
      unchanged: 0,
      verified: 1,
    });

    expect(mockBatchSet).toHaveBeenCalledTimes(1);
    expect(mockCommit).toHaveBeenCalledTimes(1);
  });

  it("reports an unchanged document when the existing content is identical", async () => {
    const documents = [
      {
        id: "content-001",
        title: "Same title",
        text: "Same content",
      },
    ];

    setupFirestore([
      {
        exists: true,
        data: {
          id: "content-001",
          title: "Same title",
          text: "Same content",
        },
      },

      // Verification of unchanged document.
      {
        exists: true,
        data: {
          id: "content-001",
          title: "Same title",
          text: "Same content",
        },
      },
    ]);

    const writer = new ContentWriter();

    const result = await writer.write(documents);

    expect(result).toEqual({
      written: 0,
      created: 0,
      updated: 0,
      unchanged: 1,
      verified: 1,
    });

    expect(mockBatchSet).not.toHaveBeenCalled();
    expect(mockCommit).not.toHaveBeenCalled();
  });

  it("fails when Firestore verification cannot find a written document", async () => {
    const documents = [
      {
        id: "content-001",
        title: "First",
        text: "First content",
      },
    ];

    setupFirestore([
      // Initial lookup: document does not exist.
      { exists: false },

      // Verification: still missing.
      { exists: false },
    ]);

    const writer = new ContentWriter();

    await expect(
      writer.write(documents),
    ).rejects.toThrow(
      'Firestore verification failed for document "content-001".',
    );

    expect(mockBatchSet).toHaveBeenCalledTimes(1);
    expect(mockCommit).toHaveBeenCalledTimes(1);
  });

  it("does not commit when every document is unchanged", async () => {
    const documents = [
      {
        id: "content-001",
        title: "Same title",
        text: "Same content",
      },
      {
        id: "content-002",
        title: "Another title",
        text: "Another content",
      },
    ];

    setupFirestore([
      {
        exists: true,
        data: {
          id: "content-001",
          title: "Same title",
          text: "Same content",
        },
      },
      {
        exists: true,
        data: {
          id: "content-002",
          title: "Another title",
          text: "Another content",
        },
      },

      // Verification snapshots.
      {
        exists: true,
        data: {
          id: "content-001",
          title: "Same title",
          text: "Same content",
        },
      },
      {
        exists: true,
        data: {
          id: "content-002",
          title: "Another title",
          text: "Another content",
        },
      },
    ]);

    const writer = new ContentWriter();

    const result = await writer.write(documents);

    expect(result).toEqual({
      written: 0,
      created: 0,
      updated: 0,
      unchanged: 2,
      verified: 2,
    });

    expect(mockBatchSet).not.toHaveBeenCalled();
    expect(mockCommit).not.toHaveBeenCalled();
  });

  it("writes only documents whose content changed", async () => {
    const documents = [
      {
        id: "content-001",
        title: "Same title",
        text: "Same content",
      },
      {
        id: "content-002",
        title: "New title",
        text: "New content",
      },
    ];

    setupFirestore([
      // content-001: unchanged.
      {
        exists: true,
        data: {
          id: "content-001",
          title: "Same title",
          text: "Same content",
        },
      },

      // content-002: changed.
      {
        exists: true,
        data: {
          id: "content-002",
          title: "Old title",
          text: "Old content",
        },
      },

      // Verification of content-001.
      {
        exists: true,
        data: {
          id: "content-001",
          title: "Same title",
          text: "Same content",
        },
      },

      // Verification of content-002.
      {
        exists: true,
        data: {
          id: "content-002",
          title: "New title",
          text: "New content",
        },
      },
    ]);

    const writer = new ContentWriter();

    const result = await writer.write(documents);

    expect(result).toEqual({
      written: 1,
      created: 0,
      updated: 1,
      unchanged: 1,
      verified: 2,
    });

    expect(mockBatchSet).toHaveBeenCalledTimes(1);

    expect(mockBatchSet).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "content-002",
        get: expect.any(Function),
      }),
      expect.objectContaining({
        id: "content-002",
        title: "New title",
        text: "New content",
        updatedAt: expect.any(Date),
      }),
      {
        merge: true,
      },
    );

    expect(mockCommit).toHaveBeenCalledTimes(1);
  });

  it("preserves the Firestore batch write error after retries are exhausted", async () => {
    const documents = [
      {
        id: "content-001",
        title: "First",
        text: "First content",
      },
    ];

    setupFirestore([
      // Initial lookup.
      { exists: false },
    ]);

    const firestoreError = new Error(
      "Firestore content batch write failed.",
    );

    mockCommit
      .mockRejectedValueOnce(firestoreError)
      .mockRejectedValueOnce(firestoreError)
      .mockRejectedValueOnce(firestoreError);

    const writer = new ContentWriter();

    await expect(
      writer.write(documents),
    ).rejects.toThrow(
      "Firestore content batch write failed.",
    );

    expect(mockCommit).toHaveBeenCalledTimes(3);
  });
});
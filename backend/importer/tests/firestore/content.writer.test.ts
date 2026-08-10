import { describe, expect, it, vi, beforeEach } from "vitest";

import type { ContentDocument } from "../../src/types/index.js";

const mockGet = vi.fn();
const mockSet = vi.fn();
const mockCommit = vi.fn();

const mockBatch = {
  set: mockSet,
  commit: mockCommit,
};

const mockDoc = vi.fn(() => ({
  get: mockGet,
}));

const mockCollection = vi.fn(() => ({
  doc: mockDoc,
}));

vi.mock("../../src/firestore/client.js", () => ({
  firestore: () => ({
    batch: () => mockBatch,
    collection: mockCollection,
  }),
}));

import { ContentWriter } from "../../src/firestore/content.writer.js";

describe("ContentWriter", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockCommit.mockResolvedValue(undefined);
  });

  it("returns zero for an empty document list", async () => {
    const writer = new ContentWriter();

    const result = await writer.write([]);

    expect(result).toEqual({
      written: 0,
      created: 0,
      updated: 0,
      verified: 0,
    });

    expect(mockCommit).not.toHaveBeenCalled();
  });

  it("writes documents using deterministic document IDs", async () => {
    const documents: ContentDocument[] = [
      {
        id: "content-001",
        title: "First Content",
        body: "First body",
        metadata: {
          language: "en",
          source: "test",
          author: "Test Author",
          category: "test",
          tags: ["test"],
        },
      },
      {
        id: "content-002",
        title: "Second Content",
        body: "Second body",
        metadata: {
          language: "en",
          source: "test",
          author: "Test Author",
          category: "test",
          tags: ["test"],
        },
      },
    ];

    mockGet
      .mockResolvedValueOnce({
        exists: false,
      })
      .mockResolvedValueOnce({
        exists: false,
      })
      .mockResolvedValueOnce({
        exists: true,
      })
      .mockResolvedValueOnce({
        exists: true,
      });

    const writer = new ContentWriter();

    const result = await writer.write(documents);

    expect(mockCollection).toHaveBeenCalledWith("content");

    expect(mockDoc).toHaveBeenCalledWith("content-001");
    expect(mockDoc).toHaveBeenCalledWith("content-002");

    expect(mockSet).toHaveBeenCalledTimes(2);
    expect(mockCommit).toHaveBeenCalledTimes(1);

    expect(result).toEqual({
      written: 2,
      created: 2,
      updated: 0,
      verified: 2,
    });
  });

  it("reports existing documents as updated", async () => {
    const documents: ContentDocument[] = [
      {
        id: "content-001",
        title: "Existing Content",
        body: "Updated body",
        metadata: {
          language: "en",
          source: "test",
          author: "Test Author",
          category: "test",
          tags: ["test"],
        },
      },
    ];

    mockGet
      .mockResolvedValueOnce({
        exists: true,
      })
      .mockResolvedValueOnce({
        exists: true,
      });

    const writer = new ContentWriter();

    const result = await writer.write(documents);

    expect(result).toEqual({
      written: 1,
      created: 0,
      updated: 1,
      verified: 1,
    });

    expect(mockCommit).toHaveBeenCalledTimes(1);
  });

  it("fails when Firestore verification cannot find a written document", async () => {
    const documents: ContentDocument[] = [
      {
        id: "content-001",
        title: "Test Content",
        body: "Test body",
        metadata: {
          language: "en",
          source: "test",
          author: "Test Author",
          category: "test",
          tags: ["test"],
        },
      },
    ];

    mockGet
      .mockResolvedValueOnce({
        exists: false,
      })
      .mockResolvedValueOnce({
        exists: false,
      });

    const writer = new ContentWriter();

    await expect(
      writer.write(documents),
    ).rejects.toThrow(
      'Firestore verification failed for document "content-001".',
    );
  });
});
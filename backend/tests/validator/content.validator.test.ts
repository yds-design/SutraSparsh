import { describe, expect, it } from "vitest";

import { ContentValidator } from "../../src/validator/index.js";

describe("ContentValidator", () => {
  const validator = new ContentValidator();

  it("accepts a valid document", () => {
    const result = validator.validate([
      {
        id: "test-001",
        title: "Test Title",
        body: "Test body",
        metadata: {
          language: "sa",
          source: "json",
          author: "Test Author",
          category: "Verse",
          tags: ["test"],
        },
      },
    ]);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("rejects a document without an id", () => {
    const result = validator.validate([
      {
        id: "",
        title: "Test Title",
        body: "Test body",
        metadata: {
          language: "sa",
          source: "json",
          author: "Test Author",
          category: "Verse",
          tags: [],
        },
      },
    ]);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Document 1: id is required.");
  });

  it("rejects duplicate ids", () => {
    const documents = [
      {
        id: "duplicate",
        title: "First",
        body: "First body",
        metadata: {
          language: "sa",
          source: "json",
          author: "Author",
          category: "Verse",
          tags: [],
        },
      },
      {
        id: "duplicate",
        title: "Second",
        body: "Second body",
        metadata: {
          language: "sa",
          source: "json",
          author: "Author",
          category: "Verse",
          tags: [],
        },
      },
    ];

    const result = validator.validate(documents);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      'Document 2: duplicate document id "duplicate".',
    );
  });

  it("returns a warning for missing author", () => {
    const result = validator.validate([
      {
        id: "test-002",
        title: "Test Title",
        body: "Test body",
        metadata: {
          language: "sa",
          source: "json",
          author: "",
          category: "Verse",
          tags: [],
        },
      },
    ]);

    expect(result.valid).toBe(true);
    expect(result.warnings).toContain(
      "Document 1: metadata.author is empty.",
    );
  });
});
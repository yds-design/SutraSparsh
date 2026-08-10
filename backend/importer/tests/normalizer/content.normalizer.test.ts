import { describe, expect, it } from "vitest";
import { ContentNormalizer } from "../../src/normalizer/index.js";

describe("ContentNormalizer", () => {
  it("normalizes whitespace without changing content meaning", () => {
    const normalizer = new ContentNormalizer();

    const documents = [
      {
        id: "  test-001  ",
        title: "  Test   Title  ",
        body: "  कर्मण्येवाधिकारस्ते   मा फलेषु कदाचन  ",
        metadata: {
          language: " sa ",
          source: " json ",
          author: " Bhagavad Gita ",
          category: " Verse ",
          tags: [" karma ", " yoga "],
        },
      },
    ];

    const result = normalizer.normalize(documents);

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("test-001");
    expect(result[0]?.title).toBe("Test Title");
    expect(result[0]?.body).toBe(
      "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन",
    );
    expect(result[0]?.metadata.language).toBe("sa");
    expect(result[0]?.metadata.source).toBe("json");
    expect(result[0]?.metadata.tags).toEqual(["karma", "yoga"]);
  });
});
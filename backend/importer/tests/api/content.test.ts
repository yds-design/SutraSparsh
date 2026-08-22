import {
  describe,
  expect,
  it,
} from "vitest";

import {
  ContentRepository,
} from "../../../../src/api/repositories/content.repository.js";

describe(
  "M9.2 Content Repository",
  () => {
    it(
      "retrieves content by ID",
      async () => {
        const repository =
          new ContentRepository();

        const content =
          await repository.getById(
            "test-content-1",
          );

        expect(content).toBeDefined();

        if (content) {
          expect(content.id).toBe(
            "test-content-1",
          );
        }
      },
    );

    it(
      "returns null for a missing content document",
      async () => {
        const repository =
          new ContentRepository();

        const content =
          await repository.getById(
            "content-that-does-not-exist",
          );

        expect(content).toBeNull();
      },
    );

    it(
      "lists content",
      async () => {
        const repository =
          new ContentRepository();

        const result =
          await repository.list();

        expect(result).toBeDefined();
        expect(
          Array.isArray(result.items),
        ).toBe(true);

        expect(
          typeof result.total,
        ).toBe("number");

        expect(result.total).toBe(
          result.items.length,
        );
      },
    );

    it(
      "supports language filtering",
      async () => {
        const repository =
          new ContentRepository();

        const result =
          await repository.list({
            language: "sanskrit",
          });

        expect(
          Array.isArray(result.items),
        ).toBe(true);

        result.items.forEach(
          (item) => {
            expect(
              item.metadata?.language,
            ).toBe("sanskrit");
          },
        );
      },
    );

    it(
      "supports source filtering",
      async () => {
        const repository =
          new ContentRepository();

        const result =
          await repository.list({
            source: "production",
          });

        expect(
          Array.isArray(result.items),
        ).toBe(true);

        result.items.forEach(
          (item) => {
            expect(
              item.metadata?.source,
            ).toBe("production");
          },
        );
      },
    );

    it(
      "supports category filtering",
      async () => {
        const repository =
          new ContentRepository();

        const result =
          await repository.list({
            category: "philosophy",
          });

        expect(
          Array.isArray(result.items),
        ).toBe(true);

        result.items.forEach(
          (item) => {
            expect(
              item.metadata?.category,
            ).toBe("philosophy");
          },
        );
      },
    );

    it(
      "supports tag filtering",
      async () => {
        const repository =
          new ContentRepository();

        const result =
          await repository.list({
            tag: "vedanta",
          });

        expect(
          Array.isArray(result.items),
        ).toBe(true);

        result.items.forEach(
          (item) => {
            expect(
              item.metadata?.tags,
            ).toContain("vedanta");
          },
        );
      },
    );

    it(
      "supports text search",
      async () => {
        const repository =
          new ContentRepository();

        const result =
          await repository.list({
            search: "karma",
          });

        expect(
          Array.isArray(result.items),
        ).toBe(true);

        result.items.forEach(
          (item) => {
            const title =
              typeof item.title ===
              "string"
                ? item.title.toLowerCase()
                : "";

            const body =
              typeof item.body ===
              "string"
                ? item.body.toLowerCase()
                : "";

            expect(
              title.includes("karma") ||
                body.includes("karma"),
            ).toBe(true);
          },
        );
      },
    );
  },
);
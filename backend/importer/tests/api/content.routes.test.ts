import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import express from "express";
import {
  errorMiddleware,
} from "../../../../src/api/middleware/error.middleware.js";

import {
  notFoundMiddleware,
} from "../../../../src/api/middleware/not-found.middleware.js";


import contentRoutes from "../../../../src/api/routes/content.routes.js";

const mockContent = [
  {
    id: "content-1",
    title: "Karma Yoga",
    body: "Karma yoga teaches selfless action.",
    metadata: {
      language: "sanskrit",
      source: "production",
      category: "philosophy",
      tags: [
        "karma",
        "vedanta",
      ],
    },
  },
  {
    id: "content-2",
    title: "Bhakti Yoga",
    body: "Bhakti is the path of devotion.",
    metadata: {
      language: "sanskrit",
      source: "production",
      category: "devotion",
      tags: [
        "bhakti",
      ],
    },
  },
  {
    id: "content-3",
    title: "Dharma",
    body: "Dharma describes righteous conduct.",
    metadata: {
      language: "sanskrit",
      source: "production",
      category: "philosophy",
      tags: [
        "dharma",
      ],
    },
  },
];

const repository = vi.hoisted(() => ({
  getById: vi.fn(),
  list: vi.fn(),
}));

vi.mock(
  "../../../../src/api/repositories/content.repository.js",
  () => ({
    ContentRepository: class {
      getById = repository.getById;
      list = repository.list;
    },
  }),
);

describe(
  "M9.2 Content API Routes",
  () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it(
      "lists content",
      async () => {
        repository.list.mockResolvedValue({
          items: mockContent,
          total: mockContent.length,
        });

        const app =
          createTestApp();

        const response =
          await request(
            app,
            "/api/content",
          );

        expect(
          response.statusCode,
        ).toBe(200);

        expect(
          response.body.success,
        ).toBe(true);

        expect(
          response.body.data,
        ).toEqual(
          mockContent,
        );

        expect(
          response.body.pagination,
        ).toEqual({
          page: 1,
          limit: 20,
          total: 3,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        });

        expect(
          repository.list,
        ).toHaveBeenCalledWith({
          language: undefined,
          source: undefined,
          category: undefined,
          tag: undefined,
          search: undefined,
        });
      },
    );

    it(
      "retrieves content by ID",
      async () => {
        repository.getById.mockResolvedValue(
          mockContent[0],
        );

        const app =
          createTestApp();

        const response =
          await request(
            app,
            "/api/content/content-1",
          );

        expect(
          response.statusCode,
        ).toBe(200);

        expect(
          response.body.success,
        ).toBe(true);

        expect(
          response.body.data,
        ).toEqual(
          mockContent[0],
        );

        expect(
          repository.getById,
        ).toHaveBeenCalledWith(
          "content-1",
        );
      },
    );

    it(
      "returns 404 when content does not exist",
      async () => {
        repository.getById.mockResolvedValue(
          null,
        );

        const app =
          createTestApp();

        const response =
          await request(
            app,
            "/api/content/missing",
          );

        expect(
          response.statusCode,
        ).toBe(404);

        expect(
          response.body.success,
        ).toBe(false);

        expect(
          response.body.error.code,
        ).toBe("NOT_FOUND");
      },
    );

    it(
      "passes content filters to the repository",
      async () => {
        repository.list.mockResolvedValue({
          items: [
            mockContent[0],
          ],
          total: 1,
        });

        const app =
          createTestApp();

        const response =
          await request(
            app,
            "/api/content?language=sanskrit&source=production&category=philosophy&tag=vedanta",
          );

        expect(
          response.statusCode,
        ).toBe(200);

        expect(
          repository.list,
        ).toHaveBeenCalledWith({
          language: "sanskrit",
          source: "production",
          category: "philosophy",
          tag: "vedanta",
          search: undefined,
        });
      },
    );

    it(
      "passes search query to the repository",
      async () => {
        repository.list.mockResolvedValue({
          items: [
            mockContent[0],
          ],
          total: 1,
        });

        const app =
          createTestApp();

        const response =
          await request(
            app,
            "/api/content?q=karma",
          );

        expect(
          response.statusCode,
        ).toBe(200);

        expect(
          repository.list,
        ).toHaveBeenCalledWith({
          language: undefined,
          source: undefined,
          category: undefined,
          tag: undefined,
          search: "karma",
        });
      },
    );

    it(
      "supports pagination",
      async () => {
        repository.list.mockResolvedValue({
          items: [
            mockContent[0],
            mockContent[1],
            mockContent[2],
          ],
          total: 3,
        });

        const app =
          createTestApp();

        const response =
          await request(
            app,
            "/api/content?page=2&limit=2",
          );

        expect(
          response.statusCode,
        ).toBe(200);

        expect(
          response.body.data,
        ).toEqual([
          mockContent[2],
        ]);

        expect(
          response.body.pagination,
        ).toEqual({
          page: 2,
          limit: 2,
          total: 3,
          totalPages: 2,
          hasNextPage: false,
          hasPreviousPage: true,
        });
      },
    );

    it(
      "rejects a page size greater than 100",
      async () => {
        const app =
          createTestApp();

        const response =
          await request(
            app,
            "/api/content?limit=101",
          );

        expect(
          response.statusCode,
        ).toBe(400);

        expect(
          response.body.success,
        ).toBe(false);

        expect(
          response.body.error.code,
        ).toBe(
          "BAD_REQUEST",
        );
      },
    );

    it(
      "rejects invalid pagination values",
      async () => {
        const app =
          createTestApp();

        const response =
          await request(
            app,
            "/api/content?page=abc",
          );

        expect(
          response.statusCode,
        ).toBe(400);

        expect(
          response.body.success,
        ).toBe(false);

        expect(
          response.body.error.code,
        ).toBe(
          "BAD_REQUEST",
        );
      },
    );

    it(
      "rejects a page outside the available range",
      async () => {
        repository.list.mockResolvedValue({
          items: mockContent,
          total: 3,
        });

        const app =
          createTestApp();

        const response =
          await request(
            app,
            "/api/content?page=4&limit=2",
          );

        expect(
          response.statusCode,
        ).toBe(400);

        expect(
          response.body.success,
        ).toBe(false);

        expect(
          response.body.error.code,
        ).toBe(
          "BAD_REQUEST",
        );
      },
    );
  },
);

function createTestApp() {
  const app =
    express();

  app.use(
    express.json(),
  );

  app.use(
    "/api",
    contentRoutes,
  );

  app.use(
    notFoundMiddleware,
  );

  app.use(
    errorMiddleware,
  );

  return app;
}

async function request(
  app: ReturnType<
    typeof createTestApp
  >,
  path: string,
): Promise<{
  statusCode: number;
  body: any;
}> {
  const server =
    app.listen(0);

  try {
    const address =
      server.address();

    if (
      !address ||
      typeof address ===
        "string"
    ) {
      throw new Error(
        "Unable to determine test server address.",
      );
    }

    const response =
      await fetch(
        `http://127.0.0.1:${address.port}${path}`,
      );

    const body =
      await response.json();

    return {
      statusCode:
        response.status,
      body,
    };
  } finally {
    await new Promise<void>(
      (
        resolve,
        reject,
      ) => {
        server.close(
          (error) => {
            if (error) {
              reject(error);
              return;
            }

            resolve();
          },
        );
      },
    );
  }
}
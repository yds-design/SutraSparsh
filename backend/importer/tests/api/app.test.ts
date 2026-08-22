import {
  describe,
  expect,
  it,
} from "vitest";

import { createApiApp } from "../../../../src/api/app.js";
describe(
  "M9.1 Backend API Foundation",
  () => {
    it(
      "creates the API application",
      () => {
        const app = createApiApp();

        expect(app).toBeDefined();
      },
    );

    it(
      "exposes the root endpoint",
      async () => {
        const app = createApiApp();

        const response = await request(
          app,
          "/",
        );

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
          success: true,
          service: "sutrasparsh-backend",
          status: "ok",
        });
      },
    );

    it(
      "exposes the health endpoint",
      async () => {
        const app = createApiApp();

        const response = await request(
          app,
          "/api/health",
        );

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.status).toBe(
          "ok",
        );
        expect(response.body.data.service).toBe(
          "sutrasparsh-backend",
        );
      },
    );

    it(
      "returns JSON for unknown routes",
      async () => {
        const app = createApiApp();

        const response = await request(
          app,
          "/api/does-not-exist",
        );

        expect(response.statusCode).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe(
          "NOT_FOUND",
        );
      },
    );
  },
);

async function request(
  app: ReturnType<typeof createApiApp>,
  path: string,
): Promise<{
  statusCode: number;
  body: any;
}> {
  const server = app.listen(0);

  try {
    const address = server.address();

    if (
      !address ||
      typeof address === "string"
    ) {
      throw new Error(
        "Unable to determine test server address.",
      );
    }

    const response = await fetch(
      `http://127.0.0.1:${address.port}${path}`,
    );

    const body = await response.json();

    return {
      statusCode: response.status,
      body,
    };
  } finally {
    await new Promise<void>(
      (resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      },
    );
  }
}
import {
  describe,
  expect,
  it,
} from "vitest";

import express from "express";

import { ApiError } from "../../../../src/api/errors/api.error.js";
import { errorMiddleware } from "../../../../src/api/middleware/error.middleware.js";

describe(
  "M9.1 API Error Handling",
  () => {
    it(
      "returns structured API errors",
      async () => {
        const app = express();

        app.get(
          "/test-error",
          () => {
            throw ApiError.badRequest(
              "Invalid test request.",
            );
          },
        );

        app.use(errorMiddleware);

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
            `http://127.0.0.1:${address.port}/test-error`,
          );

          const body = await response.json();

          expect(response.status).toBe(400);

          expect(body).toEqual({
            success: false,
            error: {
              code: "BAD_REQUEST",
              message:
                "Invalid test request.",
            },
          });
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
      },
    );

    it(
      "converts unknown errors into internal server errors",
      async () => {
        const app = express();

        app.get(
          "/unknown-error",
          () => {
            throw new Error(
              "Sensitive internal failure.",
            );
          },
        );

        app.use(errorMiddleware);

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
            `http://127.0.0.1:${address.port}/unknown-error`,
          );

          const body = await response.json();

          expect(response.status).toBe(500);

          expect(body.success).toBe(false);
          expect(
            body.error.code,
          ).toBe(
            "INTERNAL_SERVER_ERROR",
          );

          expect(
            body.error.message,
          ).toBe(
            "Internal server error.",
          );

          expect(
            JSON.stringify(body),
          ).not.toContain(
            "Sensitive internal failure.",
          );
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
      },
    );
  },
);
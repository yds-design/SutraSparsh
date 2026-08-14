import {
  describe,
  expect,
  it,
} from "vitest";

import {
  createImportExecutionSummary,
  type ImportExecutionSummary,
} from "../../src/observability/importer.execution-summary.js";

describe(
  "Import execution summary",
  () => {
    it(
      "creates a completed summary with execution duration",
      () => {
        const startedAt =
          new Date(
            "2026-08-14T07:00:00.000Z",
          );

        const now =
          new Date(
            "2026-08-14T07:00:01.250Z",
          );

        const summary =
          createImportExecutionSummary({
            jobId:
              "11111111-1111-4111-8111-111111111111",
            source: "json",
            startedAt,
            now,
            status: "completed",

            collected: 10,
            normalized: 9,
            written: 8,
            created: 5,
            updated: 2,
            unchanged: 1,
            verified: 8,
            retries: 2,
          });

        expect(summary).toEqual({
          jobId:
            "11111111-1111-4111-8111-111111111111",
          source: "json",
          status: "completed",
          durationMs: 1250,
          collected: 10,
          normalized: 9,
          written: 8,
          created: 5,
          updated: 2,
          unchanged: 1,
          verified: 8,
          retries: 2,
        });
      },
    );

    it(
      "defaults counters to zero",
      () => {
        const startedAt =
          new Date(
            "2026-08-14T07:00:00.000Z",
          );

        const summary =
          createImportExecutionSummary({
            jobId: "job-1",
            source: "manual",
            startedAt,
            now: startedAt,
            status: "completed",
          });

        expect(summary).toEqual({
          jobId: "job-1",
          source: "manual",
          status: "completed",
          durationMs: 0,
          collected: 0,
          normalized: 0,
          written: 0,
          created: 0,
          updated: 0,
          unchanged: 0,
          verified: 0,
          retries: 0,
        });
      },
    );

    it(
      "creates a failed summary with the original error",
      () => {
        const startedAt =
          new Date(
            "2026-08-14T07:00:00.000Z",
          );

        const now =
          new Date(
            "2026-08-14T07:00:02.500Z",
          );

        const summary =
          createImportExecutionSummary({
            jobId: "job-2",
            source: "json",
            startedAt,
            now,
            status: "failed",
            collected: 10,
            normalized: 10,
            retries: 3,
            error:
              "Firestore content batch write failed.",
          });

        expect(summary).toEqual({
          jobId: "job-2",
          source: "json",
          status: "failed",
          durationMs: 2500,
          collected: 10,
          normalized: 10,
          written: 0,
          created: 0,
          updated: 0,
          unchanged: 0,
          verified: 0,
          retries: 3,
          error:
            "Firestore content batch write failed.",
        });
      },
    );

    it(
      "does not produce a negative duration",
      () => {
        const startedAt =
          new Date(
            "2026-08-14T07:00:10.000Z",
          );

        const now =
          new Date(
            "2026-08-14T07:00:09.000Z",
          );

        const summary =
          createImportExecutionSummary({
            jobId: "job-3",
            source: "json",
            startedAt,
            now,
            status: "completed",
          });

        expect(
          summary.durationMs,
        ).toBe(0);
      },
    );
  },
);
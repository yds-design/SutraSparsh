import {
  describe,
  expect,
  it,
} from "vitest";

import {
  ImporterMetrics,
} from "../../src/observability/importer.metrics.js";

describe("ImporterMetrics", () => {
  it("starts with zero counters", () => {
    const metrics = new ImporterMetrics();

    expect(metrics.snapshot()).toMatchObject({
      collected: 0,
      normalized: 0,
      written: 0,
      created: 0,
      updated: 0,
      unchanged: 0,
      verified: 0,
      retries: 0,
    });
  });

  it("records execution metrics", () => {
    const metrics = new ImporterMetrics();

    metrics.setCollected(10);
    metrics.setNormalized(9);
    metrics.setWritten(8);
    metrics.setCreated(5);
    metrics.setUpdated(2);
    metrics.setUnchanged(1);
    metrics.setVerified(8);

    metrics.incrementRetries();
    metrics.incrementRetries();

    expect(metrics.snapshot()).toMatchObject({
      collected: 10,
      normalized: 9,
      written: 8,
      created: 5,
      updated: 2,
      unchanged: 1,
      verified: 8,
      retries: 2,
    });
  });

  it("records a non-negative duration", () => {
    const metrics = new ImporterMetrics();

    expect(
      metrics.snapshot().durationMs,
    ).toBeGreaterThanOrEqual(0);
  });
});
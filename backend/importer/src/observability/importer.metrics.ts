export interface ImporterMetricsSnapshot {
  collected: number;
  normalized: number;

  written: number;
  created: number;
  updated: number;
  unchanged: number;
  verified: number;

  retries: number;
  durationMs: number;
}

export class ImporterMetrics {
  private collected = 0;
  private normalized = 0;

  private written = 0;
  private created = 0;
  private updated = 0;
  private unchanged = 0;
  private verified = 0;

  private retries = 0;
  private durationMs = 0;

  setCollected(
    value: number,
  ): void {
    this.collected = Math.max(
      0,
      value,
    );
  }

  setNormalized(
    value: number,
  ): void {
    this.normalized = Math.max(
      0,
      value,
    );
  }

  setWritten(
    value: number,
  ): void {
    this.written = Math.max(
      0,
      value,
    );
  }

  setCreated(
    value: number,
  ): void {
    this.created = Math.max(
      0,
      value,
    );
  }

  setUpdated(
    value: number,
  ): void {
    this.updated = Math.max(
      0,
      value,
    );
  }

  setUnchanged(
    value: number,
  ): void {
    this.unchanged = Math.max(
      0,
      value,
    );
  }

  setVerified(
    value: number,
  ): void {
    this.verified = Math.max(
      0,
      value,
    );
  }

  setRetries(
    value: number,
  ): void {
    this.retries = Math.max(
      0,
      value,
    );
  }

  incrementRetries(): void {
    this.retries += 1;
  }

  setDuration(
    durationMs: number,
  ): void {
    this.durationMs = Math.max(
      0,
      durationMs,
    );
  }

  recordDuration(
    startedAt: Date,
    endedAt = new Date(),
  ): void {
    this.setDuration(
      endedAt.getTime() -
        startedAt.getTime(),
    );
  }

  snapshot(): ImporterMetricsSnapshot {
    return {
      collected:
        this.collected,

      normalized:
        this.normalized,

      written:
        this.written,

      created:
        this.created,

      updated:
        this.updated,

      unchanged:
        this.unchanged,

      verified:
        this.verified,

      retries:
        this.retries,

      durationMs:
        this.durationMs,
    };
  }

  reset(): void {
    this.collected = 0;
    this.normalized = 0;

    this.written = 0;
    this.created = 0;
    this.updated = 0;
    this.unchanged = 0;
    this.verified = 0;

    this.retries = 0;
    this.durationMs = 0;
  }
}

/**
 * Shared process-level metrics instance.
 *
 * Tests and isolated pipeline executions should normally
 * create their own ImporterMetrics instance.
 */
export const importerMetrics =
  new ImporterMetrics();
export interface ImportMetricsSnapshot {
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

  private startedAt = Date.now();

  setCollected(value: number): void {
    this.collected = value;
  }

  setNormalized(value: number): void {
    this.normalized = value;
  }

  setWritten(value: number): void {
    this.written = value;
  }

  setCreated(value: number): void {
    this.created = value;
  }

  setUpdated(value: number): void {
    this.updated = value;
  }

  setUnchanged(value: number): void {
    this.unchanged = value;
  }

  setVerified(value: number): void {
    this.verified = value;
  }

  incrementRetries(): void {
    this.retries += 1;
  }

  snapshot(): ImportMetricsSnapshot {
    return {
      collected: this.collected,
      normalized: this.normalized,
      written: this.written,
      created: this.created,
      updated: this.updated,
      unchanged: this.unchanged,
      verified: this.verified,
      retries: this.retries,
      durationMs: Date.now() - this.startedAt,
    };
  }
}
/**
 * SutraSparsh Performance Benchmark & Regression Test Suite (M18.6 / M18.7)
 * Measures P50, P95, P99 latencies, cache efficiency, search throughput,
 * and asserts against production latency baselines.
 */

import { searchEngine } from "../services/search-engine.service.js";
import { globalCache } from "../services/cache.service.js";
import { ContentRepository } from "../api/repositories/content.repository.js";

export interface BenchmarkMetrics {
  totalOperations: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  avgLatencyMs: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  operationsPerSecond: number;
}

export interface BenchmarkReport {
  timestamp: string;
  searchBenchmark: BenchmarkMetrics;
  contentFetchBenchmark: BenchmarkMetrics;
  autocompleteBenchmark: BenchmarkMetrics;
  cacheMetrics: {
    size: number;
    hits: number;
    misses: number;
    hitRatePercent: number;
  };
  regressionCheck: {
    searchP95ThresholdMs: number;
    searchP95ActualMs: number;
    readP95ThresholdMs: number;
    readP95ActualMs: number;
    passed: boolean;
  };
}

export class PerformanceBenchmarker {
  private static calculatePercentiles(latencies: number[]): BenchmarkMetrics {
    if (latencies.length === 0) {
      return {
        totalOperations: 0,
        p50LatencyMs: 0,
        p95LatencyMs: 0,
        p99LatencyMs: 0,
        avgLatencyMs: 0,
        minLatencyMs: 0,
        maxLatencyMs: 0,
        operationsPerSecond: 0,
      };
    }

    const sorted = [...latencies].sort((a, b) => a - b);
    const total = sorted.length;
    const sum = sorted.reduce((a, b) => a + b, 0);

    const p50 = sorted[Math.floor(total * 0.5)];
    const p95 = sorted[Math.floor(total * 0.95)];
    const p99 = sorted[Math.floor(total * 0.99)];
    const min = sorted[0];
    const max = sorted[total - 1];
    const avg = sum / total;

    return {
      totalOperations: total,
      p50LatencyMs: Number(p50.toFixed(2)),
      p95LatencyMs: Number(p95.toFixed(2)),
      p99LatencyMs: Number(p99.toFixed(2)),
      avgLatencyMs: Number(avg.toFixed(2)),
      minLatencyMs: Number(min.toFixed(2)),
      maxLatencyMs: Number(max.toFixed(2)),
      operationsPerSecond: Number(((total / (sum / 1000)) || 1000).toFixed(1)),
    };
  }

  public static async runBenchmark(): Promise<BenchmarkReport> {
    const repository = new ContentRepository();
    const searchQueries = ["karma", "yoga", "mind", "gita", "meditation", "brahman", "duty", "om"];

    // 1. Search Engine Benchmark (100 iterations)
    const searchLatencies: number[] = [];
    for (let i = 0; i < 100; i++) {
      const q = searchQueries[i % searchQueries.length];
      const start = performance.now();
      searchEngine.search(q, 20);
      searchLatencies.push(performance.now() - start);
    }

    // 2. Autocomplete Benchmark (100 iterations)
    const autocompleteLatencies: number[] = [];
    for (let i = 0; i < 100; i++) {
      const prefix = searchQueries[i % searchQueries.length].substring(0, 3);
      const start = performance.now();
      searchEngine.autocomplete(prefix, 5);
      autocompleteLatencies.push(performance.now() - start);
    }

    // 3. Content Fetch / Cache Benchmark (100 iterations)
    const fetchLatencies: number[] = [];
    const verseIds = ["gita-2-47", "gita-2-48", "yoga-sutra-1-2", "maha-mrityunjaya"];
    for (let i = 0; i < 100; i++) {
      const id = verseIds[i % verseIds.length];
      const start = performance.now();
      await repository.getById(id);
      fetchLatencies.push(performance.now() - start);
    }

    const searchMetrics = this.calculatePercentiles(searchLatencies);
    const autocompleteMetrics = this.calculatePercentiles(autocompleteLatencies);
    const fetchMetrics = this.calculatePercentiles(fetchLatencies);

    const SEARCH_P95_THRESHOLD = 50.0; // 50ms baseline threshold
    const READ_P95_THRESHOLD = 30.0;   // 30ms baseline threshold

    const regressionPassed =
      searchMetrics.p95LatencyMs <= SEARCH_P95_THRESHOLD &&
      fetchMetrics.p95LatencyMs <= READ_P95_THRESHOLD;

    return {
      timestamp: new Date().toISOString(),
      searchBenchmark: searchMetrics,
      autocompleteBenchmark: autocompleteMetrics,
      contentFetchBenchmark: fetchMetrics,
      cacheMetrics: {
        size: globalCache.getMetrics().size,
        hits: globalCache.getMetrics().hits,
        misses: globalCache.getMetrics().misses,
        hitRatePercent: globalCache.getMetrics().hitRate,
      },
      regressionCheck: {
        searchP95ThresholdMs: SEARCH_P95_THRESHOLD,
        searchP95ActualMs: searchMetrics.p95LatencyMs,
        readP95ThresholdMs: READ_P95_THRESHOLD,
        readP95ActualMs: fetchMetrics.p95LatencyMs,
        passed: regressionPassed,
      },
    };
  }
}

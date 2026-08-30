/**
 * SutraSparsh Multi-Tier High Performance In-Memory Cache
 * Provides LRU eviction, TTL expiration, and hit/miss telemetry.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  lastAccessed: number;
}

export class CacheService {
  private store: Map<string, CacheEntry<unknown>> = new Map();
  private maxItems: number;
  private defaultTtlMs: number;
  private hits = 0;
  private misses = 0;

  constructor(maxItems = 500, defaultTtlMs = 60 * 1000) {
    this.maxItems = maxItems;
    this.defaultTtlMs = defaultTtlMs;
  }

  public get<T>(key: string): T | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) {
      this.misses++;
      return null;
    }

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.store.delete(key);
      this.misses++;
      return null;
    }

    entry.lastAccessed = now;
    this.hits++;
    return entry.value;
  }

  public set<T>(key: string, value: T, ttlMs?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttlMs ?? this.defaultTtlMs);

    // Evict least recently used if capacity is reached
    if (this.store.size >= this.maxItems && !this.store.has(key)) {
      this.evictLru();
    }

    this.store.set(key, {
      value,
      expiresAt,
      lastAccessed: now,
    });
  }

  public async getOrCompute<T>(
    key: string,
    computeFn: () => Promise<T>,
    ttlMs?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const computed = await computeFn();
    this.set(key, computed, ttlMs);
    return computed;
  }

  public invalidate(keyPattern?: string): void {
    if (!keyPattern) {
      this.store.clear();
      return;
    }

    for (const key of this.store.keys()) {
      if (key.includes(keyPattern)) {
        this.store.delete(key);
      }
    }
  }

  private evictLru(): void {
    let oldestKey: string | null = null;
    let oldestAccess = Infinity;

    for (const [key, entry] of this.store.entries()) {
      if (entry.lastAccessed < oldestAccess) {
        oldestAccess = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.store.delete(oldestKey);
    }
  }

  public getMetrics() {
    const total = this.hits + this.misses;
    const hitRate = total === 0 ? 1.0 : this.hits / total;
    return {
      size: this.store.size,
      maxItems: this.maxItems,
      hits: this.hits,
      misses: this.misses,
      hitRate: Number((hitRate * 100).toFixed(2)),
    };
  }
}

export const globalCache = new CacheService(1000, 5 * 60 * 1000); // 5 minutes TTL

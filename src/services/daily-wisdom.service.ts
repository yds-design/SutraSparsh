import { useState, useEffect } from "react";
import {
  VERSES_DATABASE,
  getDailyShlokaForDate,
  type DetailedVerse,
} from "../data/scriptureCorpus.js";

/**
 * Storage keys for persistent daily wisdom caching
 */
const STORAGE_KEY_SELECTED = "sutrasparsh_daily_wisdom_selected";
const STORAGE_KEY_PREFIX = "sutrasparsh_daily_wisdom_";

type WisdomListener = (wisdom: DetailedVerse, offset: number) => void;

/**
 * DailyWisdomService
 * Single Source of Truth (SSOT) managing daily wisdom selection, state persistence,
 * and data synchronization across "Take a moment with today's wisdom" and
 * "SutraSparsh Discovery • Look Closer" deep-dive flows.
 */
export class DailyWisdomService {
  private static instance: DailyWisdomService;
  private currentWisdom: DetailedVerse;
  private currentOffset: number = 0;
  private listeners: Set<WisdomListener> = new Set();

  private constructor() {
    this.currentWisdom = this.initializeFromStorageOrDate();
  }

  public static getInstance(): DailyWisdomService {
    if (!DailyWisdomService.instance) {
      DailyWisdomService.instance = new DailyWisdomService();
    }
    return DailyWisdomService.instance;
  }

  /**
   * Generates a date-anchored key in local timezone (YYYY-MM-DD)
   */
  public getTodayKey(offsetDays: number = 0): string {
    const d = new Date();
    if (offsetDays !== 0) {
      d.setDate(d.getDate() + offsetDays);
    }
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  /**
   * Initializes state from localStorage cache if available for today; otherwise computes seeded verse.
   */
  private initializeFromStorageOrDate(): DetailedVerse {
    const todayKey = this.getTodayKey(0);
    const dateSpecificKey = `${STORAGE_KEY_PREFIX}${todayKey}`;

    if (typeof window !== "undefined") {
      try {
        // 1. Try date-specific cache
        const cachedDate = localStorage.getItem(dateSpecificKey);
        if (cachedDate) {
          const parsed = JSON.parse(cachedDate);
          if (parsed && parsed.id && VERSES_DATABASE[parsed.id]) {
            return VERSES_DATABASE[parsed.id];
          }
          if (parsed && parsed.sanskrit) {
            return parsed;
          }
        }

        // 2. Try last selected wisdom
        const cachedSelected = localStorage.getItem(STORAGE_KEY_SELECTED);
        if (cachedSelected) {
          const parsed = JSON.parse(cachedSelected);
          if (parsed && parsed.dateKey === todayKey && parsed.verse) {
            return parsed.verse;
          }
        }
      } catch (e) {
        console.warn("[DailyWisdomService] Cache read warning:", e);
      }
    }

    // Single source of truth calculation for today
    const fallback = getDailyShlokaForDate(new Date());
    this.persistToStorage(fallback, 0);
    return fallback;
  }

  /**
   * Persists wisdom to client-side localStorage
   */
  private persistToStorage(verse: DetailedVerse, offset: number): void {
    if (typeof window === "undefined") return;
    try {
      const dateKey = this.getTodayKey(offset);
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${dateKey}`, JSON.stringify(verse));
      localStorage.setItem(
        STORAGE_KEY_SELECTED,
        JSON.stringify({
          dateKey,
          offset,
          verseId: verse.id,
          verse,
          updatedAt: new Date().toISOString(),
        })
      );
    } catch (e) {
      console.warn("[DailyWisdomService] Cache write warning:", e);
    }
  }

  /**
   * Returns the currently active daily wisdom shloka (SSOT)
   */
  public getActiveWisdom(): DetailedVerse {
    return this.currentWisdom;
  }

  /**
   * Returns the current date offset (0 = today, -1 = yesterday, 1 = tomorrow)
   */
  public getCurrentOffset(): number {
    return this.currentOffset;
  }

  /**
   * Explicitly updates the active wisdom shloka (e.g. when user navigates Prev/Next or selects a date)
   */
  public setActiveWisdom(verse: DetailedVerse, offset: number = 0): void {
    this.currentWisdom = verse;
    this.currentOffset = offset;
    this.persistToStorage(verse, offset);
    this.notifyListeners();
  }

  /**
   * Sets the date offset and recalculates the deterministic daily shloka
   */
  public setDateOffset(offset: number): DetailedVerse {
    this.currentOffset = offset;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + offset);
    const resolved = getDailyShlokaForDate(targetDate);
    this.currentWisdom = resolved;
    this.persistToStorage(resolved, offset);
    this.notifyListeners();
    return resolved;
  }

  /**
   * Alias for setDateOffset
   */
  public setOffset(offset: number): DetailedVerse {
    return this.setDateOffset(offset);
  }

  /**
   * Subscribes a listener to daily wisdom state changes
   */
  public subscribe(listener: WisdomListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.currentWisdom, this.currentOffset);
      } catch (err) {
        console.error("[DailyWisdomService] Listener error:", err);
      }
    });
  }

  /**
   * Fetches daily wisdom from backend endpoint /api/v1/wisdom/daily (with graceful offline fallback)
   */
  public async fetchDailyFromApi(date?: string, offset?: number): Promise<DetailedVerse> {
    try {
      const params = new URLSearchParams();
      if (date) params.set("date", date);
      if (typeof offset === "number") params.set("offset", String(offset));

      const res = await fetch(`/api/v1/wisdom/daily?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          this.setActiveWisdom(json.data, offset || 0);
          return json.data;
        }
      }
    } catch {
      // Offline fallback: Use local deterministic calculation
    }
    return this.getActiveWisdom();
  }
}

export const dailyWisdomService = DailyWisdomService.getInstance();

/**
 * React hook to consume synchronized Daily Wisdom state
 */
export function useDailyWisdom() {
  const [dailyWisdom, setDailyWisdomState] = useState<DetailedVerse>(() =>
    dailyWisdomService.getActiveWisdom()
  );
  const [dateOffset, setDateOffsetState] = useState<number>(() =>
    dailyWisdomService.getCurrentOffset()
  );

  useEffect(() => {
    // Sync initial state
    setDailyWisdomState(dailyWisdomService.getActiveWisdom());
    setDateOffsetState(dailyWisdomService.getCurrentOffset());

    const unsubscribe = dailyWisdomService.subscribe((wisdom, offset) => {
      setDailyWisdomState(wisdom);
      setDateOffsetState(offset);
    });
    return unsubscribe;
  }, []);

  const setOffset = (offsetOrUpdater: number | ((prev: number) => number)) => {
    const nextOffset =
      typeof offsetOrUpdater === "function"
        ? offsetOrUpdater(dailyWisdomService.getCurrentOffset())
        : offsetOrUpdater;
    dailyWisdomService.setDateOffset(nextOffset);
  };

  const setWisdom = (verse: DetailedVerse, offset: number = 0) => {
    dailyWisdomService.setActiveWisdom(verse, offset);
  };

  return {
    dailyWisdom,
    dateOffset,
    setOffset,
    setWisdom,
    activeShlokaId: dailyWisdom.id,
  };
}

/**
 * Daily Reading Goal Service
 * Allows users to set and track a daily scriptural study goal (minutes of study or number of verses).
 * Initial default: 15 minutes/day.
 * Seamlessly integrates with StreakFireCounter, ProgressService, and user settings.
 */

import { ProgressService } from "./progress.service";

export type DailyGoalMetric = "minutes" | "verses";

export interface DailyGoalConfig {
  metric: DailyGoalMetric;
  targetMinutes: number; // default: 15 mins/day
  targetVerses: number; // default: 5 verses/day
  autoCheckinOnGoalMet: boolean; // automatically record streak check-in when goal is achieved
}

export interface DailyGoalProgress {
  date: string; // YYYY-MM-DD
  secondsStudied: number;
  minutesStudied: number;
  versesRead: number;
  readVerseIds: string[];
  isGoalMet: boolean;
  metric: DailyGoalMetric;
  target: number;
  current: number;
  percentage: number;
  timeRemainingSeconds: number;
  lastUpdated: number;
}

const CONFIG_STORAGE_KEY = "sutrasparsh_daily_goal_config_v1";
const PROGRESS_STORAGE_KEY = "sutrasparsh_daily_goal_progress_v1";

const DEFAULT_CONFIG: DailyGoalConfig = {
  metric: "minutes",
  targetMinutes: 15,
  targetVerses: 5,
  autoCheckinOnGoalMet: true,
};

function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export class DailyGoalService {
  private static instance: DailyGoalService;
  private config: DailyGoalConfig;
  private progress: DailyGoalProgress;
  private listeners: Set<(progress: DailyGoalProgress, config: DailyGoalConfig) => void> = new Set();
  private trackerInterval: NodeJS.Timeout | null = null;
  private isWindowActive = true;
  private isRecitingActive = false;

  private constructor() {
    this.config = this.loadConfig();
    this.progress = this.loadProgress();
    this.setupWindowListeners();
    this.startActiveTracker();
  }

  public static getInstance(): DailyGoalService {
    if (!DailyGoalService.instance) {
      DailyGoalService.instance = new DailyGoalService();
    }
    return DailyGoalService.instance;
  }

  private loadConfig(): DailyGoalConfig {
    try {
      const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULT_CONFIG,
          ...parsed,
          // Ensure valid numbers
          targetMinutes: Math.max(1, Number(parsed.targetMinutes) || 15),
          targetVerses: Math.max(1, Number(parsed.targetVerses) || 5),
          metric: parsed.metric === "verses" ? "verses" : "minutes",
        };
      }
    } catch {
      // ignore
    }
    return { ...DEFAULT_CONFIG };
  }

  private loadProgress(): DailyGoalProgress {
    const today = getTodayDateString();
    try {
      const stored = localStorage.getItem(PROGRESS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.date === today) {
          const seconds = Math.max(0, Number(parsed.secondsStudied) || 0);
          const minutes = Math.floor(seconds / 60);
          const verseIds = Array.isArray(parsed.readVerseIds) ? parsed.readVerseIds : [];
          const versesCount = Math.max(verseIds.length, Number(parsed.versesRead) || 0);

          return this.computeDerived(
            today,
            seconds,
            versesCount,
            verseIds,
            this.config
          );
        }
      }
    } catch {
      // ignore
    }

    // Default fresh day progress:
    // To give users an initial encouraging start on their first session of the day,
    // if there is existing reading progress in progressService today, we seed accordingly
    return this.computeDerived(today, 0, 0, [], this.config);
  }

  private computeDerived(
    date: string,
    secondsStudied: number,
    versesRead: number,
    readVerseIds: string[],
    config: DailyGoalConfig
  ): DailyGoalProgress {
    const minutesStudied = Math.floor(secondsStudied / 60);
    const metric = config.metric;
    const target = metric === "minutes" ? config.targetMinutes : config.targetVerses;
    const current = metric === "minutes" ? minutesStudied : versesRead;
    
    // For minutes, calculate percentage smoothly using total seconds so fractional minutes smoothly fill the bar
    let percentage = 0;
    if (metric === "minutes") {
      const targetSec = config.targetMinutes * 60;
      percentage = targetSec > 0 ? Math.min(100, Math.round((secondsStudied / targetSec) * 100)) : 0;
    } else {
      percentage = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
    }
    const isGoalMet = metric === "minutes" ? secondsStudied >= config.targetMinutes * 60 : current >= target;

    const targetSeconds = config.targetMinutes * 60;
    const timeRemainingSeconds = Math.max(0, targetSeconds - secondsStudied);

    return {
      date,
      secondsStudied,
      minutesStudied,
      versesRead,
      readVerseIds,
      isGoalMet,
      metric,
      target,
      current,
      percentage,
      timeRemainingSeconds,
      lastUpdated: Date.now(),
    };
  }

  private saveConfig(): void {
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(this.config));
    } catch {
      // ignore
    }
  }

  private saveProgress(): void {
    try {
      localStorage.setItem(
        PROGRESS_STORAGE_KEY,
        JSON.stringify({
          date: this.progress.date,
          secondsStudied: this.progress.secondsStudied,
          versesRead: this.progress.versesRead,
          readVerseIds: this.progress.readVerseIds,
          lastUpdated: this.progress.lastUpdated,
        })
      );
    } catch {
      // ignore
    }
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn(this.progress, this.config));
  }

  private setupWindowListeners(): void {
    if (typeof window === "undefined") return;

    window.addEventListener("focus", () => {
      this.isWindowActive = true;
    });

    window.addEventListener("blur", () => {
      // Keep tracking if audio recitation is actively playing
      if (!this.isRecitingActive) {
        this.isWindowActive = false;
      }
    });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        this.isWindowActive = true;
      } else if (!this.isRecitingActive) {
        this.isWindowActive = false;
      }
    });

    window.addEventListener("sutrasparsh:recitation_state", (e: Event) => {
      const customEvent = e as CustomEvent<{ isPlaying: boolean }>;
      this.isRecitingActive = Boolean(customEvent.detail?.isPlaying);
    });
  }

  private startActiveTracker(): void {
    if (typeof window === "undefined") return;
    if (this.trackerInterval) clearInterval(this.trackerInterval);

    // Tick every 1 second when active
    this.trackerInterval = setInterval(() => {
      const today = getTodayDateString();
      if (this.progress.date !== today) {
        // New calendar day roll-over!
        this.progress = this.computeDerived(today, 0, 0, [], this.config);
        this.saveProgress();
        this.notify();
        return;
      }

      // If window is active or recitation is in progress, accumulate study seconds
      if (this.isWindowActive || this.isRecitingActive) {
        this.recordStudySeconds(1);
      }
    }, 1000);
  }

  public getGoalConfig(): DailyGoalConfig {
    return { ...this.config };
  }

  public setGoalConfig(updates: Partial<DailyGoalConfig>): DailyGoalConfig {
    const prevMet = this.progress.isGoalMet;
    this.config = {
      ...this.config,
      ...updates,
      targetMinutes: updates.targetMinutes ? Math.max(1, Number(updates.targetMinutes)) : this.config.targetMinutes,
      targetVerses: updates.targetVerses ? Math.max(1, Number(updates.targetVerses)) : this.config.targetVerses,
      metric: updates.metric || this.config.metric,
    };
    this.saveConfig();

    // Recompute progress with new config
    this.progress = this.computeDerived(
      this.progress.date,
      this.progress.secondsStudied,
      this.progress.versesRead,
      this.progress.readVerseIds,
      this.config
    );
    this.saveProgress();

    // Check if goal just got met with the new threshold
    if (!prevMet && this.progress.isGoalMet) {
      this.onGoalAchieved();
    }

    this.notify();

    // Broadcast global custom event
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("sutrasparsh:daily_goal_config_changed", {
          detail: { config: this.config, progress: this.progress },
        })
      );
    }

    return { ...this.config };
  }

  public getDailyProgress(): DailyGoalProgress {
    const today = getTodayDateString();
    if (this.progress.date !== today) {
      this.progress = this.computeDerived(today, 0, 0, [], this.config);
      this.saveProgress();
    }
    return { ...this.progress };
  }

  public recordStudySeconds(seconds: number): DailyGoalProgress {
    if (seconds <= 0) return this.getDailyProgress();

    const today = getTodayDateString();
    let currentSeconds = this.progress.secondsStudied;
    let verses = this.progress.versesRead;
    let ids = this.progress.readVerseIds;

    if (this.progress.date !== today) {
      currentSeconds = 0;
      verses = 0;
      ids = [];
    }

    const wasGoalMet = this.progress.isGoalMet;
    const newSeconds = currentSeconds + seconds;

    this.progress = this.computeDerived(today, newSeconds, verses, ids, this.config);
    this.saveProgress();

    if (!wasGoalMet && this.progress.isGoalMet) {
      this.onGoalAchieved();
    }

    // Debounce listener notifications for frequent 1s ticks to avoid excess re-renders
    // Notify on minute changes or goal milestone or every 5 seconds
    if (
      this.progress.secondsStudied % 5 === 0 ||
      this.progress.secondsStudied % 60 === 0 ||
      (!wasGoalMet && this.progress.isGoalMet)
    ) {
      this.notify();
    }

    return { ...this.progress };
  }

  public recordVerseRead(verseId: string): DailyGoalProgress {
    if (!verseId) return this.getDailyProgress();

    const today = getTodayDateString();
    let currentSeconds = this.progress.secondsStudied;
    let ids = [...this.progress.readVerseIds];

    if (this.progress.date !== today) {
      currentSeconds = 0;
      ids = [];
    }

    if (!ids.includes(verseId)) {
      ids.push(verseId);
    }

    const wasGoalMet = this.progress.isGoalMet;
    const versesCount = ids.length;

    this.progress = this.computeDerived(today, currentSeconds, versesCount, ids, this.config);
    this.saveProgress();

    if (!wasGoalMet && this.progress.isGoalMet) {
      this.onGoalAchieved();
    }

    this.notify();

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("sutrasparsh:verse_read_recorded", {
          detail: { verseId, totalToday: versesCount },
        })
      );
    }

    return { ...this.progress };
  }

  public addManualStudyMinutes(minutes: number): DailyGoalProgress {
    return this.recordStudySeconds(minutes * 60);
  }

  public resetTodayProgress(): DailyGoalProgress {
    const today = getTodayDateString();
    this.progress = this.computeDerived(today, 0, 0, [], this.config);
    this.saveProgress();
    this.notify();
    return { ...this.progress };
  }

  private onGoalAchieved(): void {
    // 1. If configured, trigger streak checkin via ProgressService
    if (this.config.autoCheckinOnGoalMet) {
      try {
        ProgressService.getInstance().recordDailyCheckin();
      } catch (e) {
        console.warn("Could not record daily checkin on goal completion", e);
      }
    }

    // 2. Dispatch achievement celebration event
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("sutrasparsh:daily_goal_achieved", {
          detail: {
            progress: this.progress,
            config: this.config,
          },
        })
      );
    }
  }

  public setRecitingActive(active: boolean): void {
    this.isRecitingActive = active;
  }

  public subscribe(
    listener: (progress: DailyGoalProgress, config: DailyGoalConfig) => void
  ): () => void {
    this.listeners.add(listener);
    listener(this.getDailyProgress(), this.getGoalConfig());
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const dailyGoalService = DailyGoalService.getInstance();

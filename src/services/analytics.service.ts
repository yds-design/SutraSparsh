/**
 * SutraSparsh Privacy-Friendly Analytics Service (#19)
 *
 * Strictly gated by ConsentService: ZERO telemetry or analytics scripts load or fire
 * until the user explicitly opts into analytics cookies/storage.
 *
 * Supports custom TTS & navigation events:
 * - page_view
 * - tts_synthesize
 * - tts_playback_complete
 * - verse_view
 */

import { consentService } from "./consent.service.js";

export type AnalyticsEventName =
  | "page_view"
  | "tts_synthesize"
  | "tts_playback_complete"
  | "verse_view"
  | "search_query";

export interface AnalyticsEventRecord {
  name: AnalyticsEventName;
  params: Record<string, string | number | boolean>;
  timestamp: string;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const SESSION_EVENTS_KEY = "sutrasparsh_analytics_session_log";

class AnalyticsService {
  private initialized = false;
  private eventLog: AnalyticsEventRecord[] = [];

  constructor() {
    if (typeof window !== "undefined") {
      consentService.subscribe((prefs) => {
        if (prefs.analytics) {
          this.initializeIfPermitted();
        } else {
          this.clearSessionTelemetry();
        }
      });

      if (consentService.hasAnalyticsConsent()) {
        this.initializeIfPermitted();
      }
    }
  }

  public isEnabled(): boolean {
    return consentService.hasAnalyticsConsent();
  }

  public initializeIfPermitted(): boolean {
    if (!consentService.hasAnalyticsConsent()) {
      return false;
    }
    if (this.initialized) return true;
    this.initialized = true;

    const measurementId =
      typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_GA4_MEASUREMENT_ID
        ? String((import.meta as any).env.VITE_GA4_MEASUREMENT_ID).trim()
        : "";

    if (
      measurementId &&
      typeof document !== "undefined" &&
      !document.getElementById("sutrasparsh-ga4-script")
    ) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag(...args: unknown[]) {
        window.dataLayer?.push(args);
      };
      window.gtag("js", new Date());
      window.gtag("config", measurementId, {
        anonymize_ip: true,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
      });

      const script = document.createElement("script");
      script.id = "sutrasparsh-ga4-script";
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
      document.head.appendChild(script);
    }

    return true;
  }

  public trackEvent(
    name: AnalyticsEventName,
    params: Record<string, string | number | boolean> = {}
  ): boolean {
    if (!consentService.hasAnalyticsConsent()) {
      return false;
    }

    this.initializeIfPermitted();

    const sanitizedParams: Record<string, string | number | boolean> = {};
    for (const [key, val] of Object.entries(params)) {
      if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") {
        sanitizedParams[key] = typeof val === "string" ? val.slice(0, 120) : val;
      }
    }

    const record: AnalyticsEventRecord = {
      name,
      params: sanitizedParams,
      timestamp: new Date().toISOString(),
    };

    this.eventLog = [...this.eventLog.slice(-49), record];

    if (typeof window !== "undefined") {
      if (typeof window.gtag === "function") {
        window.gtag("event", name, sanitizedParams);
      }
      try {
        window.sessionStorage?.setItem(SESSION_EVENTS_KEY, JSON.stringify(this.eventLog));
      } catch {
        // Ignore storage errors
      }
    }

    return true;
  }

  public trackPageView(path: string, title?: string): boolean {
    return this.trackEvent("page_view", {
      page_path: path,
      page_title: title || (typeof document !== "undefined" ? document.title : "SutraSparsh"),
    });
  }

  public trackTtsSynthesize(params: {
    provider: string;
    language: string;
    characterCount: number;
    cached?: boolean;
  }): boolean {
    return this.trackEvent("tts_synthesize", {
      provider: params.provider,
      language: params.language,
      character_count: params.characterCount,
      cached: Boolean(params.cached),
    });
  }

  public trackTtsPlaybackComplete(params: {
    provider: string;
    language: string;
    durationMs: number;
  }): boolean {
    return this.trackEvent("tts_playback_complete", {
      provider: params.provider,
      language: params.language,
      duration_ms: params.durationMs,
    });
  }

  public getRecordedEvents(): AnalyticsEventRecord[] {
    return [...this.eventLog];
  }

  public clearSessionTelemetry(): void {
    this.eventLog = [];
    this.initialized = false;
    if (typeof window !== "undefined") {
      try {
        window.sessionStorage?.removeItem(SESSION_EVENTS_KEY);
      } catch {
        // Ignore
      }
    }
  }
}

export const analyticsService = new AnalyticsService();

/**
 * SutraSparsh Cookie & Telemetry Consent Service (#4, #19)
 *
 * Implements explicit opt-in consent management compliant with India DPDP Act 2023 & GDPR.
 * Strictly blocks all non-essential analytics or telemetry until the user explicitly grants consent.
 */

export interface ConsentPreferences {
  essential: true; // Always required for app state, preferences, and audio caching
  analytics: boolean; // Non-essential privacy-friendly usage & TTS telemetry
  updatedAt: string | null;
  version: string;
}

const CONSENT_STORAGE_KEY = "sutrasparsh_cookie_consent_v1";
const CONSENT_VERSION = "2026.1";

const DEFAULT_CONSENT: ConsentPreferences = {
  essential: true,
  analytics: false,
  updatedAt: null,
  version: CONSENT_VERSION,
};

type ConsentListener = (prefs: ConsentPreferences) => void;

class ConsentService {
  private listeners = new Set<ConsentListener>();

  public getPreferences(): ConsentPreferences {
    if (typeof window === "undefined" || !window.localStorage) {
      return { ...DEFAULT_CONSENT };
    }
    try {
      const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
      if (!raw) return { ...DEFAULT_CONSENT };
      const parsed = JSON.parse(raw);
      return {
        essential: true,
        analytics: Boolean(parsed?.analytics),
        updatedAt: typeof parsed?.updatedAt === "string" ? parsed.updatedAt : null,
        version: typeof parsed?.version === "string" ? parsed.version : CONSENT_VERSION,
      };
    } catch {
      return { ...DEFAULT_CONSENT };
    }
  }

  public hasResponded(): boolean {
    return this.getPreferences().updatedAt !== null;
  }

  public hasAnalyticsConsent(): boolean {
    const prefs = this.getPreferences();
    return prefs.updatedAt !== null && prefs.analytics === true;
  }

  public savePreferences(analytics: boolean): ConsentPreferences {
    const next: ConsentPreferences = {
      essential: true,
      analytics: Boolean(analytics),
      updatedAt: new Date().toISOString(),
      version: CONSENT_VERSION,
    };

    if (typeof window !== "undefined" && window.localStorage) {
      try {
        window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore quota errors
      }
    }

    this.notify(next);
    return next;
  }

  public acceptAll(): ConsentPreferences {
    return this.savePreferences(true);
  }

  public rejectNonEssential(): ConsentPreferences {
    return this.savePreferences(false);
  }

  public resetConsent(): void {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        window.localStorage.removeItem(CONSENT_STORAGE_KEY);
      } catch {
        // Ignore
      }
    }
    this.notify({ ...DEFAULT_CONSENT });
  }

  public openPreferencesModal(): void {
    if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
      window.dispatchEvent(new CustomEvent("sutrasparsh:open_cookie_preferences"));
    }
  }

  public subscribe(listener: ConsentListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(prefs: ConsentPreferences): void {
    this.listeners.forEach((cb) => {
      try {
        cb(prefs);
      } catch {
        // Ignore listener errors
      }
    });
    if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
      window.dispatchEvent(new CustomEvent("sutrasparsh:consent_updated", { detail: prefs }));
    }
  }
}

export const consentService = new ConsentService();

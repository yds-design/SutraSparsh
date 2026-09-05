import { useState, useEffect } from "react";
import type { PlatformFeatureFlag } from "../types/admin";
import { adminAuthService } from "./admin-auth.service";

export const FEATURE_FLAG_STORAGE_KEY = "sutrasparsh_feature_flags_v2";
export const FEATURE_FLAGS_CHANGED_EVENT = "sutrasparsh_feature_flags_changed";

export const DEFAULT_FEATURE_FLAGS: PlatformFeatureFlag[] = [
  {
    id: "flag-sadhaka-access",
    name: "Sādhaka Sacred Membership & Premium Access (Phase 2)",
    description: "Controls Sādhaka membership badges, upgrade buttons, corpus access gates, and pricing modals across all devices. Disabled by default for Phase 1.",
    enabled: false, // Default: DISABLED from all devices (Phase 1)
    environment: "ALL",
    targetTiers: ["SADHAKA", "RISHI"],
  },
  {
    id: "flag-gurudakshina",
    name: "Sacred Gurudakshina & Seva 80G Tax Exemption (Phase 2)",
    description: "Controls sacred Gurudakshina donation portals, seva cards, 80G tax receipt actions, and donation modals across all devices. Disabled by default for Phase 1.",
    enabled: false, // Default: DISABLED from all devices (Phase 1)
    environment: "ALL",
    targetTiers: ["FREE", "SADHAKA", "RISHI"],
  },
  {
    id: "flag-sanskrit-tts",
    name: "Native Speech Synthesis (TTS Safety Engine)",
    description: "Enables fallback client-side Sanskrit chant pronunciation engine for all users.",
    enabled: true,
    environment: "ALL",
    targetTiers: ["FREE", "SADHAKA", "RISHI"],
  },
  {
    id: "flag-offline-master-chants",
    name: "Offline Master Chanting Audio Cache (IndexedDB)",
    description: "Allows Sādhaka and Rishi subscribers to store full audio tracks offline.",
    enabled: true,
    environment: "ALL",
    targetTiers: ["SADHAKA", "RISHI"],
  },
  {
    id: "flag-80g-instant-receipts",
    name: "Instant 80G Tax Exemption Digital PDF Receipts",
    description: "Automatically generates and cryptographically signs Vedic donation receipts.",
    enabled: true,
    environment: "ALL",
    targetTiers: ["FREE", "SADHAKA", "RISHI"],
  },
  {
    id: "flag-advanced-etymology-lens",
    name: "Paninian Sanskrit Root Etymology & Dhatu Visualizer",
    description: "Deep morphological breakdown of sacred compound words for researchers.",
    enabled: true,
    environment: "ALL",
    targetTiers: ["RISHI"],
  },
];

class FeatureFlagsService {
  private flags: PlatformFeatureFlag[] = [];
  private listeners: Set<(flags: PlatformFeatureFlag[]) => void> = new Set();

  constructor() {
    this.flags = this.loadFlags();

    if (typeof window !== "undefined") {
      window.addEventListener("storage", (e) => {
        if (e.key === FEATURE_FLAG_STORAGE_KEY) {
          this.flags = this.loadFlags();
          this.notify();
        }
      });
      window.addEventListener(FEATURE_FLAGS_CHANGED_EVENT, () => {
        this.flags = this.loadFlags();
        this.notify();
      });
    }
  }

  private loadFlags(): PlatformFeatureFlag[] {
    if (typeof window === "undefined") {
      return [...DEFAULT_FEATURE_FLAGS];
    }

    try {
      const stored = localStorage.getItem(FEATURE_FLAG_STORAGE_KEY);
      if (stored) {
        const parsed: PlatformFeatureFlag[] = JSON.parse(stored);
        // Merge with defaults to ensure all required flags exist
        const flagMap = new Map(parsed.map((f) => [f.id, f]));
        return DEFAULT_FEATURE_FLAGS.map((def) => {
          const found = flagMap.get(def.id);
          return found ? { ...def, enabled: found.enabled } : def;
        });
      }
    } catch {
      // Fallback
    }

    return [...DEFAULT_FEATURE_FLAGS];
  }

  private saveFlags(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(FEATURE_FLAG_STORAGE_KEY, JSON.stringify(this.flags));
      window.dispatchEvent(new CustomEvent(FEATURE_FLAGS_CHANGED_EVENT));
    } catch {
      // Ignore storage quota
    }
  }

  private notify(): void {
    const current = this.getFlags();
    this.listeners.forEach((listener) => {
      try {
        listener(current);
      } catch {
        // Listener error
      }
    });
  }

  public getFlags(): PlatformFeatureFlag[] {
    return [...this.flags];
  }

  public isFeatureEnabled(flagId: string): boolean {
    const flag = this.flags.find((f) => f.id === flagId);
    return flag ? flag.enabled : false;
  }

  /**
   * Sādhaka Sacred Membership: Phase 2 Feature
   * Disabled by default on all devices. Can be toggled on/off in Admin Console.
   */
  public isSadhakaEnabled(): boolean {
    return this.isFeatureEnabled("flag-sadhaka-access");
  }

  /**
   * Sacred Gurudakshina & Seva: Phase 2 Feature
   * Disabled by default on all devices. Can be toggled on/off in Admin Console.
   */
  public isGurudakshinaEnabled(): boolean {
    return this.isFeatureEnabled("flag-gurudakshina");
  }

  public setFlag(flagId: string, enabled: boolean): void {
    this.flags = this.flags.map((f) => (f.id === flagId ? { ...f, enabled } : f));
    this.saveFlags();
    this.notify();

    // Audit log
    try {
      adminAuthService.logAudit(
        "settings",
        "TOGGLE_FEATURE_FLAG",
        `Toggled feature flag '${flagId}' to ${enabled}`,
        { flagId, newState: enabled }
      );
    } catch {
      // Ignore audit failure if adminAuthService is uninitialized
    }
  }

  public resetToPhase1Defaults(): void {
    this.flags = this.flags.map((f) => {
      if (f.id === "flag-sadhaka-access" || f.id === "flag-gurudakshina") {
        return { ...f, enabled: false };
      }
      return f;
    });
    this.saveFlags();
    this.notify();

    try {
      adminAuthService.logAudit(
        "settings",
        "RESET_FEATURE_FLAGS",
        "Reset Sādhaka and Gurudakshina to Phase 1 disabled defaults"
      );
    } catch {
      // Ignore
    }
  }

  public activatePhase2Monetization(): void {
    this.flags = this.flags.map((f) => {
      if (f.id === "flag-sadhaka-access" || f.id === "flag-gurudakshina") {
        return { ...f, enabled: true };
      }
      return f;
    });
    this.saveFlags();
    this.notify();

    try {
      adminAuthService.logAudit(
        "settings",
        "ACTIVATE_PHASE_2",
        "Activated Sādhaka Access and Gurudakshina for Phase 2"
      );
    } catch {
      // Ignore
    }
  }

  public subscribe(callback: (flags: PlatformFeatureFlag[]) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }
}

export const featureFlagsService = new FeatureFlagsService();

/**
 * React Hook for consuming live feature flags across any component or device
 */
export function useFeatureFlags() {
  const [flags, setFlags] = useState<PlatformFeatureFlag[]>(() => featureFlagsService.getFlags());

  useEffect(() => {
    return featureFlagsService.subscribe((updated) => {
      setFlags(updated);
    });
  }, []);

  return {
    flags,
    isSadhakaEnabled: featureFlagsService.isSadhakaEnabled(),
    isGurudakshinaEnabled: featureFlagsService.isGurudakshinaEnabled(),
    isFeatureEnabled: (id: string) => featureFlagsService.isFeatureEnabled(id),
    setFlag: (id: string, enabled: boolean) => featureFlagsService.setFlag(id, enabled),
    resetToPhase1Defaults: () => featureFlagsService.resetToPhase1Defaults(),
    activatePhase2Monetization: () => featureFlagsService.activatePhase2Monetization(),
  };
}

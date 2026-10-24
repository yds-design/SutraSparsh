/**
 * Theme Restriction & Configuration Service
 * Enforces strict whitelist policy: Parchment Dawn ('light') & Golden Hour ('golden-hour')
 * Reads from global config.json with secure fallback to 'Parchment Dawn'
 * Provides Admin Role override capability for dynamic theme management
 */

import configData from "../config.json";
import { authService, type SeekerUser } from "./auth.service";
import { type AppTheme } from "../types";

export interface PermittedThemeMeta {
  id: "light" | "golden-hour";
  name: string;
  sanskrit: string;
  description: string;
  icon: string;
}

export interface ThemeConfigSchema {
  themeSettings: {
    defaultTheme: "light" | "golden-hour";
    fallbackTheme: "light";
    permittedThemes: PermittedThemeMeta[];
    adminOverrideEnabled: boolean;
  };
}

const STORAGE_KEYS = {
  ACTIVE_THEME: "sutrasparsh_theme",
  ADMIN_OVERRIDE_THEME: "sutrasparsh_admin_theme_override",
};

export class ThemeConfigService {
  private static instance: ThemeConfigService;
  private config: ThemeConfigSchema;
  private listeners: Set<(theme: AppTheme) => void> = new Set();

  private constructor() {
    this.config = this.loadConfig();
  }

  public static getInstance(): ThemeConfigService {
    if (!ThemeConfigService.instance) {
      ThemeConfigService.instance = new ThemeConfigService();
    }
    return ThemeConfigService.instance;
  }

  private loadConfig(): ThemeConfigSchema {
    try {
      if (configData && configData.themeSettings) {
        return configData as ThemeConfigSchema;
      }
    } catch (e) {
      console.warn("Could not parse config.json, using strict hardcoded fallback:", e);
    }

    return {
      themeSettings: {
        defaultTheme: "light",
        fallbackTheme: "light",
        permittedThemes: [
          {
            id: "light",
            name: "Parchment Dawn",
            sanskrit: "चन्दन एवं पत्र",
            description: "Calm morning light with off-white parchment and deep ochre",
            icon: "☀️",
          },
          {
            id: "golden-hour",
            name: "Golden Hour",
            sanskrit: "गोधूलि वेला",
            description: "Sacred sunset glow with burnt honey and radiant dusk warmth",
            icon: "🌅",
          },
        ],
        adminOverrideEnabled: true,
      },
    };
  }

  /**
   * Returns list of permitted theme IDs read from config.json.
   * Strictly limited to 'light' (Parchment Dawn) and 'golden-hour' (Golden Hour).
   */
  public getPermittedThemeIds(): ("light" | "golden-hour")[] {
    return this.config.themeSettings.permittedThemes.map((t) => t.id);
  }

  /**
   * Returns rich metadata for all permitted themes.
   */
  public getPermittedThemes(): PermittedThemeMeta[] {
    return [...this.config.themeSettings.permittedThemes];
  }

  /**
   * Checks whether a given theme string is explicitly permitted.
   */
  public isThemePermitted(theme: string | null | undefined): boolean {
    if (!theme) return false;
    const permitted = this.getPermittedThemeIds();
    return permitted.includes(theme as any);
  }

  /**
   * Secure fallback: Returns the supplied theme if permitted;
   * otherwise defaults securely to 'light' ('Parchment Dawn').
   */
  public sanitizeTheme(theme: string | null | undefined): AppTheme {
    if (theme && this.isThemePermitted(theme)) {
      return theme as AppTheme;
    }
    return this.config.themeSettings.fallbackTheme || "light";
  }

  /**
   * Cycle next permitted theme (toggles strictly between Parchment Dawn and Golden Hour).
   */
  public getNextPermittedTheme(currentTheme: AppTheme): AppTheme {
    const sanitized = this.sanitizeTheme(currentTheme);
    return sanitized === "light" ? "golden-hour" : "light";
  }

  /**
   * Get active theme from localStorage with secure fallback.
   */
  public getActiveTheme(): AppTheme {
    try {
      if (typeof localStorage !== "undefined") {
        // First check if an admin override is active
        const adminOverride = localStorage.getItem(STORAGE_KEYS.ADMIN_OVERRIDE_THEME);
        if (adminOverride && this.isThemePermitted(adminOverride)) {
          return adminOverride as AppTheme;
        }

        const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_THEME);
        return this.sanitizeTheme(stored);
      }
    } catch {
      // fallback
    }
    return "light";
  }

  /**
   * Set active theme, strictly enforcing whitelist validation.
   */
  public setActiveTheme(theme: AppTheme): AppTheme {
    const sanitized = this.sanitizeTheme(theme);
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_THEME, sanitized);
      }
    } catch {}
    this.notify(sanitized);
    return sanitized;
  }

  /**
   * Admin Role Override: Allows administrators to dynamically toggle
   * or manage themes across the application.
   */
  public adminOverrideTheme(
    targetTheme: AppTheme,
    user?: SeekerUser | null
  ): { success: boolean; activeTheme: AppTheme; message: string } {
    const currentUser = user !== undefined ? user : authService.getCurrentUser();
    const isAdmin =
      currentUser?.email?.includes("admin") ||
      currentUser?.email === "vishal.kr.gupta@gmail.com" ||
      (typeof localStorage !== "undefined" &&
        Boolean(localStorage.getItem("sutrasparsh_admin_key")));

    if (!isAdmin) {
      return {
        success: false,
        activeTheme: this.getActiveTheme(),
        message: "Permission denied: Admin role required to override theme policy.",
      };
    }

    const sanitized = this.sanitizeTheme(targetTheme);
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.ADMIN_OVERRIDE_THEME, sanitized);
        localStorage.setItem(STORAGE_KEYS.ACTIVE_THEME, sanitized);
      }
    } catch {}

    this.notify(sanitized);
    return {
      success: true,
      activeTheme: sanitized,
      message: `Theme successfully updated to '${sanitized === "light" ? "Parchment Dawn" : "Golden Hour"}' by Administrator.`,
    };
  }

  /**
   * Clear admin override and revert to user preferred theme within whitelist.
   */
  public clearAdminOverride(): void {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem(STORAGE_KEYS.ADMIN_OVERRIDE_THEME);
      }
    } catch {}
    const active = this.getActiveTheme();
    this.notify(active);
  }

  public subscribe(listener: (theme: AppTheme) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(theme: AppTheme): void {
    this.listeners.forEach((l) => {
      try {
        l(theme);
      } catch (err) {
        console.error("Error in theme listener callback:", err);
      }
    });
  }
}

export const themeConfigService = ThemeConfigService.getInstance();

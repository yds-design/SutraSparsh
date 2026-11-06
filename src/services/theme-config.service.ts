/**
 * Theme Restriction & Configuration Service with Unified ThemeObserver Pattern
 * Enforces strict whitelist policy: Parchment Dawn ('light') & Golden Hour ('golden-hour')
 * Reads from global config.json with secure fallback to 'Parchment Dawn'
 * Provides Admin Role override capability for dynamic theme management
 * Guarantees 'Parchment Dawn' and 'Golden Hour' CSS classes are applied globally
 * and instantly to the document root (<html> and <body>) upon any navigation event.
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

/**
 * Standard CSS classes guaranteed for Parchment Dawn
 */
export const PARCHMENT_DAWN_CLASSES = [
  "theme-light",
  "light-mode",
  "theme-parchment-dawn",
  "parchment-dawn",
] as const;

/**
 * Standard CSS classes guaranteed for Golden Hour
 */
export const GOLDEN_HOUR_CLASSES = [
  "theme-golden-hour",
  "golden-hour-mode",
  "theme-golden",
  "golden-hour",
] as const;

/**
 * Superset of all theme classes across current and deprecated themes
 * for pristine cleanup when switching themes or navigating.
 */
export const ALL_THEME_CLASSES = [
  ...PARCHMENT_DAWN_CLASSES,
  ...GOLDEN_HOUR_CLASSES,
  "theme-sandstone",
  "theme-amethyst",
  "theme-festival",
  "theme-prism-pulse",
] as const;

export type NavigationThemeEvent =
  | "popstate"
  | "hashchange"
  | "pushState"
  | "replaceState"
  | "tab_navigation"
  | "pageshow"
  | "visibilitychange"
  | "mutation_repair"
  | "manual";

/**
 * Unified ThemeObserver Pattern
 * Actively monitors and enforces global document root theme classes and attributes.
 * Reacts instantly to browser navigation events (back/forward popstate, pushState,
 * replaceState, hashchange, tab changes, visibility transitions) and DOM mutations.
 */
export class ThemeObserver {
  private static instance: ThemeObserver;
  private isObserving = false;
  private isApplying = false;
  private mutationObserver: MutationObserver | null = null;
  private originalPushState: typeof window.history.pushState | null = null;
  private originalReplaceState: typeof window.history.replaceState | null = null;
  private lastAppliedTheme: AppTheme | null = null;
  private unsubscribeService: (() => void) | null = null;
  private navigationListeners: Set<(event: { type: NavigationThemeEvent; theme: AppTheme }) => void> = new Set();

  private constructor() {
    // Singleton pattern
  }

  public static getInstance(): ThemeObserver {
    if (!ThemeObserver.instance) {
      ThemeObserver.instance = new ThemeObserver();
    }
    return ThemeObserver.instance;
  }

  /**
   * Returns list of classes applied for a given theme.
   */
  public getAppliedClasses(theme: AppTheme): string[] {
    const sanitized = themeConfigService.sanitizeTheme(theme);
    if (sanitized === "golden-hour") {
      return [...GOLDEN_HOUR_CLASSES];
    }
    return [...PARCHMENT_DAWN_CLASSES];
  }

  /**
   * Applies the theme CSS classes and attributes globally and instantly
   * to document.documentElement (<html>) and document.body (<body>).
   */
  public applyTheme(
    targetTheme?: AppTheme,
    sourceEvent: NavigationThemeEvent = "manual"
  ): AppTheme {
    const theme = themeConfigService.sanitizeTheme(
      targetTheme || themeConfigService.getActiveTheme()
    );

    if (typeof document === "undefined") {
      this.lastAppliedTheme = theme;
      return theme;
    }

    this.isApplying = true;
    try {
      const isLight = theme === "light";
      const classesToAdd = this.getAppliedClasses(theme);
      const classesToRemove = isLight ? GOLDEN_HOUR_CLASSES : PARCHMENT_DAWN_CLASSES;

      const elements = [document.documentElement, document.body].filter(Boolean);

      elements.forEach((el) => {
        // Remove opposing and legacy classes
        classesToRemove.forEach((cls) => el.classList.remove(cls));
        ALL_THEME_CLASSES.forEach((cls) => {
          if (!classesToAdd.includes(cls as any)) {
            el.classList.remove(cls);
          }
        });

        // Add verified current theme classes
        classesToAdd.forEach((cls) => {
          if (!el.classList.contains(cls)) {
            el.classList.add(cls);
          }
        });

        // Sync core data-attributes
        el.setAttribute("data-theme", theme);
        el.setAttribute("data-atmosphere", isLight ? "parchment-dawn" : "golden-hour");
        el.setAttribute("data-theme-name", isLight ? "Parchment Dawn" : "Golden Hour");
        el.setAttribute("data-navigation-theme-synced", "true");
      });

      // Sync CSS color-scheme
      if (document.documentElement && document.documentElement.style) {
        document.documentElement.style.colorScheme = isLight ? "light" : "dark";
      }

      // Sync browser UI theme-color meta tag for mobile status bar
      try {
        let metaTheme = document.querySelector('meta[name="theme-color"]');
        if (!metaTheme) {
          metaTheme = document.createElement("meta");
          metaTheme.setAttribute("name", "theme-color");
          document.head.appendChild(metaTheme);
        }
        metaTheme.setAttribute("content", isLight ? "#FBF8EE" : "#18110B");
      } catch {}

      this.lastAppliedTheme = theme;

      // Dispatch global window event for components that need reactivity
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("sutrasparsh:theme_applied", {
            detail: {
              theme,
              classes: classesToAdd,
              source: sourceEvent,
              timestamp: Date.now(),
            },
          })
        );
      }

      // Notify external navigation theme listeners
      this.navigationListeners.forEach((listener) => {
        try {
          listener({ type: sourceEvent, theme });
        } catch (err) {
          console.error("Error in theme navigation listener:", err);
        }
      });
    } finally {
      this.isApplying = false;
    }

    return theme;
  }

  /**
   * Re-applies the currently active theme instantly.
   * Called during navigation transitions (popstate, pushState, replaceState, hashchange).
   */
  public reapplyCurrentTheme(sourceEvent: NavigationThemeEvent = "manual"): AppTheme {
    return this.applyTheme(themeConfigService.getActiveTheme(), sourceEvent);
  }

  /**
   * Validates whether document root elements currently reflect the active theme classes.
   * If any class or attribute was stripped by DOM operations, instantly repairs it.
   */
  public verifyRootIntegrity(): boolean {
    if (typeof document === "undefined") return true;

    const currentTheme = themeConfigService.getActiveTheme();
    const expectedClasses = this.getAppliedClasses(currentTheme);

    const docRoot = document.documentElement;
    const body = document.body;

    const rootMissing = expectedClasses.some((cls) => !docRoot.classList.contains(cls));
    const rootAttrWrong = docRoot.getAttribute("data-theme") !== currentTheme;
    const bodyMissing = body && expectedClasses.some((cls) => !body.classList.contains(cls));

    if (rootMissing || rootAttrWrong || bodyMissing) {
      this.applyTheme(currentTheme, "mutation_repair");
      return false; // Repaired
    }

    return true; // Intact
  }

  /**
   * Starts active observation across all navigation events, history changes, and DOM mutations.
   */
  public start(): void {
    if (this.isObserving) return;
    if (typeof window === "undefined" || typeof document === "undefined") return;

    this.isObserving = true;

    // 1. Intercept History API (pushState & replaceState) for single-page routing navigations
    try {
      const historyObj = window.history;
      if (historyObj && typeof historyObj.pushState === "function") {
        this.originalPushState = historyObj.pushState.bind(historyObj);
        const originalPush = this.originalPushState;
        historyObj.pushState = (...args: Parameters<History["pushState"]>) => {
          try {
            originalPush(...args);
          } catch (e) {
            // Silently handle iframes with restricted History permissions
          }
          this.reapplyCurrentTheme("pushState");
        };
      }

      if (historyObj && typeof historyObj.replaceState === "function") {
        this.originalReplaceState = historyObj.replaceState.bind(historyObj);
        const originalReplace = this.originalReplaceState;
        historyObj.replaceState = (...args: Parameters<History["replaceState"]>) => {
          try {
            originalReplace(...args);
          } catch (e) {
            // Silently handle iframes with restricted History permissions
          }
          this.reapplyCurrentTheme("replaceState");
        };
      }
    } catch (e) {
      console.warn("Could not monkey-patch history API for ThemeObserver:", e);
    }

    // 2. Register Navigation Event Listeners
    window.addEventListener("popstate", this.handlePopState);
    window.addEventListener("hashchange", this.handleHashChange);
    window.addEventListener("pageshow", this.handlePageShow);
    document.addEventListener("visibilitychange", this.handleVisibilityChange);

    // Custom app navigation events
    window.addEventListener("sutrasparsh:navigate", this.handleCustomNavigation as EventListener);
    window.addEventListener("sutrasparsh:tab_changed", this.handleCustomNavigation as EventListener);

    // 3. Setup MutationObserver on documentElement to guard against class stripping
    try {
      if (typeof MutationObserver !== "undefined" && document.documentElement) {
        let debounceTimer: any = null;
        this.mutationObserver = new MutationObserver((mutations) => {
          if (this.isApplying) return;
          for (const mutation of mutations) {
            if (
              mutation.type === "attributes" &&
              (mutation.attributeName === "class" || mutation.attributeName === "data-theme")
            ) {
              if (debounceTimer) clearTimeout(debounceTimer);
              debounceTimer = setTimeout(() => {
                if (!this.isApplying) {
                  this.verifyRootIntegrity();
                }
              }, 40);
              break;
            }
          }
        });

        this.mutationObserver.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ["class", "data-theme"],
        });
      }
    } catch (e) {
      console.warn("Could not initialize MutationObserver for ThemeObserver:", e);
    }

    // 4. Subscribe to ThemeConfigService changes
    this.unsubscribeService = themeConfigService.subscribe((theme) => {
      this.applyTheme(theme, "manual");
    });

    // 5. Instantly apply theme to guarantee document root is correctly styled
    this.reapplyCurrentTheme("manual");
  }

  /**
   * Stops observation and restores original history methods.
   */
  public stop(): void {
    if (!this.isObserving) return;
    this.isObserving = false;

    if (typeof window !== "undefined") {
      window.removeEventListener("popstate", this.handlePopState);
      window.removeEventListener("hashchange", this.handleHashChange);
      window.removeEventListener("pageshow", this.handlePageShow);
      window.removeEventListener("sutrasparsh:navigate", this.handleCustomNavigation as EventListener);
      window.removeEventListener("sutrasparsh:tab_changed", this.handleCustomNavigation as EventListener);

      if (this.originalPushState) {
        window.history.pushState = this.originalPushState;
        this.originalPushState = null;
      }
      if (this.originalReplaceState) {
        window.history.replaceState = this.originalReplaceState;
        this.originalReplaceState = null;
      }
    }

    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    }

    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }

    if (this.unsubscribeService) {
      this.unsubscribeService();
      this.unsubscribeService = null;
    }
  }

  public isThemeObserverActive(): boolean {
    return this.isObserving;
  }

  public onNavigation(
    callback: (event: { type: NavigationThemeEvent; theme: AppTheme }) => void
  ): () => void {
    this.navigationListeners.add(callback);
    return () => {
      this.navigationListeners.delete(callback);
    };
  }

  private handlePopState = () => {
    this.reapplyCurrentTheme("popstate");
  };

  private handleHashChange = () => {
    this.reapplyCurrentTheme("hashchange");
  };

  private handlePageShow = () => {
    this.reapplyCurrentTheme("pageshow");
  };

  private handleVisibilityChange = () => {
    if (typeof document !== "undefined" && document.visibilityState === "visible") {
      this.reapplyCurrentTheme("visibilitychange");
    }
  };

  private handleCustomNavigation = () => {
    this.reapplyCurrentTheme("tab_navigation");
  };
}

/**
 * Singleton theme configuration service
 */
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
   * Set active theme, strictly enforcing whitelist validation and
   * applying classes globally to document root via ThemeObserver.
   */
  public setActiveTheme(theme: AppTheme): AppTheme {
    const sanitized = this.sanitizeTheme(theme);
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_THEME, sanitized);
      }
    } catch {}

    // Apply globally and instantly via ThemeObserver
    ThemeObserver.getInstance().applyTheme(sanitized, "manual");

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

    // Apply globally and instantly via ThemeObserver
    ThemeObserver.getInstance().applyTheme(sanitized, "manual");

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
    ThemeObserver.getInstance().applyTheme(active, "manual");
    this.notify(active);
  }

  /**
   * Returns the unified ThemeObserver instance.
   */
  public getThemeObserver(): ThemeObserver {
    return ThemeObserver.getInstance();
  }

  /**
   * Guarantees current or specified theme classes are applied to the document root.
   */
  public applyThemeToDocument(theme?: AppTheme): AppTheme {
    return ThemeObserver.getInstance().applyTheme(theme);
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
export const themeObserver = ThemeObserver.getInstance();

// Auto-start ThemeObserver in browser environments to guarantee theme styling upon any navigation event
if (typeof window !== "undefined" && typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      themeObserver.start();
    });
  } else {
    themeObserver.start();
  }
}

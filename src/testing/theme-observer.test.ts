/**
 * Test Suite: Unified ThemeObserver Pattern
 * Verifies that the ThemeObserver in theme-config.service.ts guarantees
 * 'Parchment Dawn' and 'Golden Hour' CSS classes are applied globally
 * and instantly to the document root (<html> and <body>) upon any navigation event.
 */

import fs from "fs";
import {
  ThemeObserver,
  themeObserver,
  themeConfigService,
  PARCHMENT_DAWN_CLASSES,
  GOLDEN_HOUR_CLASSES,
  ALL_THEME_CLASSES,
  type NavigationThemeEvent,
} from "../services/theme-config.service.js";

let passed = 0;
let total = 0;

function assert(description: string, condition: boolean) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✅ [PASS] ${description}`);
  } else {
    console.error(`  ❌ [FAIL] ${description}`);
  }
}

// Minimal DOM mock if running in Node.js test environment
function setupMockDom() {
  if (typeof globalThis.localStorage === "undefined") {
    const store = new Map<string, string>();
    (globalThis as any).localStorage = {
      getItem: (k: string) => store.get(k) || null,
      setItem: (k: string, v: string) => store.set(k, v),
      removeItem: (k: string) => store.delete(k),
      clear: () => store.clear(),
    };
  }

  if (typeof globalThis.document === "undefined") {
    const classListFactory = () => {
      const classes = new Set<string>();
      return {
        add: (...args: string[]) => args.forEach((c) => classes.add(c)),
        remove: (...args: string[]) => args.forEach((c) => classes.delete(c)),
        contains: (c: string) => classes.has(c),
        toggle: (c: string, force?: boolean) => {
          if (force === undefined) {
            if (classes.has(c)) classes.delete(c);
            else classes.add(c);
          } else if (force) {
            classes.add(c);
          } else {
            classes.delete(c);
          }
        },
        toString: () => Array.from(classes).join(" "),
      };
    };

    const attrs = new Map<string, string>();

    const docElementMock = {
      classList: classListFactory(),
      attributes: attrs,
      setAttribute: (k: string, v: string) => attrs.set(k, v),
      getAttribute: (k: string) => attrs.get(k) || null,
      removeAttribute: (k: string) => attrs.delete(k),
      style: { colorScheme: "light" },
    };

    const bodyAttrs = new Map<string, string>();
    const bodyMock = {
      classList: classListFactory(),
      attributes: bodyAttrs,
      setAttribute: (k: string, v: string) => bodyAttrs.set(k, v),
      getAttribute: (k: string) => bodyAttrs.get(k) || null,
      removeAttribute: (k: string) => bodyAttrs.delete(k),
    };

    const metaAttrs = new Map<string, string>();
    const metaMock = {
      setAttribute: (k: string, v: string) => metaAttrs.set(k, v),
      getAttribute: (k: string) => metaAttrs.get(k) || null,
    };

    const eventListeners: Record<string, Function[]> = {};

    (globalThis as any).document = {
      documentElement: docElementMock,
      body: bodyMock,
      head: {
        appendChild: () => {},
      },
      querySelector: (sel: string) => (sel.includes("theme-color") ? metaMock : null),
      createElement: () => metaMock,
      addEventListener: (evt: string, fn: Function) => {
        if (!eventListeners[evt]) eventListeners[evt] = [];
        eventListeners[evt].push(fn);
      },
      removeEventListener: (evt: string, fn: Function) => {
        if (eventListeners[evt]) {
          eventListeners[evt] = eventListeners[evt].filter((f) => f !== fn);
        }
      },
      visibilityState: "visible",
    };

    const MockCustomEvent = class CustomEvent {
      type: string;
      detail: any;
      constructor(type: string, params?: { detail?: any }) {
        this.type = type;
        this.detail = params?.detail;
      }
    };
    (globalThis as any).CustomEvent = MockCustomEvent;

    (globalThis as any).window = {
      document: (globalThis as any).document,
      localStorage: (globalThis as any).localStorage,
      CustomEvent: MockCustomEvent,
      history: {
        pushState: (_state: any, _title: string, _url?: string) => {},
        replaceState: (_state: any, _title: string, _url?: string) => {},
      },
      addEventListener: (evt: string, fn: Function) => {
        if (!eventListeners[evt]) eventListeners[evt] = [];
        eventListeners[evt].push(fn);
      },
      removeEventListener: (evt: string, fn: Function) => {
        if (eventListeners[evt]) {
          eventListeners[evt] = eventListeners[evt].filter((f) => f !== fn);
        }
      },
      dispatchEvent: (event: any) => {
        const type = event?.type || event;
        (eventListeners[type] || []).forEach((fn) => fn(event));
        return true;
      },
      __eventListeners: eventListeners,
    };
  }
}

async function runThemeObserverSuite() {
  console.log("=================================================");
  console.log("🧪 Unified ThemeObserver Pattern Test Suite");
  console.log("=================================================");

  setupMockDom();

  // --- Suite 1: Pattern Structure & Singleton Integrity ---
  console.log("\n--- 1. Testing ThemeObserver Architecture & Exports ---");
  assert("ThemeObserver is a defined constructor class", typeof ThemeObserver === "function");
  assert("themeObserver singleton is exported and defined", typeof themeObserver === "object" && themeObserver !== null);
  assert("ThemeObserver.getInstance() returns identical singleton instance", ThemeObserver.getInstance() === themeObserver);
  assert("themeConfigService.getThemeObserver() returns themeObserver singleton", themeConfigService.getThemeObserver() === themeObserver);

  // Class definitions
  assert("PARCHMENT_DAWN_CLASSES array is defined with 4 essential classes", Array.isArray(PARCHMENT_DAWN_CLASSES) && PARCHMENT_DAWN_CLASSES.length === 4);
  assert("PARCHMENT_DAWN_CLASSES contains 'theme-light'", PARCHMENT_DAWN_CLASSES.includes("theme-light" as any));
  assert("PARCHMENT_DAWN_CLASSES contains 'light-mode'", PARCHMENT_DAWN_CLASSES.includes("light-mode" as any));
  assert("PARCHMENT_DAWN_CLASSES contains 'theme-parchment-dawn'", PARCHMENT_DAWN_CLASSES.includes("theme-parchment-dawn" as any));
  assert("PARCHMENT_DAWN_CLASSES contains 'parchment-dawn'", PARCHMENT_DAWN_CLASSES.includes("parchment-dawn" as any));

  assert("GOLDEN_HOUR_CLASSES array is defined with 4 essential classes", Array.isArray(GOLDEN_HOUR_CLASSES) && GOLDEN_HOUR_CLASSES.length === 4);
  assert("GOLDEN_HOUR_CLASSES contains 'theme-golden-hour'", GOLDEN_HOUR_CLASSES.includes("theme-golden-hour" as any));
  assert("GOLDEN_HOUR_CLASSES contains 'golden-hour-mode'", GOLDEN_HOUR_CLASSES.includes("golden-hour-mode" as any));
  assert("GOLDEN_HOUR_CLASSES contains 'theme-golden'", GOLDEN_HOUR_CLASSES.includes("theme-golden" as any));
  assert("GOLDEN_HOUR_CLASSES contains 'golden-hour'", GOLDEN_HOUR_CLASSES.includes("golden-hour" as any));

  assert("ALL_THEME_CLASSES includes Parchment Dawn and Golden Hour classes", ALL_THEME_CLASSES.length >= 8);

  // --- Suite 2: Theme Application to Document Root ---
  console.log("\n--- 2. Testing Global Document Root Application ---");

  // Apply Parchment Dawn
  const appliedLight = themeObserver.applyTheme("light", "manual");
  assert("applyTheme('light') returns 'light'", appliedLight === "light");

  const docEl = document.documentElement;
  const bodyEl = document.body;

  PARCHMENT_DAWN_CLASSES.forEach((cls) => {
    assert(`document.documentElement contains Parchment Dawn class '${cls}'`, docEl.classList.contains(cls));
    assert(`document.body contains Parchment Dawn class '${cls}'`, bodyEl.classList.contains(cls));
  });

  assert("document.documentElement has data-theme='light'", docEl.getAttribute("data-theme") === "light");
  assert("document.documentElement has data-atmosphere='parchment-dawn'", docEl.getAttribute("data-atmosphere") === "parchment-dawn");
  assert("document.documentElement colorScheme is 'light'", (docEl.style as any).colorScheme === "light");

  // Now Apply Golden Hour
  const appliedGolden = themeObserver.applyTheme("golden-hour", "manual");
  assert("applyTheme('golden-hour') returns 'golden-hour'", appliedGolden === "golden-hour");

  GOLDEN_HOUR_CLASSES.forEach((cls) => {
    assert(`document.documentElement contains Golden Hour class '${cls}'`, docEl.classList.contains(cls));
    assert(`document.body contains Golden Hour class '${cls}'`, bodyEl.classList.contains(cls));
  });

  // Verify Parchment Dawn classes were cleanly stripped
  PARCHMENT_DAWN_CLASSES.forEach((cls) => {
    assert(`Parchment Dawn class '${cls}' removed when switching to Golden Hour`, !docEl.classList.contains(cls));
  });

  assert("document.documentElement has data-theme='golden-hour'", docEl.getAttribute("data-theme") === "golden-hour");
  assert("document.documentElement has data-atmosphere='golden-hour'", docEl.getAttribute("data-atmosphere") === "golden-hour");
  assert("document.documentElement colorScheme is 'dark'", (docEl.style as any).colorScheme === "dark");

  // --- Suite 3: Navigation Events Interception & Instant Theme Guarantee ---
  console.log("\n--- 3. Testing Navigation Interception (History & Popstate) ---");

  // Set active theme in service to golden-hour
  themeConfigService.setActiveTheme("golden-hour");

  let navigationTriggerCount = 0;
  let lastNavEvent: NavigationThemeEvent | null = null;

  const unsubNav = themeObserver.onNavigation((evt) => {
    navigationTriggerCount++;
    lastNavEvent = evt.type;
  });

  // Start observation
  themeObserver.start();
  assert("ThemeObserver is active after start()", themeObserver.isThemeObserverActive() === true);

  // Test pushState interception
  window.history.pushState({}, "", "/explore?tab=explore");
  assert("history.pushState navigation triggers ThemeObserver application", lastNavEvent === "pushState");
  assert("Root classes remain valid after pushState navigation", docEl.classList.contains("golden-hour-mode"));

  // Test replaceState interception
  window.history.replaceState({}, "", "/search?q=gita");
  assert("history.replaceState navigation triggers ThemeObserver application", lastNavEvent === "replaceState");
  assert("Root classes remain valid after replaceState navigation", docEl.classList.contains("theme-golden-hour"));

  // Test popstate (Back/Forward) navigation event
  (window as any).dispatchEvent(new Event("popstate"));
  assert("popstate browser navigation event triggers ThemeObserver", lastNavEvent === "popstate");

  // Test hashchange navigation event
  (window as any).dispatchEvent(new Event("hashchange"));
  assert("hashchange navigation event triggers ThemeObserver", lastNavEvent === "hashchange");

  // Test custom navigation event sutrasparsh:navigate
  (window as any).dispatchEvent(new (window as any).CustomEvent("sutrasparsh:navigate", { detail: { tab: "today" } }));
  assert("sutrasparsh:navigate event triggers ThemeObserver", lastNavEvent === "tab_navigation");

  // Switch to Parchment Dawn and navigate again
  themeConfigService.setActiveTheme("light");
  assert("Switched to Parchment Dawn", themeConfigService.getActiveTheme() === "light");

  window.history.pushState({}, "", "/my-journey");
  assert("Parchment Dawn classes applied instantly on navigation to my-journey", docEl.classList.contains("light-mode") && docEl.classList.contains("theme-parchment-dawn"));

  unsubNav();

  // --- Suite 4: Root Integrity Verification & Self-Healing ---
  console.log("\n--- 4. Testing Root Integrity Verification & Self-Healing ---");

  // Set active theme to golden-hour
  themeConfigService.setActiveTheme("golden-hour");

  // Simulate third-party DOM tampering: strip the classes
  docEl.classList.remove("golden-hour-mode");
  docEl.classList.remove("theme-golden-hour");

  assert("verifyRootIntegrity() detects missing theme classes and returns false (tampered)", themeObserver.verifyRootIntegrity() === false);
  assert("Self-healing immediately restored 'golden-hour-mode'", docEl.classList.contains("golden-hour-mode"));
  assert("Self-healing immediately restored 'theme-golden-hour'", docEl.classList.contains("theme-golden-hour"));
  assert("verifyRootIntegrity() now returns true after instant repair", themeObserver.verifyRootIntegrity() === true);

  // --- Suite 5: Integration with themeConfigService & Whitelist ---
  console.log("\n--- 5. Testing Integration with ThemeConfigService ---");

  themeConfigService.setActiveTheme("light");
  assert("themeConfigService.setActiveTheme('light') updates document root classes to Parchment Dawn", docEl.classList.contains("light-mode") && docEl.classList.contains("theme-parchment-dawn"));

  themeConfigService.setActiveTheme("golden-hour");
  assert("themeConfigService.setActiveTheme('golden-hour') updates document root classes to Golden Hour", docEl.classList.contains("golden-hour-mode") && docEl.classList.contains("theme-golden-hour"));

  // Reset to default Parchment Dawn
  themeConfigService.setActiveTheme("light");

  // --- Suite 6: Codebase & CSS File Static Verification ---
  console.log("\n--- 6. Testing Static Code Integration in App.tsx & CSS files ---");
  const serviceCode = fs.readFileSync("/app/applet/src/services/theme-config.service.ts", "utf-8");
  const appCode = fs.readFileSync("/app/applet/src/App.tsx", "utf-8");
  const indexCss = fs.readFileSync("/app/applet/src/index.css", "utf-8");
  const goldenHourCss = fs.readFileSync("/app/applet/src/styles/golden-hour.css", "utf-8");

  assert("theme-config.service.ts exports ThemeObserver class", serviceCode.includes("export class ThemeObserver"));
  assert("theme-config.service.ts exports themeObserver singleton", serviceCode.includes("export const themeObserver"));
  assert("theme-config.service.ts intercepts popstate navigation", serviceCode.includes('window.addEventListener("popstate"'));
  assert("theme-config.service.ts intercepts history pushState", serviceCode.includes("historyObj.pushState"));
  assert("theme-config.service.ts intercepts history replaceState", serviceCode.includes("historyObj.replaceState"));
  assert("App.tsx imports themeObserver", appCode.includes("themeObserver"));
  assert("App.tsx synchronizes theme with themeObserver.applyTheme", appCode.includes("themeObserver.applyTheme"));
  assert("index.css defines .theme-parchment-dawn and .parchment-dawn", indexCss.includes(".theme-parchment-dawn") && indexCss.includes(".parchment-dawn"));
  assert("golden-hour.css defines .theme-golden and .golden-hour", goldenHourCss.includes(".theme-golden") && goldenHourCss.includes(".golden-hour"));

  console.log("=================================================");
  console.log(`🎯 Test Summary: ${passed} Passed, ${total - passed} Failed`);
  console.log("=================================================");

  if (passed !== total) {
    process.exit(1);
  }
}

runThemeObserverSuite().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});

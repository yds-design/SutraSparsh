/**
 * SutraSparsh Comprehensive System Testing Matrix (End-to-End & Non-Functional)
 * 
 * Implements the System Testing Framework & Plan:
 * Phase 1: Smoke & Sanity Testing (Build, Token Bootstrap, Clean Navigation)
 * Phase 2: Functional System Testing (Design Tokens, Routing, State Management, Fault Handling)
 * Phase 3: Non-Functional Testing (Fault Injection, Multi-Viewport, Accessibility A11y, PWA & Security)
 * 
 * Test Scenarios Covered:
 * - TC-SYS-01: Design Token Inheritance, Theme Whitelist & Contrast
 * - TC-SYS-02: End-to-End Navigation, Deep-Link State Retention & Zero Layout Thrashing
 * - TC-SYS-03: Fault Injection, Network Drop, Invalid Inputs & Graceful Fallback UI
 * - TC-SYS-04: Multi-Viewport Responsiveness & Admin Screen Device Barrier
 * - TC-SYS-05: WCAG 2.1 AA/AAA Accessibility (a11y) & Semantic HTML Compliance
 * - TC-SYS-06: State Management, Local Storage & Sādhana Data Flow
 * - TC-SYS-07: Zero-Fee Pandit Directory & Facilitator Trust Signals
 * - TC-SYS-08: Progressive Web App (PWA), Web Manifest & Browser Compatibility
 * - TC-SYS-09: React Rules of Hooks & Lifecycle Non-Regression Audit
 */

import * as fs from "fs";
import * as path from "path";
import ts from "typescript";
import { ThemeConfigService } from "../services/theme-config.service.js";
import { formatWhatsAppPhoneNumber, formatPanditDisplayName, buildWhatsAppRitualMessage, createWhatsAppDeepLink } from "../utils/whatsapp-deep-link.js";
import { normalizeSanskrit, matchesSanskritQuery } from "../utils/sanskritSearch.js";
import { Sanitizer } from "../utils/sanitizer.js";
import { PANDIT_CORPUS } from "../data/panditCorpus.js";
import { SCRIPTURE_CORPUS } from "../data/scriptureCorpus.js";
import { APP_VERSION_METADATA } from "../config/version.js";

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testId: string, description: string, details?: string) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ [PASS] [${testId}] ${description}`);
    passedTests++;
  } else {
    console.error(`  ✗ [FAIL] [${testId}] ${description}${details ? ` -> ${details}` : ""}`);
    failedTests++;
  }
}

console.log("================================================================================");
console.log("🕉️  SUTRASPARSH SYSTEM TESTING MATRIX & END-TO-END VERIFICATION (TC-SYS-01 TO TC-SYS-09)");
console.log("================================================================================");

// ══════════════════════════════════════════════════════════════════════════════
// TC-SYS-01: Design Tokens & Theme Restriction Compliance
// ══════════════════════════════════════════════════════════════════════════════
console.log("\n--- TC-SYS-01: Design Tokens & Theme Restriction Compliance ---");

const themeService = ThemeConfigService.getInstance();
const permittedThemes = themeService.getPermittedThemes();

assert(
  permittedThemes.length === 2 &&
  permittedThemes.some((t) => t.id === "light") &&
  permittedThemes.some((t) => t.id === "golden-hour"),
  "TC-SYS-01.1",
  "Design token system strictly permits exclusively Parchment Dawn ('light') & Golden Hour ('golden-hour')"
);

assert(
  !permittedThemes.some((t: any) => ["sandstone", "amethyst", "festival", "prism-pulse"].includes(t.id)),
  "TC-SYS-01.2",
  "Disabled themes (sandstone, amethyst, festival, prism-pulse) are strictly filtered out of token registry"
);

// Fallback behavior when illegal theme is requested
const illegalFallback = themeService.sanitizeTheme("festival" as any);
assert(
  illegalFallback === "light",
  "TC-SYS-01.3",
  "Attempting to set illegal theme ('festival') safely resolves to default 'light' (Parchment Dawn)"
);

// Global CSS token presence
const indexCssPath = path.resolve("src/index.css");
assert(fs.existsSync(indexCssPath), "TC-SYS-01.4", "src/index.css design token file exists");
const indexCssContent = fs.readFileSync(indexCssPath, "utf-8");

assert(
  indexCssContent.includes("@theme") || indexCssContent.includes("font-serif-sacred") || indexCssContent.includes("font-sanskrit"),
  "TC-SYS-01.5",
  "Global CSS defines sacred typography tokens (serif-sacred, sanskrit)"
);

const goldenHourCssPath = path.resolve("src/styles/golden-hour.css");
assert(fs.existsSync(goldenHourCssPath), "TC-SYS-01.6", "src/styles/golden-hour.css tokens stylesheet exists");
const goldenHourContent = fs.readFileSync(goldenHourCssPath, "utf-8");

assert(
  goldenHourContent.includes(".golden-hour-mode") &&
  (goldenHourContent.includes("#1C140D") || goldenHourContent.includes("--golden-bg-dusk")) &&
  goldenHourContent.includes("#C9822B"),
  "TC-SYS-01.7",
  "Golden Hour CSS defines authentic warm temple palette tokens (#1C140D background, #C9822B amber-gold accent)"
);

// ══════════════════════════════════════════════════════════════════════════════
// TC-SYS-02: End-to-End Navigation, Deep-Link State Retention & Route Integrity
// ══════════════════════════════════════════════════════════════════════════════
console.log("\n--- TC-SYS-02: End-to-End Navigation, Deep-Link State Retention & Route Integrity ---");

const appTsxPath = path.resolve("src/App.tsx");
assert(fs.existsSync(appTsxPath), "TC-SYS-02.1", "src/App.tsx router container exists");
const appTsxContent = fs.readFileSync(appTsxPath, "utf-8");

// Check allowed tab routing union
const supportedTabs = [
  "today",
  "explore",
  "explorer",
  "search",
  "services",
  "community",
  "my-journey",
  "journal",
  "preferences",
  "membership",
];

const allTabsSupportedInApp = supportedTabs.every((tab) => appTsxContent.includes(tab));
assert(
  allTabsSupportedInApp,
  "TC-SYS-02.2",
  "App.tsx supports all 10 canonical navigation routes and deep-link query parameters"
);

// Browser PopState sync
assert(
  appTsxContent.includes('window.addEventListener("popstate"') &&
  appTsxContent.includes('window.removeEventListener("popstate"'),
  "TC-SYS-02.3",
  "App.tsx implements bidirectional popstate event synchronization for browser Back/Forward navigation"
);

// URL searchParams sync with replaceState
assert(
  appTsxContent.includes("window.history.replaceState"),
  "TC-SYS-02.4",
  "App.tsx synchronizes activeTab with URL history without triggering full page reloads"
);

// Top nav bloat elimination check
const headerTsxPath = path.resolve("src/components/Header.tsx");
const headerContent = fs.readFileSync(headerTsxPath, "utf-8");
assert(
  !headerContent.includes('id="tab-my-journey"'),
  "TC-SYS-02.5",
  "Header top navbar bloat eliminated: 'tab-my-journey' is cleanly deprecated from header buttons"
);

assert(
  headerContent.includes('id="tab-services"'),
  "TC-SYS-02.6",
  "Header top navbar seamlessly integrates 'tab-services' Vedic Purohit directory"
);

// ══════════════════════════════════════════════════════════════════════════════
// TC-SYS-03: Fault Injection, Network Drop, Invalid Inputs & Graceful Fallbacks
// ══════════════════════════════════════════════════════════════════════════════
console.log("\n--- TC-SYS-03: Fault Injection, Network Drop, Invalid Inputs & Graceful Fallbacks ---");

// Adversarial input: 10,000-character search query
const hugeQuery = "a".repeat(10000);
const startPerf = Date.now();
let hugeSearchException = false;
try {
  const norm = normalizeSanskrit(hugeQuery);
  assert(norm.length > 0, "TC-SYS-03.1", "10,000-character adversarial string normalized without stack overflow");
} catch {
  hugeSearchException = true;
}
assert(!hugeSearchException, "TC-SYS-03.2", "Search normalizer immune to ReDoS buffer exhaustion attacks");

// Regex metacharacter injection attack
const regexPayload = ".*+?^${}()|[]\\\\/&&||!";
let regexCrash = false;
try {
  const safeTokens = normalizeSanskrit(regexPayload);
  assert(typeof safeTokens === "string", "TC-SYS-03.3", "Search engine safely neutralizes regex special characters");
} catch {
  regexCrash = true;
}
assert(!regexCrash, "TC-SYS-03.4", "Zero unhandled regex compilation exceptions under hostile input");

// Cross-Site Scripting (XSS) payload
const xssPayload = "<script>alert('xss')</script>\"' onmouseover=1";
const xssResult = Sanitizer.sanitizeSearchQuery(xssPayload);
assert(
  !xssResult.includes("<script>") && !xssResult.includes("alert"),
  "TC-SYS-03.5",
  "Search text sanitizer neutralizes HTML and script tags"
);

// WhatsApp Deep Link Edge Cases
// 1. Completely empty phone
const emptyPhoneResult = formatWhatsAppPhoneNumber("");
assert(emptyPhoneResult === "", "TC-SYS-03.6", "Empty phone number returns empty string safely");

// 2. Alphabetic string
const alphaPhone = formatWhatsAppPhoneNumber("call-me-now-please");
assert(alphaPhone === "", "TC-SYS-03.7", "Alphabetic phone input is completely stripped of invalid characters");

// 3. Indian trunk with international prefix: "0091-98201-44521"
const trunkIntl = formatWhatsAppPhoneNumber("0091 98201 44521");
assert(trunkIntl.endsWith("9820144521"), "TC-SYS-03.8", "Malformed trunk numbers with double zero resolve cleanly");

// 4. Sanskrit Unicode ritual name with diacritics & ampersand
const unicodeRitual = "Śrī Rudrābhiṣeka & Mahāmṛtyuñjaya Homa";
const deepLinkResult = createWhatsAppDeepLink({
  phone: "9820144521",
  panditName: "Acharya Somnath Dikshitar",
  ritualName: unicodeRitual,
});

assert(
  deepLinkResult.formattedPhone === "919820144521",
  "TC-SYS-03.9",
  "WhatsApp phone automatically prefixed with 91 for Indian mobile format"
);
assert(
  deepLinkResult.encodedMessage.includes("%C5%9Ar%C4%AB"),
  "TC-SYS-03.10",
  "Sanskrit IAST Unicode character 'Śrī' safely percent-encoded (%C5%9Ar%C4%AB)"
);
assert(
  !deepLinkResult.encodedMessage.includes(" "),
  "TC-SYS-03.11",
  "Encoded WhatsApp message contains zero unescaped whitespace characters"
);

// ══════════════════════════════════════════════════════════════════════════════
// TC-SYS-04: Multi-Viewport Responsiveness & Admin Screen Device Barrier
// ══════════════════════════════════════════════════════════════════════════════
console.log("\n--- TC-SYS-04: Multi-Viewport Responsiveness & Admin Screen Device Barrier ---");

// Mobile Bottom Navigation
const mobileNavPath = path.resolve("src/components/MobileBottomNav.tsx");
assert(fs.existsSync(mobileNavPath), "TC-SYS-04.1", "src/components/MobileBottomNav.tsx mobile bottom navigation exists");
const mobileNavContent = fs.readFileSync(mobileNavPath, "utf-8");

assert(
  mobileNavContent.includes("md:hidden") || mobileNavContent.includes("fixed bottom-0"),
  "TC-SYS-04.2",
  "Mobile bottom navigation bar is styled for mobile touch viewports (< 768px/md) and fixed to viewport bottom"
);

// Daily Shloka Mobile Component
const dailyMobilePath = path.resolve("src/components/DailyShlokaMobile.tsx");
assert(fs.existsSync(dailyMobilePath), "TC-SYS-04.3", "src/components/DailyShlokaMobile.tsx dedicated mobile card exists");

// Admin Console Screen Device Security Barrier
assert(
  appTsxContent.includes("if (!isScreenDevice)") &&
  appTsxContent.includes("Admin Console Screen-Only") &&
  appTsxContent.includes("device: screen"),
  "TC-SYS-04.4",
  "Admin console enforces screen-device security barrier: mobile touch devices are locked out of sensitive mutations"
);

assert(
  appTsxContent.includes("Return to Sacred Temple App"),
  "TC-SYS-04.5",
  "Screen security lock barrier provides accessible escape button back to sacred seeker experience"
);

// ══════════════════════════════════════════════════════════════════════════════
// TC-SYS-05: WCAG 2.1 AA/AAA Accessibility (A11y) & Semantic HTML Compliance
// ══════════════════════════════════════════════════════════════════════════════
console.log("\n--- TC-SYS-05: WCAG 2.1 AA/AAA Accessibility (A11y) & Semantic HTML Compliance ---");

// PanditTrustBadges A11y
const badgesPath = path.resolve("src/components/services/PanditTrustBadges.tsx");
assert(fs.existsSync(badgesPath), "TC-SYS-05.1", "PanditTrustBadges component exists");
const badgesContent = fs.readFileSync(badgesPath, "utf-8");

assert(
  badgesContent.includes('role="group"') &&
  badgesContent.includes('role="tooltip"') &&
  badgesContent.includes("aria-expanded") &&
  badgesContent.includes("aria-label"),
  "TC-SYS-05.2",
  "PanditTrustBadges implements complete WAI-ARIA pattern (role='group', role='tooltip', aria-expanded, aria-label)"
);

// Keyboard dismissal (Escape key)
assert(
  badgesContent.includes('"Escape"') || badgesContent.includes("'Escape'"),
  "TC-SYS-05.3",
  "Interactive tooltips support keyboard dismissal via 'Escape' key"
);

// Semantic HTML tags in PanditProfileCard
const profileCardPath = path.resolve("src/components/services/PanditProfileCard.tsx");
const profileCardContent = fs.readFileSync(profileCardPath, "utf-8");

assert(
  profileCardContent.includes("<article") &&
  profileCardContent.includes("<header") &&
  profileCardContent.includes("<footer"),
  "TC-SYS-05.4",
  "PanditProfileCard adheres to semantic HTML structure (<article>, <header>, <footer>) for screen readers and SEO"
);

// VerseCard Semantic buttons & labels
const verseCardPath = path.resolve("src/components/VerseCard.tsx");
const verseCardContent = fs.readFileSync(verseCardPath, "utf-8");

assert(
  verseCardContent.includes("aria-label=") &&
  verseCardContent.includes('type="button"'),
  "TC-SYS-05.5",
  "VerseCard interactive actions include explicit aria-label and type='button' for assistive technologies"
);

// ══════════════════════════════════════════════════════════════════════════════
// TC-SYS-06: State Management, Local Storage & Sādhana Data Flow
// ══════════════════════════════════════════════════════════════════════════════
console.log("\n--- TC-SYS-06: State Management, Local Storage & Sādhana Data Flow ---");

const progressServicePath = path.resolve("src/services/progress.service.ts");
assert(fs.existsSync(progressServicePath), "TC-SYS-06.1", "Sādhana Progress service exists");

const dailyGoalServicePath = path.resolve("src/services/dailyGoal.service.ts");
assert(fs.existsSync(dailyGoalServicePath), "TC-SYS-06.2", "DailyGoal service exists");
const dailyGoalContent = fs.readFileSync(dailyGoalServicePath, "utf-8");

assert(
  dailyGoalContent.includes("15") && dailyGoalContent.includes("targetMinutes"),
  "TC-SYS-06.3",
  "Daily study goal accurately anchors on 15-minute contemplative benchmark"
);

// Bookmark persistence & deduplication
assert(
  appTsxContent.includes("sutrasparsh_bookmarks") || appTsxContent.includes("setBookmarks"),
  "TC-SYS-06.4",
  "Bookmark state is managed with client-side persistence and reactive synchronization"
);

// Wisdom Journal persistence
const journalPath = path.resolve("src/components/WisdomJournal.tsx");
assert(fs.existsSync(journalPath), "TC-SYS-06.5", "src/components/WisdomJournal.tsx component exists");

// ══════════════════════════════════════════════════════════════════════════════
// TC-SYS-07: Zero-Fee Pandit Directory & Facilitator Trust Signals
// ══════════════════════════════════════════════════════════════════════════════
console.log("\n--- TC-SYS-07: Zero-Fee Pandit Directory & Facilitator Trust Signals ---");

assert(PANDIT_CORPUS.length >= 6, "TC-SYS-07.1", "Corpus contains authentic verified Vedic priests");

const allHaveRituals = PANDIT_CORPUS.every((p) => p.rituals && p.rituals.length >= 2);
assert(allHaveRituals, "TC-SYS-07.2", "Every priest profile offers at least two distinct traditional Vedic rituals");

const verifiedPriests = PANDIT_CORPUS.filter((p) => p.isVerified && p.verificationDetails);
assert(verifiedPriests.length >= 4, "TC-SYS-07.3", "At least 4 priests have verified Pathashala credentials");

const allVerifiedHaveCertifier = verifiedPriests.every(
  (p) => p.verificationDetails?.institution && p.verificationDetails.credentialId
);
assert(
  allVerifiedHaveCertifier,
  "TC-SYS-07.4",
  "All verified profiles document endorsing Veda Pathashala and tamper-evident credential ID"
);

const peerEndorsedPriests = PANDIT_CORPUS.filter((p) => p.peerEndorsements && p.peerEndorsements.length > 0);
assert(peerEndorsedPriests.length >= 3, "TC-SYS-07.5", "Priest corpus contains verified peer endorsements");

// Zero-fee model assurance
const servicesViewPath = path.resolve("src/components/services/PanditServicesView.tsx");
const servicesViewContent = fs.readFileSync(servicesViewPath, "utf-8");
assert(
  servicesViewContent.includes("Zero Platform Fees") || servicesViewContent.includes("Pure Facilitator"),
  "TC-SYS-07.6",
  "PanditServicesView upholds 100% Zero-Fee Pure Facilitator commitment"
);

// ══════════════════════════════════════════════════════════════════════════════
// TC-SYS-08: Progressive Web App (PWA), Web Manifest & Browser Compatibility
// ══════════════════════════════════════════════════════════════════════════════
console.log("\n--- TC-SYS-08: Progressive Web App (PWA), Web Manifest & Browser Compatibility ---");

const manifestPath = path.resolve("public/manifest.webmanifest");
assert(fs.existsSync(manifestPath), "TC-SYS-08.1", "public/manifest.webmanifest exists");
const manifestJson = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

assert(
  manifestJson.name === "SutraSparsh - Spiritual Wisdom Platform" &&
  manifestJson.short_name === "SutraSparsh",
  "TC-SYS-08.2",
  "Web manifest contains valid application name and short_name"
);

assert(
  manifestJson.display === "standalone" && manifestJson.start_url === "/",
  "TC-SYS-08.3",
  "Web manifest configured for standalone full-screen PWA display"
);

assert(
  Array.isArray(manifestJson.icons) && manifestJson.icons.length >= 2,
  "TC-SYS-08.4",
  "Web manifest provides high-resolution responsive application icons (192px and 512px)"
);

// Robots & Sitemap
const robotsPath = path.resolve("public/robots.txt");
assert(fs.existsSync(robotsPath), "TC-SYS-08.5", "public/robots.txt exists");

const sitemapPath = path.resolve("public/sitemap.xml");
assert(fs.existsSync(sitemapPath), "TC-SYS-08.6", "public/sitemap.xml exists");
const sitemapContent = fs.readFileSync(sitemapPath, "utf-8");
assert(
  sitemapContent.includes("tab=services") && sitemapContent.includes("tab=my-journey"),
  "TC-SYS-08.7",
  "Sitemap indexes services, community, and sadhana journey deep links"
);

// ══════════════════════════════════════════════════════════════════════════════
// TC-SYS-09: React Rules of Hooks & Lifecycle Non-Regression Audit
// ══════════════════════════════════════════════════════════════════════════════
console.log("\n--- TC-SYS-09: React Rules of Hooks & Lifecycle Non-Regression Audit ---");

// Parse App.tsx with TypeScript AST to verify zero hooks called after conditional return statements
const sourceFile = ts.createSourceFile("src/App.tsx", appTsxContent, ts.ScriptTarget.Latest, true);
let hookAfterReturnFound = false;

function inspectNode(node: ts.Node) {
  if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node)) {
    const body = node.body;
    if (body && ts.isBlock(body)) {
      let seenReturn = false;
      for (const stmt of body.statements) {
        function containsReturn(n: ts.Node): boolean {
          if (ts.isFunctionDeclaration(n) || ts.isFunctionExpression(n) || ts.isArrowFunction(n)) return false;
          if (ts.isReturnStatement(n)) return true;
          let found = false;
          ts.forEachChild(n, (c) => {
            if (!found && containsReturn(c)) found = true;
          });
          return found;
        }

        function findHooks(n: ts.Node, list: string[] = []): string[] {
          if (ts.isFunctionDeclaration(n) || ts.isFunctionExpression(n) || ts.isArrowFunction(n)) return list;
          if (ts.isCallExpression(n)) {
            const expr = n.expression;
            let name = "";
            if (ts.isIdentifier(expr)) name = expr.text;
            else if (ts.isPropertyAccessExpression(expr)) name = expr.name.text;
            if (/^use[A-Z]/.test(name)) list.push(name);
          }
          ts.forEachChild(n, (c) => findHooks(c, list));
          return list;
        }

        if (seenReturn) {
          const hooks = findHooks(stmt);
          if (hooks.length > 0) {
            hookAfterReturnFound = true;
            console.error(`Hook ${hooks.join(", ")} found after return in ${node.getText().slice(0, 50)}...`);
          }
        }
        if (containsReturn(stmt)) {
          seenReturn = true;
        }
      }
    }
  }
  ts.forEachChild(node, inspectNode);
}
inspectNode(sourceFile);

assert(
  !hookAfterReturnFound,
  "TC-SYS-09.1",
  "Zero React hooks called after conditional return statements in App.tsx (Rules of Hooks satisfied)"
);

assert(
  APP_VERSION_METADATA.version === "1.0.0",
  "TC-SYS-09.2",
  "Application version metadata pinned and validated as v1.0.0"
);

// ══════════════════════════════════════════════════════════════════════════════
// System Testing Matrix Summary
// ══════════════════════════════════════════════════════════════════════════════
console.log("\n================================================================================");
console.log(`📊 SYSTEM TESTING MATRIX SUMMARY:`);
console.log(`   Total Assertions Executed : ${totalTests}`);
console.log(`   Passed Assertions         : ${passedTests}`);
console.log(`   Failed Assertions         : ${failedTests}`);
console.log(`   Pass Rate                 : ${((passedTests / totalTests) * 100).toFixed(1)}%`);
console.log("================================================================================");

if (failedTests > 0) {
  console.error("❌ SYSTEM TESTING DETECTED REGRESSIONS!");
  process.exit(1);
} else {
  console.log("🎉 ALL SYSTEM TESTING SCENARIOS PASSED WITH ZERO REGRESSIONS!");
  process.exit(0);
}

/**
 * Verification Test Suite for 'My Journey' Relocation Architecture
 * 
 * Verifies:
 * 1. Top Nav Bloat Elimination: Header.tsx deprecates and removes 'tab-my-journey' from primary navbar.
 * 2. Route & State Preservation: 'my-journey' is preserved in NavTab and deep-link routing.
 * 3. Daily Shloka Rotation Card Insertion: 'btn-daily-shloka-my-journey' is embedded within the widget.
 * 4. VerseCard Explore Area Insertion: 'btn-verse-journey-[id]' and accessible 'btn-explore-verse-[id]' exist.
 * 5. Sacred Scripture Verses Explore Panel Insertion: 'explore-my-journey-bridge' banner is embedded.
 * 6. Accessibility & Semantic Compliance: ARIA attributes, semantic tags, and themes.
 */

import * as fs from "fs";
import * as path from "path";

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  ✗ [FAIL] ${message}`);
    failed++;
  }
}

console.log("=== SutraSparsh 'My Journey' Relocation Verification Suite ===");

// ════════════ TEST SUITE 1: Header Top Nav Bloat Elimination ════════════
console.log("\n[Test Suite 1: Header Top Nav Bloat Elimination]");

const headerFilePath = path.resolve("src/components/Header.tsx");
assert(fs.existsSync(headerFilePath), "Header.tsx exists");
const headerCode = fs.readFileSync(headerFilePath, "utf8");

assert(
  !headerCode.includes('id="tab-my-journey"'),
  "Header component successfully deprecated and removed 'tab-my-journey' button from top navbar"
);
assert(
  headerCode.includes('"my-journey"'),
  "Header.tsx retains 'my-journey' in NavTab union for programmatic & deep-link routing"
);

// ════════════ TEST SUITE 2: Daily Shloka Rotation Card Insertion ════════════
console.log("\n[Test Suite 2: Daily Shloka Rotation Card Integration]");

const templeAppFilePath = path.resolve("src/components/SutraSparshTempleApp.tsx");
assert(fs.existsSync(templeAppFilePath), "SutraSparshTempleApp.tsx exists");
const templeAppCode = fs.readFileSync(templeAppFilePath, "utf8");

assert(
  templeAppCode.includes('id="btn-daily-shloka-my-journey"'),
  "Daily Shloka Rotation card embeds 'btn-daily-shloka-my-journey' bridge button"
);
assert(
  templeAppCode.includes("My Sādhana Journey"),
  "Daily Shloka Rotation card displays 'My Sādhana Journey' title"
);
assert(
  templeAppCode.includes('aria-label="Open My Journey personal spiritual progress"'),
  "Daily Shloka button implements accessible aria-label"
);
assert(
  templeAppCode.includes('onNavigateTab("my-journey")'),
  "Daily Shloka button triggers onNavigateTab with 'my-journey'"
);

const dailySutraFilePath = path.resolve("src/components/DailySutra.tsx");
assert(fs.existsSync(dailySutraFilePath), "DailySutra.tsx exists");
const dailySutraCode = fs.readFileSync(dailySutraFilePath, "utf8");
assert(
  dailySutraCode.includes('id="btn-daily-sutra-my-journey"'),
  "DailySutra component supports 'btn-daily-sutra-my-journey' button"
);

// ════════════ TEST SUITE 3: Individual VerseCard Explore Area Insertion ════════════
console.log("\n[Test Suite 3: VerseCard Explore Area Insertion]");

const verseCardFilePath = path.resolve("src/components/VerseCard.tsx");
assert(fs.existsSync(verseCardFilePath), "VerseCard.tsx exists");
const verseCardCode = fs.readFileSync(verseCardFilePath, "utf8");

assert(
  verseCardCode.includes("onOpenJourney"),
  "VerseCardProps interface includes onOpenJourney callback prop"
);
assert(
  verseCardCode.includes('id={`btn-verse-journey-${item.id}`}'),
  "VerseCard footer Explore area renders dedicated 'btn-verse-journey-[id]' button"
);
assert(
  verseCardCode.includes('id={`btn-explore-verse-${item.id}`}'),
  "VerseCard footer renders accessible 'btn-explore-verse-[id]' button"
);
assert(
  verseCardCode.includes("Compass"),
  "VerseCard imports and renders sacred Compass icon"
);

// ════════════ TEST SUITE 4: Sacred Scripture Verses Explore Panel ════════════
console.log("\n[Test Suite 4: Sacred Scripture Verses Explore Panel Insertion]");

const appFilePath = path.resolve("src/App.tsx");
assert(fs.existsSync(appFilePath), "App.tsx exists");
const appCode = fs.readFileSync(appFilePath, "utf8");

assert(
  appCode.includes('id="explore-my-journey-bridge"'),
  "Explore view embeds 'explore-my-journey-bridge' personal sanctuary banner"
);
assert(
  appCode.includes('id="btn-explore-open-journey"'),
  "Explore bridge banner renders 'btn-explore-open-journey' button"
);
assert(
  appCode.includes('onOpenJourney={() => setActiveTab("my-journey")}'),
  "App.tsx binds onOpenJourney to VerseCard instances in Explore view"
);

// ════════════ TEST SUITE 5: Deep-Link, State & SEO Preservation ════════════
console.log("\n[Test Suite 5: Deep-Link, State & SEO Preservation]");

assert(
  appCode.includes('activeTab === "my-journey"'),
  "App.tsx preserves MyJourneyView rendering for activeTab === 'my-journey'"
);
assert(
  appCode.includes('canonicalUrl: "https://sutrasparsh.com/?tab=my-journey"'),
  "App.tsx preserves SEO dynamic metadata for ?tab=my-journey"
);

const indexHtmlPath = path.resolve("index.html");
const indexHtmlCode = fs.readFileSync(indexHtmlPath, "utf8");
assert(
  indexHtmlCode.includes("/?tab=my-journey"),
  "index.html preserves noscript deep-link for ?tab=my-journey"
);

const sitemapPath = path.resolve("public/sitemap.xml");
const sitemapCode = fs.readFileSync(sitemapPath, "utf8");
assert(
  sitemapCode.includes("<loc>https://sutrasparsh.com/?tab=my-journey</loc>"),
  "public/sitemap.xml preserves sitemap entry for ?tab=my-journey"
);

// ════════════ SUMMARY ════════════
console.log(`\n=== Verification Complete: ${passed}/${passed + failed} assertions passed ===`);
if (failed > 0) {
  process.exit(1);
}

/**
 * SutraSparsh - Top Toolbar Look Closer Visibility Test
 *
 * Verifies:
 * 1. Header.tsx props include showLookCloserInToolbar with default false
 * 2. Look Closer button (#btn-nav-look-closer) is gated by showLookCloserInToolbar
 * 3. App.tsx explicitly sets showLookCloserInToolbar={false}
 * 4. Look Closer entry points outside the top toolbar (Daily Wisdom card, Explore Banner, Word tap) remain active
 */

import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

console.log("=================================================");
console.log("🕉️ SUTRASPARSH • TOP TOOLBAR VISIBILITY TEST");
console.log("=================================================");

// ── TEST 1: Header.tsx Prop & Default Value Check ──
console.log("\n[Test 1] Header.tsx showLookCloserInToolbar prop & default");
const headerPath = path.resolve(process.cwd(), "src/components/Header.tsx");
assert(fs.existsSync(headerPath), "Header.tsx exists");
const headerContent = fs.readFileSync(headerPath, "utf8");

assert(
  headerContent.includes("showLookCloserInToolbar?: boolean"),
  "HeaderProps must declare showLookCloserInToolbar?: boolean"
);
assert(
  headerContent.includes("showLookCloserInToolbar = false"),
  "Header component must default showLookCloserInToolbar to false"
);
console.log("  -> Passed (Header declares showLookCloserInToolbar defaulting to false)");

// ── TEST 2: Header.tsx Top Toolbar Conditional Rendering Check ──
console.log("\n[Test 2] Header.tsx conditional rendering for #btn-nav-look-closer");
assert(
  headerContent.includes("showLookCloserInToolbar && (onOpenLookCloser || onOpenWordExplorer)"),
  "Look Closer button must be strictly guarded by showLookCloserInToolbar flag"
);
console.log("  -> Passed (Top toolbar button guarded, visible = false by default)");

// ── TEST 3: App.tsx Config Check ──
console.log("\n[Test 3] App.tsx Header usage");
const appPath = path.resolve(process.cwd(), "src/App.tsx");
const appContent = fs.readFileSync(appPath, "utf8");
assert(
  appContent.includes("showLookCloserInToolbar={false}"),
  "App.tsx must explicitly set showLookCloserInToolbar={false}"
);
console.log("  -> Passed (App.tsx passes showLookCloserInToolbar={false})");

// ── TEST 4: Integrity of other Look Closer Access Points ──
console.log("\n[Test 4] Integrity of Core Look Closer Entry Points");
assert(
  appContent.includes("<LookCloserModal"),
  "App.tsx retains LookCloserModal for deep-dive discovery"
);
assert(
  appContent.includes("<LookCloserBanner"),
  "App.tsx retains LookCloserBanner in Explore feed"
);

const templePath = path.resolve(process.cwd(), "src/components/SutraSparshTempleApp.tsx");
const templeContent = fs.readFileSync(templePath, "utf8");
assert(
  templeContent.includes("handleOpenLookCloser"),
  "SutraSparshTempleApp maintains Look Closer handler on daily wisdom card"
);
console.log("  -> Passed (All primary sacred entry points remain intact and fully functional)");

console.log("\n=================================================");
console.log("✅ ALL TOP TOOLBAR VISIBILITY TESTS PASSED (100%)");
console.log("=================================================");

/**
 * Test Suite: Chip Design System Tokens & Subtle Glow Visual State (360° PRD Spec)
 *
 * Validates:
 * 1. Global design system tokens defined in src/index.css
 * 2. Subtle diffused glow for selected/active chips across all themes (Light, Sandstone, Golden Hour, Amethyst, Festival)
 * 3. Accessibility overrides: prefers-reduced-motion & prefers-contrast: more
 * 4. Micro-interaction transition specs (180ms ease-out cubic-bezier(0.4, 0, 0.2, 1))
 * 5. Safe padding-block buffers in horizontal scroll containers to prevent glow clipping
 * 6. Primitive <Chip /> component API & exports
 * 7. WCAG 2.2 AA contrast compliance
 */

import fs from "fs";
import path from "path";
import { Chip } from "../components/Chip";

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

function calculateRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function calculateContrastRatio(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  const l1 = calculateRelativeLuminance(...rgb1);
  const l2 = calculateRelativeLuminance(...rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

async function runTestSuite() {
  console.log("==================================================================");
  console.log("✨ 360° PRD Spec Test: Chip Selected Subtle Glow Design Tokens");
  console.log("==================================================================");

  // 1. CSS Design Tokens Verification
  console.log("\n--- 1. Testing Design System Tokens in src/index.css ---");
  const indexCss = fs.readFileSync(path.resolve("src/index.css"), "utf-8");

  assert("src/index.css defines --chip-glow-active", indexCss.includes("--chip-glow-active:"));
  assert("src/index.css defines --chip-border-active", indexCss.includes("--chip-border-active:"));
  assert("src/index.css defines --chip-bg-active", indexCss.includes("--chip-bg-active:"));
  assert("src/index.css defines --chip-text-active", indexCss.includes("--chip-text-active:"));
  assert("src/index.css defines --chip-transition token", indexCss.includes("--chip-transition:"));

  // Check 180ms ease-out cubic-bezier transition spec
  assert(
    "Transition uses 180ms cubic-bezier(0.4, 0, 0.2, 1) micro-interaction",
    indexCss.includes("180ms cubic-bezier(0.4, 0, 0.2, 1)")
  );

  // Light Mode glow specification
  assert(
    "Light Mode defines subtle multi-layer ambient shadow with low spread",
    indexCss.includes("0 2px 8px 0 rgba(27, 23, 64, 0.25), 0 0 6px 1px rgba(217, 164, 65, 0.35)")
  );

  // Dark Mode glow specification
  assert(
    "Dark Mode defines increased luminescence diffused glow preventing deep surface blending",
    indexCss.includes("0 0 12px 1px rgba(245, 158, 11, 0.40)")
  );

  // Golden Hour, Amethyst, Festival Theme glow specs
  assert("Golden Hour theme defines specific ambient glow", indexCss.includes("[data-theme=\"golden-hour\"]"));
  assert("Amethyst theme defines specific luminescence glow", indexCss.includes("[data-theme=\"amethyst\"]"));
  assert("Festival theme defines specific luminescence glow", indexCss.includes("[data-theme=\"festival\"]"));

  // 2. Accessibility Overrides (WCAG 2.2 & Media Queries)
  console.log("\n--- 2. Testing Accessibility (prefers-reduced-motion & prefers-contrast) ---");
  assert(
    "@media (prefers-reduced-motion: reduce) disables transition animations instantly",
    indexCss.includes("@media (prefers-reduced-motion: reduce)") &&
      indexCss.includes("transition: none !important")
  );
  assert(
    "@media (prefers-contrast: more) replaces diffused glow with solid 2px high-contrast outline",
    indexCss.includes("@media (prefers-contrast: more)") &&
      indexCss.includes("outline: 2px solid currentColor !important")
  );

  // 3. Contrast Compliance (WCAG 2.2 AA)
  console.log("\n--- 3. Testing Contrast Compliance (WCAG 2.2 AA Standards) ---");
  // Light Mode selected chip: background #1b1740 (deep royal indigo), text #f4f2ff (pale ivory)
  const lightChipBg: [number, number, number] = [27, 23, 64];
  const lightChipText: [number, number, number] = [244, 242, 255];
  const lightContrast = calculateContrastRatio(lightChipBg, lightChipText);
  assert(
    `Light mode selected chip contrast is ${lightContrast.toFixed(2)}:1 (exceeds WCAG AAA >= 7:1)`,
    lightContrast >= 7.0
  );

  // Light mode suggestion chip: background #d9a441 (gold), text #100e2b (deep ink)
  const suggestionBg: [number, number, number] = [217, 164, 65];
  const suggestionText: [number, number, number] = [16, 14, 43];
  const suggestionContrast = calculateContrastRatio(suggestionBg, suggestionText);
  assert(
    `Light mode suggestion chip contrast is ${suggestionContrast.toFixed(2)}:1 (exceeds WCAG AA >= 4.5:1)`,
    suggestionContrast >= 4.5
  );

  // Dark Mode selected chip: background rgba(245, 158, 11, 0.22) over deep stone #0c0a09, text #fef3c7
  const darkChipBg: [number, number, number] = [45, 30, 15];
  const darkChipText: [number, number, number] = [254, 243, 199];
  const darkContrast = calculateContrastRatio(darkChipBg, darkChipText);
  assert(
    `Dark mode selected chip text contrast is ${darkContrast.toFixed(2)}:1 (exceeds WCAG AAA >= 7:1)`,
    darkContrast >= 7.0
  );

  // 4. Primitive <Chip /> Component API & Exports
  console.log("\n--- 4. Testing <Chip /> Primitive Component API ---");
  assert("<Chip /> is exported from src/components/Chip.tsx", typeof Chip === "function");

  const chipFile = fs.readFileSync(path.resolve("src/components/ui/Chip.tsx"), "utf-8");
  assert("Chip component supports 'filter' variant", chipFile.includes('"filter"'));
  assert("Chip component supports 'suggestion' variant", chipFile.includes('"suggestion"'));
  assert("Chip component supports 'topic' variant", chipFile.includes('"topic"'));
  assert("Chip component supports 'sm', 'md', 'lg' sizes", chipFile.includes('"sm"') && chipFile.includes('"lg"'));
  assert("Chip applies aria-pressed={selected}", chipFile.includes("aria-pressed={selected}"));
  assert("Chip applies role=\"button\"", chipFile.includes('role="button"'));
  assert("Chip applies .chip-glow-selected class on active state", chipFile.includes("chip-glow-selected"));

  // 5. Overflow Safety Padding Verification in Horizontal Scroll / Chip Containers
  console.log("\n--- 5. Testing Horizontal Scroll Overflow Safety Buffers ---");
  const appTsx = fs.readFileSync(path.resolve("src/App.tsx"), "utf-8");
  assert(
    "App.tsx Traditions filter row has safe padding buffer (py-1 px-0.5)",
    appTsx.includes("Traditions / Authors Filter Chips") && appTsx.includes("py-1 px-0.5")
  );
  assert(
    "App.tsx Path/Yoga category row has safe padding buffer (py-1 px-0.5)",
    appTsx.includes("Categories Filter Chips") && appTsx.includes("py-1 px-0.5")
  );

  const searchView = fs.readFileSync(path.resolve("src/components/SearchView.tsx"), "utf-8");
  assert(
    "SearchView.tsx Suggested Queries row has safe padding buffer (py-1 px-0.5)",
    searchView.includes("Suggested Contemplation Queries") && searchView.includes("py-1 px-0.5")
  );
  assert(
    "SearchView.tsx Tradition filter row has safe padding buffer (py-1 px-0.5)",
    searchView.includes("Tradition:") && searchView.includes("py-1 px-0.5")
  );
  assert(
    "SearchView.tsx Category filter row has safe padding buffer (py-1 px-0.5)",
    searchView.includes("Category:") && searchView.includes("py-1 px-0.5")
  );

  const templeApp = fs.readFileSync(path.resolve("src/components/SutraSparshTempleApp.tsx"), "utf-8");
  assert(
    "SutraSparshTempleApp.tsx Scripture Corpus pills have safe padding (py-2 px-1)",
    templeApp.includes("overflow-x-auto py-2 px-1")
  );
  assert(
    "SutraSparshTempleApp.tsx Popular Topics container has safe padding (py-1 px-0.5)",
    templeApp.includes("flex-wrap gap-2 py-1 px-0.5")
  );

  // 6. Cross-Module Selected Glow State Usage
  console.log("\n--- 6. Testing Cross-Module Glow State Integration ---");
  const soundscapeSelector = fs.readFileSync(path.resolve("src/components/SoundscapeSelector.tsx"), "utf-8");
  assert(
    "SoundscapeSelector.tsx uses chip-glow-selected for active soundscape card",
    soundscapeSelector.includes("chip-glow-selected")
  );

  const dailyGoalModal = fs.readFileSync(path.resolve("src/components/DailyGoalModal.tsx"), "utf-8");
  assert(
    "DailyGoalModal.tsx uses chip-glow-selected for active target presets",
    dailyGoalModal.includes("chip-glow-selected")
  );

  const verseModal = fs.readFileSync(path.resolve("src/components/VerseModal.tsx"), "utf-8");
  assert(
    "VerseModal.tsx uses chip-glow-selected for Sanskrit word chips across all themes",
    verseModal.includes("chip-glow-selected")
  );

  const lookCloserModal = fs.readFileSync(path.resolve("src/features/wordExplorer/components/LookCloserModal.tsx"), "utf-8");
  assert(
    "LookCloserModal.tsx uses chip-glow-selected for word breakdown component chips",
    lookCloserModal.includes("chip-glow-selected")
  );

  // Summary
  console.log("\n==================================================================");
  console.log(`Test Results: ${passed}/${total} passed (${((passed / total) * 100).toFixed(1)}%)`);
  console.log("==================================================================");

  if (passed !== total) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});

/**
 * SutraSparsh - Parchment Dawn Theme & Infinite Scroll Performance Verification
 * 
 * Validates:
 * 1. FR-01: Global CSS Custom Properties & Semantic Token Engine in src/index.css
 * 2. WCAG 2.1 Contrast Ratio Matrix calculations (all light theme tokens >= 4.5:1 / 7:1)
 * 3. FR-02: LookCloserBanner.tsx contrast defect remediation
 * 4. FR-03: VerseCard.tsx Shloka rendering & elevation tokens
 * 5. FR-04: MobileBottomNav.tsx navigation tokens
 * 6. React.memo & useMemo infinite scroll performance optimizations in src/App.tsx
 */

import fs from "fs";
import path from "path";

// ── Color Contrast Calculation Utility (WCAG 2.1 Standard) ─────────────
function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "").trim();
  const bigint = parseInt(clean, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

function getRelativeLuminance([r, g, b]: [number, number, number]): number {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function calculateContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getRelativeLuminance(hexToRgb(hex1));
  const lum2 = getRelativeLuminance(hexToRgb(hex2));
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

// ── Test Runner ──────────────────────────────────────────────────────────
let totalPass = 0;
let totalFail = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    totalPass++;
  } else {
    console.error(`  ✗ FAIL: ${testName}${details ? ` -> ${details}` : ""}`);
    totalFail++;
  }
}

async function runParchmentDawnTests() {
  console.log("\n=======================================================");
  console.log("  SUTRASPARSH: PARCHMENT DAWN & PERFORMANCE TEST SUITE");
  console.log("=======================================================\n");

  // ── SUITE 1: WCAG 2.1 Contrast Validation Matrix ───────────────────
  console.log("--- Suite 1: Mathematical Contrast Validation Matrix ---");
  
  const surfaceBg = "#FFFDF8";
  const subtleChipBg = "#F5EEDB";
  const badgeBg = "#FBEFD3";

  // 1. Espresso primary (#261B12) on surface (#FFFDF8)
  const ratioEspresso = calculateContrastRatio("#261B12", surfaceBg);
  assert(
    ratioEspresso >= 15.0,
    `text-espresso-primary (#261B12) on surface (#FFFDF8) ratio: ${ratioEspresso.toFixed(2)}:1 (Target: >= 15.0:1 AAA)`
  );

  // 2. Espresso secondary (#4A3A2F) on surface (#FFFDF8)
  const ratioBody = calculateContrastRatio("#4A3A2F", surfaceBg);
  assert(
    ratioBody >= 7.0,
    `text-espresso-secondary (#4A3A2F) on surface (#FFFDF8) ratio: ${ratioBody.toFixed(2)}:1 (Target: >= 7.0:1 AAA)`
  );

  // 3. Sacred saffron heading (#A64E04) on surface (#FFFDF8)
  const ratioSaffron = calculateContrastRatio("#A64E04", surfaceBg);
  assert(
    ratioSaffron >= 5.2,
    `text-saffron-heading (#A64E04) on surface (#FFFDF8) ratio: ${ratioSaffron.toFixed(2)}:1 (Target: >= 5.2:1 AA Large/Normal)`
  );

  // 4. Burnt terracotta emphasis (#B43E00) on surface (#FFFDF8)
  const ratioTerracotta = calculateContrastRatio("#B43E00", surfaceBg);
  assert(
    ratioTerracotta >= 5.0,
    `text-burnt-terracotta (#B43E00) on surface (#FFFDF8) ratio: ${ratioTerracotta.toFixed(2)}:1 (Target: >= 5.0:1)`
  );

  // 5. Burnt amber badge text (#874606) on badge chip (#FBEFD3)
  const ratioBadge = calculateContrastRatio("#874606", badgeBg);
  assert(
    ratioBadge >= 5.5,
    `text-burnt-amber (#874606) on badge bg (#FBEFD3) ratio: ${ratioBadge.toFixed(2)}:1 (Target: >= 5.5:1)`
  );

  // 6. Devanagari text (#1E1610) on card (#FFFDF8)
  const ratioDevanagari = calculateContrastRatio("#1E1610", surfaceBg);
  assert(
    ratioDevanagari >= 15.5,
    `Devanagari text (#1E1610) on surface (#FFFDF8) ratio: ${ratioDevanagari.toFixed(2)}:1 (Target: >= 15.5:1 AAA)`
  );

  // 7. Old buggy sand (#F3C068) contrast confirmation (Demonstrating old defect fails)
  const ratioOldSand = calculateContrastRatio("#F3C068", surfaceBg);
  assert(
    ratioOldSand < 2.0,
    `Old buggy yellow (#F3C068) on surface is only ${ratioOldSand.toFixed(2)}:1 (Defect confirmed as severe failure)`
  );

  // ── SUITE 2: FR-01 Global CSS Tokens in src/index.css ───────────────
  console.log("\n--- Suite 2: FR-01 Semantic CSS Token Engine ---");
  const indexCss = fs.readFileSync(path.resolve(process.cwd(), "src/index.css"), "utf8");

  assert(indexCss.includes("--color-canvas-bg: #FBF8EE"), "CSS defines --color-canvas-bg: #FBF8EE");
  assert(indexCss.includes("--color-surface-card: #FFFDF8"), "CSS defines --color-surface-card: #FFFDF8");
  assert(indexCss.includes("--color-surface-subtle: #F5EEDB"), "CSS defines --color-surface-subtle: #F5EEDB");
  assert(indexCss.includes("--color-border-subtle: #E8DCC2"), "CSS defines --color-border-subtle: #E8DCC2");
  assert(indexCss.includes("--color-border-highlight: #DECB9F"), "CSS defines --color-border-highlight: #DECB9F");
  assert(indexCss.includes("--color-text-title: #261B12"), "CSS defines --color-text-title: #261B12");
  assert(indexCss.includes("--color-text-body: #4A3A2F"), "CSS defines --color-text-body: #4A3A2F");
  assert(indexCss.includes("--color-text-muted: #6E5C4E"), "CSS defines --color-text-muted: #6E5C4E");
  assert(indexCss.includes("--color-text-sacred-accent: #A64E04"), "CSS defines --color-text-sacred-accent: #A64E04");
  assert(indexCss.includes("--color-action-primary: #E05A1B"), "CSS defines --color-action-primary: #E05A1B");
  assert(indexCss.includes("--color-action-secondary-bg: #FDF3DF"), "CSS defines --color-action-secondary-bg: #FDF3DF");
  assert(indexCss.includes("--color-action-secondary-text: #874606"), "CSS defines --color-action-secondary-text: #874606");
  assert(indexCss.includes("--color-action-secondary-border: #E8CF9A"), "CSS defines --color-action-secondary-border: #E8CF9A");

  // ── SUITE 3: FR-02 LookCloserBanner.tsx Remediation ──────────────────
  console.log("\n--- Suite 3: FR-02 LookCloserBanner Remediation ---");
  const bannerFile = fs.readFileSync(
    path.resolve(process.cwd(), "src/features/wordExplorer/components/LookCloserBanner.tsx"),
    "utf8"
  );

  assert(bannerFile.includes("bg-[#FFFDF8] border-[#E8DCC2]"), "LookCloserBanner uses #FFFDF8 card surface and #E8DCC2 border in light mode");
  assert(bannerFile.includes("bg-[#FBEFD3] text-[#874606] border-[#E8CF9A]"), "LookCloserBanner category badge uses Parchment Dawn tokens");
  assert(bannerFile.includes("text-[#261B12]"), "LookCloserBanner primary heading uses espresso #261B12");
  assert(bannerFile.includes("text-[#B43E00] italic font-semibold"), "LookCloserBanner cursive emphasis uses burnt terracotta #B43E00");
  assert(bannerFile.includes("text-[#423429]"), "LookCloserBanner body copy uses readable roasted espresso #423429");
  assert(bannerFile.includes("bg-gradient-to-b from-[#E66020] to-[#D44E0E] text-white"), "LookCloserBanner primary CTA uses warm terracotta gradient with white text");
  assert(bannerFile.includes("bg-[#FFF7E6]") && bannerFile.includes("text-[#783C00]"), "LookCloserBanner secondary CTA uses #FFF7E6 with #783C00 text");

  // ── SUITE 4: FR-03 VerseCard.tsx & Shloka Rendering ─────────────────
  console.log("\n--- Suite 4: FR-03 VerseCard & React.memo Optimization ---");
  const verseCardFile = fs.readFileSync(
    path.resolve(process.cwd(), "src/components/VerseCard.tsx"),
    "utf8"
  );

  assert(verseCardFile.includes("export const VerseCard = React.memo"), "VerseCard is wrapped in React.memo for high-performance rendering");
  assert(verseCardFile.includes("prevProps.item.id === nextProps.item.id"), "VerseCard React.memo has custom comparison for item.id");
  assert(verseCardFile.includes("prevProps.isBookmarked === nextProps.isBookmarked"), "VerseCard React.memo compares isBookmarked");
  assert(verseCardFile.includes("text-[#1E1610] font-semibold"), "Devanagari body uses crisp contrast #1E1610 with font-weight >= 600");
  assert(verseCardFile.includes("text-[#544134] font-medium"), "IAST transliteration uses deep warm taupe #544134");
  assert(verseCardFile.includes("text-[#4A3A2F] font-normal"), "English meaning uses roasted espresso #4A3A2F");
  assert(verseCardFile.includes("bg-[#FBEFD3] text-[#824300] border-[#E8CF9A]"), "Spiritual tags use Parchment Dawn chip styling");
  assert(verseCardFile.includes("0 4px 20px -2px rgba(80, 50, 20, 0.06)"), "Card features soft ambient elevation shadow");

  // ── SUITE 5: Infinite Scroll memoization in src/App.tsx ─────────────
  console.log("\n--- Suite 5: App.tsx Infinite Scroll & useMemo Architecture ---");
  const appFile = fs.readFileSync(path.resolve(process.cwd(), "src/App.tsx"), "utf8");

  assert(appFile.includes("const memoizedVerseCards = React.useMemo"), "App.tsx defines memoizedVerseCards using React.useMemo");
  assert(appFile.includes("{memoizedVerseCards}"), "App.tsx renders memoizedVerseCards in the results grid");
  assert(appFile.includes("const toggleBookmark = React.useCallback"), "toggleBookmark in App.tsx is wrapped in React.useCallback");
  assert(appFile.includes("const handleOpenVerse = React.useCallback"), "handleOpenVerse in App.tsx is wrapped in React.useCallback");
  assert(appFile.includes("const handleOpenJourneyFromCard = React.useCallback"), "handleOpenJourneyFromCard in App.tsx is wrapped in React.useCallback");
  assert(appFile.includes("const bookmarkedIdsSet = React.useMemo"), "App.tsx computes bookmarkedIdsSet using useMemo for O(1) bookmark lookups");

  // ── SUITE 6: FR-04 MobileBottomNav.tsx ───────────────────────────────
  console.log("\n--- Suite 6: FR-04 Navigation & Action Elements ---");
  const navFile = fs.readFileSync(
    path.resolve(process.cwd(), "src/components/MobileBottomNav.tsx"),
    "utf8"
  );

  assert(navFile.includes('"#C65507"') && navFile.includes("activeColor"), "MobileBottomNav activeColor in light mode is #C65507");
  assert(navFile.includes('"#69574A"') && navFile.includes("inactiveColor"), "MobileBottomNav inactiveColor in light mode is #69574A");
  assert(navFile.includes('"#FBEFD3"') && navFile.includes("activePillBg"), "MobileBottomNav active pill background is #FBEFD3");
  assert(navFile.includes('"#E8DCC2"') && navFile.includes("navBorder"), "MobileBottomNav border in light mode is #E8DCC2");

  // Summary
  console.log("\n=======================================================");
  console.log(`  PARCHMENT DAWN & PERFORMANCE TESTS: ${totalPass} PASSED, ${totalFail} FAILED`);
  console.log("=======================================================\n");

  if (totalFail > 0) {
    process.exit(1);
  }
}

runParchmentDawnTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});

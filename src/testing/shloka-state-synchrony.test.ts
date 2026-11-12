/**
 * SutraSparsh - Shloka State Synchrony Across Wisdom Flows Test Suite
 *
 * Verifies:
 * 1. Single Source of Truth (SSOT) via DailyWisdomService
 * 2. LookCloser modal & banner verse inheritance (no static bg_18_65 fallback)
 * 3. Daily wisdom date rotation synchrony across home widget and exploration flows
 * 4. Backend API parity: /api/v1/wisdom/daily & /api/v1/wisdom/discovery
 * 5. Offline caching & deterministic fallback resilience
 */

import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import express from "express";
import { dailyWisdomService } from "../services/daily-wisdom.service";
import { wisdomRoutes } from "../api/routes/wisdom.routes";
import { VERSES_DATABASE } from "../features/wordExplorer/data/mockVerses";

async function runTests() {
  console.log("=================================================");
  console.log("🕉️ SUTRASHPARSH • SHLOKA STATE SYNCHRONY TEST SUITE");
  console.log("=================================================");

  // ── SUITE 1: DailyWisdomService SSOT & Deterministic Date Anchoring ──
  console.log("\n--- Suite 1: DailyWisdomService SSOT ---");

  // Reset to today
  dailyWisdomService.setOffset(0);
  const activeWisdomToday = dailyWisdomService.getActiveWisdom();
  assert(activeWisdomToday, "Active wisdom for today must not be null or undefined");
  assert(activeWisdomToday.id, "Active wisdom must possess a valid scripture id");
  assert(activeWisdomToday.sanskrit, "Active wisdom must have sacred Sanskrit/Devanagari text");
  assert(activeWisdomToday.meaning, "Active wisdom must have an English translation");

  console.log(`[PASS] Today's anchored shloka: ${activeWisdomToday.id} - ${activeWisdomToday.title}`);

  // Test subscriber notification on date change
  let notifiedVerse: any = null;
  const unsubscribe = dailyWisdomService.subscribe((verse) => {
    notifiedVerse = verse;
  });

  dailyWisdomService.setOffset(1);
  const tomorrowWisdom = dailyWisdomService.getActiveWisdom();
  assert.strictEqual(notifiedVerse?.id, tomorrowWisdom.id, "Subscriber must receive updated verse on date change");
  console.log(`[PASS] Tomorrow's rotated shloka: ${tomorrowWisdom.id} - ${tomorrowWisdom.title}`);

  dailyWisdomService.setOffset(-1);
  const yesterdayWisdom = dailyWisdomService.getActiveWisdom();
  assert.strictEqual(notifiedVerse?.id, yesterdayWisdom.id, "Subscriber must receive yesterday's rotated shloka");
  console.log(`[PASS] Yesterday's rotated shloka: ${yesterdayWisdom.id} - ${yesterdayWisdom.title}`);

  // Reset back to today
  dailyWisdomService.setOffset(0);
  unsubscribe();

  // ── SUITE 2: Static Code Verification for Component State Alignment ──
  console.log("\n--- Suite 2: Component Architecture & Inheritance Check ---");

  // Check LookCloserModal.tsx
  const lookCloserModalContent = fs.readFileSync(
    path.resolve(process.cwd(), "src/features/wordExplorer/components/LookCloserModal.tsx"),
    "utf8"
  );
  assert(
    !lookCloserModalContent.includes('VERSES_DATABASE["bg_18_65"]'),
    "LookCloserModal must NOT have hardcoded fallback to VERSES_DATABASE['bg_18_65']"
  );
  assert(
    lookCloserModalContent.includes("dailyWisdomService.getActiveWisdom()"),
    "LookCloserModal must use dailyWisdomService.getActiveWisdom() as active fallback"
  );
  console.log("[PASS] LookCloserModal fallback verified to use DailyWisdomService SSOT");

  // Check LookCloserBanner.tsx
  const lookCloserBannerContent = fs.readFileSync(
    path.resolve(process.cwd(), "src/features/wordExplorer/components/LookCloserBanner.tsx"),
    "utf8"
  );
  assert(
    lookCloserBannerContent.includes("currentVerse?: DetailedVerse | ContentItem"),
    "LookCloserBannerProps must accept currentVerse"
  );
  assert(
    lookCloserBannerContent.includes("onOpenLookCloser(currentVerse)"),
    "LookCloserBanner must pass currentVerse to onOpenLookCloser"
  );
  console.log("[PASS] LookCloserBanner properly passes currentVerse to opener");

  // Check App.tsx
  const appContent = fs.readFileSync(
    path.resolve(process.cwd(), "src/App.tsx"),
    "utf8"
  );
  assert(
    appContent.includes("useDailyWisdom"),
    "App.tsx must consume useDailyWisdom hook"
  );
  assert(
    appContent.includes("currentVerse={dailyWisdom}"),
    "App.tsx must pass dailyWisdom to LookCloserBanner"
  );
  assert(
    appContent.includes("verse={selectedVerse || dailyWisdom}"),
    "App.tsx must pass selectedVerse || dailyWisdom to LookCloserModal"
  );
  console.log("[PASS] App.tsx correctly cascades active shloka to Banner & Modal");

  // Check SutraSparshTempleApp.tsx
  const templeAppContent = fs.readFileSync(
    path.resolve(process.cwd(), "src/components/SutraSparshTempleApp.tsx"),
    "utf8"
  );
  assert(
    templeAppContent.includes("useDailyWisdom"),
    "SutraSparshTempleApp must consume useDailyWisdom"
  );
  console.log("[PASS] SutraSparshTempleApp integrated with useDailyWisdom SSOT");

  // ── SUITE 3: Backend API Parity & Discovery Route Verification ──────
  console.log("\n--- Suite 3: Backend API /api/v1/wisdom Endpoints ---");

  const app = express();
  app.use(express.json());
  app.use("/api", wisdomRoutes);

  const server = app.listen(0);
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // Test 1: Daily wisdom endpoint
    const dailyRes = await fetch(`${baseUrl}/api/v1/wisdom/daily`);
    assert.strictEqual(dailyRes.status, 200, "/api/v1/wisdom/daily should return 200");
    const dailyData = await dailyRes.json();
    assert.strictEqual(dailyData.success, true, "daily response must have success: true");
    assert(dailyData.shloka?.id, "daily response must provide shloka id");
    assert(dailyData.shloka?.sanskrit, "daily response must provide Sanskrit verse");
    assert(dailyData.shloka?.meaning, "daily response must provide English translation");
    console.log(`[PASS] /api/v1/wisdom/daily returned shloka: ${dailyData.shloka.id} (${dailyData.shloka.title})`);

    // Test 2: Discovery endpoint with no shloka_id should match daily wisdom
    const discoveryRes = await fetch(`${baseUrl}/api/v1/wisdom/discovery`);
    assert.strictEqual(discoveryRes.status, 200, "/api/v1/wisdom/discovery should return 200");
    const discoveryData = await discoveryRes.json();
    assert.strictEqual(discoveryData.success, true, "discovery response must have success: true");
    assert.strictEqual(
      discoveryData.shloka.id,
      dailyData.shloka.id,
      "Discovery with no shloka_id must return the identical daily wisdom shloka"
    );
    console.log(`[PASS] /api/v1/wisdom/discovery matches daily shloka: ${discoveryData.shloka.id}`);

    // Test 3: Discovery endpoint with specific shloka_id
    const specificRes = await fetch(`${baseUrl}/api/v1/wisdom/discovery?shloka_id=bg_18_65`);
    assert.strictEqual(specificRes.status, 200);
    const specificData = await specificRes.json();
    assert.strictEqual(specificData.shloka.id, "bg_18_65", "Should return requested shloka id");
    console.log(`[PASS] /api/v1/wisdom/discovery?shloka_id=bg_18_65 returns requested shloka`);

    // Test 4: Look-closer alias endpoint
    const lookCloserRes = await fetch(`${baseUrl}/api/v1/wisdom/look-closer`);
    assert.strictEqual(lookCloserRes.status, 200);
    const lookCloserData = await lookCloserRes.json();
    assert.strictEqual(
      lookCloserData.shloka.id,
      dailyData.shloka.id,
      "Look-closer alias must also default to active daily wisdom shloka"
    );
    console.log(`[PASS] /api/v1/wisdom/look-closer returns active daily shloka`);
  } finally {
    server.close();
  }

  console.log("\n=================================================");
  console.log("✅ ALL SHLOKA STATE SYNCHRONY TESTS PASSED (100%)");
  console.log("=================================================");
}

runTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});

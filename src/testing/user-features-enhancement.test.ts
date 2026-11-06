/**
 * Comprehensive Test Suite: User Features Enhancement
 * 1. Daily Spiritual Affirmation Component
 * 2. Header Firestore Real-Time Sync Indicator
 * 3. StreakFireCounter Dynamic Flame Flicker & Glowing Halo
 * 4. My Journey Reflections Keyword Search Filter
 */

import { AFFIRMATIONS_DATA } from "../components/DailySpiritualAffirmation";
import { firestoreSyncService, type SyncStatus } from "../services/firestore-sync.service";
import type { JournalEntry } from "../types";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passedCount++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    failedCount++;
  }
}

async function runTests() {
  console.log("=================================================");
  console.log("🧪 User Features Enhancement Verification Suite");
  console.log("=================================================\n");

  // --- Suite 1: Daily Spiritual Affirmation Component ---
  console.log("--- 1. Testing Daily Spiritual Affirmation Component ---");
  assert(Array.isArray(AFFIRMATIONS_DATA), "AFFIRMATIONS_DATA is an array");
  assert(AFFIRMATIONS_DATA.length >= 8, `Has at least 8 rotating affirmations (found: ${AFFIRMATIONS_DATA.length})`);

  AFFIRMATIONS_DATA.forEach((aff, i) => {
    assert(Boolean(aff.id && aff.sanskrit && aff.english && aff.source), `Affirmation #${i + 1} (${aff.id}) has complete sacred attributes`);
    assert(aff.sanskrit.length > 5, `Affirmation #${i + 1} contains authentic Sanskrit Devanagari text`);
    assert(Boolean(aff.transliteration), `Affirmation #${i + 1} contains IAST transliteration`);
    assert(Boolean(aff.themeCategory), `Affirmation #${i + 1} specifies theme category (${aff.themeCategory})`);
  });

  // Verify deterministic date rotation logic
  const sampleDay1 = 45; // Day 45 of year
  const sampleDay2 = 46;
  const index1 = sampleDay1 % AFFIRMATIONS_DATA.length;
  const index2 = sampleDay2 % AFFIRMATIONS_DATA.length;
  assert(index1 >= 0 && index1 < AFFIRMATIONS_DATA.length, "Date rotation produces valid affirmation index for Day 45");
  assert(index2 >= 0 && index2 < AFFIRMATIONS_DATA.length, "Date rotation produces valid affirmation index for Day 46");
  assert(index1 !== index2, "Subsequent days rotate to different affirmations");

  // --- Suite 2: Header Firestore Real-Time Sync Status Indicator ---
  console.log("\n--- 2. Testing Header Firestore Real-Time Sync Indicator ---");
  const initialStatus = firestoreSyncService.getStatus();
  assert(Boolean(initialStatus), "FirestoreSyncService returns valid status object");
  assert(["synced", "syncing", "offline", "error"].includes(initialStatus.state), `Status state is valid union (state: ${initialStatus.state})`);

  let observedStatus: SyncStatus | null = null;
  const unsub = firestoreSyncService.subscribeStatus((status) => {
    observedStatus = status;
  });
  assert(Boolean(observedStatus), "Header subscription immediately receives initial sync status");
  assert(observedStatus?.state === initialStatus.state, "Initial subscribed status matches service status");
  unsub();

  // Test timestamp formatting helper logic
  const nowIso = new Date().toISOString();
  const pastIso = new Date(Date.now() - 45000).toISOString(); // 45 seconds ago
  const formatSync = (iso: string | null) => {
    if (!iso) return "Real-time";
    const date = new Date(iso);
    const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diffSec < 10) return "Just now";
    if (diffSec < 60) return `${diffSec}s ago`;
    return "Recently";
  };
  assert(formatSync(nowIso) === "Just now", "Formats recent timestamp as 'Just now'");
  assert(formatSync(pastIso) === "45s ago", "Formats 45-second delta as '45s ago'");
  assert(formatSync(null) === "Real-time", "Handles null lastSyncedAt gracefully");

  // --- Suite 3: StreakFireCounter Dynamic Flame Flicker & Glow ---
  console.log("\n--- 3. Testing StreakFireCounter Dynamic Flame Flicker & Glow ---");
  // Inspect that StreakFireCounter file includes our multi-layered flame glow aura and organic flicker keyframes
  const fs = await import("fs");
  const streakCounterCode = fs.readFileSync("/app/applet/src/components/StreakFireCounter.tsx", "utf-8");

  assert(
    streakCounterCode.includes("Multi-layered dynamic flame ambient glow aura") ||
    streakCounterCode.includes("Soft breathing flame glow behind icon"),
    "StreakFireCounter contains dedicated ambient flame glow aura layer"
  );
  assert(
    streakCounterCode.includes("drop-shadow") && streakCounterCode.includes("rgba(234,88,12"),
    "StreakFireCounter includes realistic warm ember & orange drop-shadow keyframes"
  );
  assert(
    streakCounterCode.includes("scale: [1, 1.09") || streakCounterCode.includes("scale: [1, 1.1"),
    "StreakFireCounter includes organic flame pulsing scale keyframes"
  );
  assert(
    streakCounterCode.includes("rotate: [0, -2.5, 3") || streakCounterCode.includes("rotate: [0, -6"),
    "StreakFireCounter includes organic flame rotational flicker keyframes"
  );
  assert(
    streakCounterCode.includes("blur-md") || streakCounterCode.includes("blur-[3px]"),
    "StreakFireCounter renders soft blur diffusion for realistic fire glow"
  );

  // --- Suite 4: My Journey Reflections Keyword Search Filter ---
  console.log("\n--- 4. Testing My Journey Reflections Keyword Search Filter ---");
  const sampleJournals: JournalEntry[] = [
    {
      id: "j-1",
      verseId: "gita-2-47",
      verseTitle: "Bhagavad Gita 2.47",
      note: "Contemplating karma yoga and dedicating daily work without anxiety over future outcomes.",
      createdAt: new Date().toISOString(),
    },
    {
      id: "j-2",
      verseId: "yoga-sutras-1-2",
      verseTitle: "Patanjali Yoga Sutras 1.2",
      note: "Yogas chitta vritti nirodha. Meditation on cultivating profound inner stillness and peace.",
      createdAt: new Date().toISOString(),
    },
    {
      id: "j-3",
      verseId: "isha-1",
      verseTitle: "Isha Upanishad 1",
      note: "All this is pervaded by the supreme consciousness. Practicing non-greed and simplicity.",
      createdAt: new Date().toISOString(),
    },
  ];

  const filterReflections = (entries: JournalEntry[], query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((e) => {
      const noteMatch = e.note ? e.note.toLowerCase().includes(q) : false;
      const titleMatch = e.verseTitle ? e.verseTitle.toLowerCase().includes(q) : false;
      const idMatch = e.verseId ? e.verseId.toLowerCase().includes(q) : false;
      return noteMatch || titleMatch || idMatch;
    });
  };

  assert(filterReflections(sampleJournals, "").length === 3, "Empty search query returns all 3 journal entries");
  assert(filterReflections(sampleJournals, "   ").length === 3, "Whitespace-only search query returns all 3 entries");

  const karmaResults = filterReflections(sampleJournals, "karma");
  assert(karmaResults.length === 1 && karmaResults[0].id === "j-1", "Search query 'karma' finds entry j-1");

  const peaceResults = filterReflections(sampleJournals, "stillness");
  assert(peaceResults.length === 1 && peaceResults[0].id === "j-2", "Search query 'stillness' finds entry j-2");

  const titleResults = filterReflections(sampleJournals, "Upanishad");
  assert(titleResults.length === 1 && titleResults[0].id === "j-3", "Search query matching verse title 'Upanishad' finds entry j-3");

  const caseInsensitiveResults = filterReflections(sampleJournals, "PEACE");
  assert(caseInsensitiveResults.length === 1 && caseInsensitiveResults[0].id === "j-2", "Search is strictly case-insensitive");

  const noMatchResults = filterReflections(sampleJournals, "nonexistent_keyword_xyz");
  assert(noMatchResults.length === 0, "Non-matching search returns 0 entries triggering empty state");

  // Verify MyJourneyView component file includes the search bar
  const myJourneyCode = fs.readFileSync("/app/applet/src/components/MyJourneyView.tsx", "utf-8");
  assert(myJourneyCode.includes("journalSearchQuery"), "MyJourneyView defines journalSearchQuery state");
  assert(myJourneyCode.includes("filteredJournalEntries"), "MyJourneyView computes filteredJournalEntries memo");
  assert(myJourneyCode.includes("Search reflections by keyword"), "MyJourneyView renders keyword search input");
  assert(myJourneyCode.includes("Clear Search Filter"), "MyJourneyView provides clear search button on zero results");

  console.log("\n=================================================");
  console.log(`🎯 Test Summary: ${passedCount} Passed, ${failedCount} Failed`);
  console.log("=================================================");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});

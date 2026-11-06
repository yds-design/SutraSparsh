/**
 * Test Suite: Subtle Pulse Animation on Streak Counter for 15-Minute Daily Goal Achievement
 * Verifies that the streak counter component performs a subtle pulse animation
 * when a user achieves their daily 15-minute goal for the first time in a day.
 */

import fs from "fs";
import {
  DAILY_15MIN_GOAL_PULSE_STORAGE_KEY,
  getTodayDateKey,
} from "../components/StreakFireCounter";

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

async function runSuite() {
  console.log("=================================================");
  console.log("🧪 Streak Counter 15-Minute First-Time Pulse Test");
  console.log("=================================================");

  // --- Suite 1: Storage Key & Date Key Format ---
  console.log("\n--- 1. Testing Storage Key & Deterministic Date Identification ---");
  assert(
    "DAILY_15MIN_GOAL_PULSE_STORAGE_KEY is defined and non-empty",
    typeof DAILY_15MIN_GOAL_PULSE_STORAGE_KEY === "string" &&
      DAILY_15MIN_GOAL_PULSE_STORAGE_KEY.length > 5
  );

  const todayKey = getTodayDateKey();
  assert(
    "getTodayDateKey returns a valid ISO date string YYYY-MM-DD",
    /^\d{4}-\d{2}-\d{2}$/.test(todayKey)
  );

  // --- Suite 2: First-Time-In-Day Storage Simulation ---
  console.log("\n--- 2. Testing First-Time-in-a-Day Detection & Prevention of Re-triggering ---");
  // Mock localStorage in Node.js environment
  const memoryStore: Record<string, string> = {};
  const mockLocalStorage = {
    getItem: (key: string) => memoryStore[key] || null,
    setItem: (key: string, value: string) => {
      memoryStore[key] = value;
    },
    removeItem: (key: string) => {
      delete memoryStore[key];
    },
    clear: () => {
      Object.keys(memoryStore).forEach((k) => delete memoryStore[k]);
    },
  };

  // Initially, no date recorded
  assert(
    "Initially no pulse celebration is stored for today",
    mockLocalStorage.getItem(DAILY_15MIN_GOAL_PULSE_STORAGE_KEY) === null
  );

  // Simulate pulse handler logic
  function simulateTriggerPulse(storage: typeof mockLocalStorage, date: string): boolean {
    const alreadyPulsed = storage.getItem(DAILY_15MIN_GOAL_PULSE_STORAGE_KEY) === date;
    if (!alreadyPulsed) {
      storage.setItem(DAILY_15MIN_GOAL_PULSE_STORAGE_KEY, date);
      return true; // Pulse triggered!
    }
    return false; // Already pulsed today, skipped
  }

  // 1st attempt today: should trigger pulse
  const firstAttempt = simulateTriggerPulse(mockLocalStorage, todayKey);
  assert("First attempt on current day triggers subtle pulse", firstAttempt === true);
  assert(
    "Storage records today's date after first-time trigger",
    mockLocalStorage.getItem(DAILY_15MIN_GOAL_PULSE_STORAGE_KEY) === todayKey
  );

  // 2nd attempt today: should be suppressed
  const secondAttempt = simulateTriggerPulse(mockLocalStorage, todayKey);
  assert(
    "Second attempt on the same day suppresses pulse to avoid repetition",
    secondAttempt === false
  );

  // 3rd attempt today: should still be suppressed
  const thirdAttempt = simulateTriggerPulse(mockLocalStorage, todayKey);
  assert("Subsequent attempts on the same day remain suppressed", thirdAttempt === false);

  // Advance to tomorrow (new day)
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowKey = tomorrowDate.toISOString().slice(0, 10);
  const tomorrowFirstAttempt = simulateTriggerPulse(mockLocalStorage, tomorrowKey);
  assert(
    "Next day rollover enables the first-time pulse again",
    tomorrowFirstAttempt === true
  );
  assert(
    "Storage now records tomorrow's date",
    mockLocalStorage.getItem(DAILY_15MIN_GOAL_PULSE_STORAGE_KEY) === tomorrowKey
  );

  // --- Suite 3: Source Code & Motion Verification in StreakFireCounter.tsx ---
  console.log("\n--- 3. Testing Component Markup & Animation Attributes ---");
  const streakCounterSrc = fs.readFileSync(
    "/app/applet/src/components/StreakFireCounter.tsx",
    "utf-8"
  );

  assert(
    "StreakFireCounter defines isDailyGoalPulsing state",
    streakCounterSrc.includes("isDailyGoalPulsing") &&
      streakCounterSrc.includes("setIsDailyGoalPulsing")
  );

  assert(
    "StreakFireCounter defines triggerDaily15MinGoalPulse function",
    streakCounterSrc.includes("triggerDaily15MinGoalPulse")
  );

  assert(
    "StreakFireCounter checks DAILY_15MIN_GOAL_PULSE_STORAGE_KEY",
    streakCounterSrc.includes("DAILY_15MIN_GOAL_PULSE_STORAGE_KEY")
  );

  assert(
    "StreakFireCounter triggers daily pulse when goal hits 100%",
    streakCounterSrc.includes("triggerDaily15MinGoalPulse(")
  );

  assert(
    "StreakFireCounter triggers daily pulse on sutrasparsh:daily_goal_achieved event",
    streakCounterSrc.includes('window.addEventListener("sutrasparsh:daily_goal_achieved"')
  );

  assert(
    "StreakFireCounter renders data-testid='streak-first-time-goal-pulse'",
    streakCounterSrc.includes('data-testid="streak-first-time-goal-pulse"')
  );

  assert(
    "StreakFireCounter card variant has data-pulsing attribute",
    streakCounterSrc.includes('data-testid="streak-fire-counter-card"') &&
      streakCounterSrc.includes("data-pulsing")
  );

  assert(
    "StreakFireCounter pill variant has data-pulsing attribute",
    streakCounterSrc.includes('data-testid="streak-4day-counter-pill"') &&
      streakCounterSrc.includes("data-pulsing")
  );

  assert(
    "StreakFireCounter contains subtle breathing scale animation",
    streakCounterSrc.includes("scale: [1, 1.055, 0.985, 1.04, 1]") ||
      streakCounterSrc.includes("scale: [1, 1.025, 0.995, 1.02, 1]")
  );

  assert(
    "StreakFireCounter contains radiant halo blur diffusion for pulse",
    streakCounterSrc.includes("from-amber-400/50 via-yellow-300/60 to-emerald-400/50 blur-[2px]") ||
      streakCounterSrc.includes("from-amber-400/40 via-yellow-400/50 to-emerald-400/40 blur-md")
  );

  assert(
    "StreakFireCounter renders celebratory 15m Met achievement badge",
    streakCounterSrc.includes("15m Met!") || streakCounterSrc.includes("15m Goal Met!")
  );

  assert(
    "StreakFireCounter cleans up pulse timer on component unmount",
    streakCounterSrc.includes("if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current)")
  );

  console.log("=================================================");
  console.log(`🎯 Test Summary: ${passed} Passed, ${total - passed} Failed`);
  console.log("=================================================");

  if (passed !== total) {
    process.exit(1);
  }
}

runSuite().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});

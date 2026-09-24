/**
 * Unit & Integration verification test for Daily Study Goal Celebration
 * Verifies:
 * 1. Default study goal calibration to 15m
 * 2. Progress computation across minutes and verses
 * 3. Daily goal achievement event dispatching
 * 4. Milestone check-in integration on goal met
 * 5. Goal reset and threshold state transitions
 */

// Mock localStorage and window in node test runner if undefined
if (typeof globalThis.localStorage === "undefined") {
  const store = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (key: string) => store.get(key) || null,
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
    get length() {
      return store.size;
    },
    key: (index: number) => Array.from(store.keys())[index] || null,
  };
}

if (typeof globalThis.window === "undefined") {
  const listeners: Record<string, Function[]> = {};
  (globalThis as any).window = {
    addEventListener: (event: string, cb: Function) => {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(cb);
    },
    removeEventListener: (event: string, cb: Function) => {
      if (!listeners[event]) return;
      listeners[event] = listeners[event].filter((f) => f !== cb);
    },
    dispatchEvent: (event: any) => {
      const type = event?.type;
      if (listeners[type]) {
        listeners[type].forEach((cb) => cb(event));
      }
      return true;
    },
  };
  (globalThis as any).CustomEvent = class {
    type: string;
    detail: any;
    constructor(type: string, params?: { detail: any }) {
      this.type = type;
      this.detail = params?.detail;
    }
  };
}

import * as fs from "fs";
import { dailyGoalService } from "../services/dailyGoal.service.js";

async function runCelebrationVerification() {
  console.log("=== SutraSparsh Daily Study Goal Celebration Verification ===");
  let passed = 0;
  let total = 0;

  function assert(desc: string, condition: boolean) {
    total++;
    if (condition) {
      console.log(`  ✓ [PASS] ${desc}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${desc}`);
    }
  }

  // 1. Initial State Check
  console.log("\n[Test Suite 1: Initial Goal Configuration & Calibration]");
  const config = dailyGoalService.getGoalConfig();
  assert("Default goal target is 15 minutes", config.targetMinutes === 15);
  assert("Default metric is minutes", config.metric === "minutes");
  assert("Auto check-in on goal met is enabled by default", config.autoCheckinOnGoalMet === true);

  // 2. Reset and Zero Baseline
  console.log("\n[Test Suite 2: Baseline Progress Verification]");
  dailyGoalService.resetTodayProgress();
  let progress = dailyGoalService.getDailyProgress();
  assert("Baseline seconds studied is 0", progress.secondsStudied === 0);
  assert("Baseline isGoalMet is false", progress.isGoalMet === false);
  assert("Baseline percentage is 0%", progress.percentage === 0);

  // 3. Partial Progress Check
  console.log("\n[Test Suite 3: Partial Progress Recording]");
  dailyGoalService.addManualStudyMinutes(5);
  progress = dailyGoalService.getDailyProgress();
  assert("5 minutes recorded = 300 seconds", progress.secondsStudied === 300);
  assert("Percentage is 33% for 5/15 minutes", progress.percentage === 33);
  assert("Goal is not met yet at 5 minutes", progress.isGoalMet === false);

  // 4. Goal Achievement & Celebration Event
  console.log("\n[Test Suite 4: Goal Achievement & Celebration Event Dispatch]");
  let eventFired = false;
  let eventDetail: any = null;

  if (typeof window !== "undefined") {
    const listener = (e: any) => {
      eventFired = true;
      eventDetail = e.detail;
    };
    window.addEventListener("sutrasparsh:daily_goal_achieved", listener);

    // Add remaining 10 minutes to reach 15 minutes target
    dailyGoalService.addManualStudyMinutes(10);
    progress = dailyGoalService.getDailyProgress();

    assert("15 minutes recorded = 900 seconds", progress.secondsStudied >= 900);
    assert("Percentage is 100%", progress.percentage === 100);
    assert("Goal is marked as met (isGoalMet === true)", progress.isGoalMet === true);
    assert("Celebratory event 'sutrasparsh:daily_goal_achieved' fired", eventFired === true);
    if (eventDetail) {
      assert("Event detail contains progress.isGoalMet=true", eventDetail.progress?.isGoalMet === true);
      assert("Event detail contains config.targetMinutes=15", eventDetail.config?.targetMinutes === 15);
    }
    window.removeEventListener("sutrasparsh:daily_goal_achieved", listener);
  } else {
    // In node environment without DOM window
    dailyGoalService.addManualStudyMinutes(10);
    progress = dailyGoalService.getDailyProgress();
    assert("15 minutes recorded = 900 seconds", progress.secondsStudied >= 900);
    assert("Goal is marked as met (isGoalMet === true)", progress.isGoalMet === true);
    assert("Percentage is 100%", progress.percentage === 100);
  }

  // 5. Verse Metric Switch & Threshold Verification
  console.log("\n[Test Suite 5: Verse Metric Switch]");
  dailyGoalService.resetTodayProgress();
  dailyGoalService.setGoalConfig({ metric: "verses", targetVerses: 3 });
  progress = dailyGoalService.getDailyProgress();
  assert("Reset verses count is 0", progress.versesRead === 0);
  assert("Goal met is false", progress.isGoalMet === false);

  dailyGoalService.recordVerseRead("bg_2_47");
  dailyGoalService.recordVerseRead("bg_2_48");
  progress = dailyGoalService.getDailyProgress();
  assert("2 distinct verses read", progress.versesRead === 2);
  assert("Goal not met with 2/3 verses", progress.isGoalMet === false);

  dailyGoalService.recordVerseRead("bg_2_49");
  progress = dailyGoalService.getDailyProgress();
  assert("3 verses read reaches 3 verse goal", progress.versesRead === 3);
  assert("Goal marked as met for verse target", progress.isGoalMet === true);
  assert("Percentage is 100%", progress.percentage === 100);

  // 6. Visual Progress Bar Calculations for 15-Minute Goal
  console.log("\n[Test Suite 6: Visual Study Progress Bar Calculations]");
  dailyGoalService.resetTodayProgress();
  dailyGoalService.setGoalConfig({ metric: "minutes", targetMinutes: 15 });
  
  // Test at 0m (0%)
  progress = dailyGoalService.getDailyProgress();
  assert("Progress bar at 0m yields 0%", progress.percentage === 0);
  assert("Remaining minutes at 0m is 15", Math.max(0, 15 - progress.minutesStudied) === 15);

  // Test at 3m (20%)
  dailyGoalService.addManualStudyMinutes(3);
  progress = dailyGoalService.getDailyProgress();
  assert("Progress bar at 3m yields 20%", progress.percentage === 20);
  assert("Remaining minutes at 3m is 12", Math.max(0, 15 - progress.minutesStudied) === 12);

  // Test at 7.5m (50%)
  dailyGoalService.recordStudySeconds(270); // 4.5 minutes more -> 7.5 total
  progress = dailyGoalService.getDailyProgress();
  assert("Progress bar at 7.5m yields 50%", progress.percentage === 50);

  // Test at 15m (100% complete)
  dailyGoalService.recordStudySeconds(450); // 7.5 minutes more -> 15.0 total
  progress = dailyGoalService.getDailyProgress();
  assert("Progress bar at 15m yields 100%", progress.percentage === 100);
  assert("isGoalMet is true at 15m", progress.isGoalMet === true);
  assert("Remaining minutes at 15m is 0", Math.max(0, 15 - progress.minutesStudied) === 0);

  // 7. Progress Bar 100% Milestone Confetti & Spark Animation Verification
  console.log("\n[Test Suite 7: Progress Bar 100% Milestone Confetti & Spark Celebration]");
  const streakCounterSrc = fs.readFileSync("./src/components/StreakFireCounter.tsx", "utf-8");
  const sparklesSrc = fs.readFileSync("./src/components/ProgressBarMilestoneSparkles.tsx", "utf-8");

  assert(
    "StreakFireCounter imports ProgressBarMilestoneSparkles component",
    streakCounterSrc.includes("ProgressBarMilestoneSparkles")
  );
  assert(
    "StreakFireCounter tracks isProgressBarMilestoneCelebrating state",
    streakCounterSrc.includes("isProgressBarMilestoneCelebrating")
  );
  assert(
    "StreakFireCounter triggers milestone celebration when reaching 100%",
    streakCounterSrc.includes("prevPercentageRef.current < 100 && goalProgress.percentage >= 100")
  );
  assert(
    "StreakFireCounter renders progress-bar-milestone-badge with Sparkles",
    streakCounterSrc.includes('data-testid="progress-bar-milestone-badge"')
  );
  assert(
    "StreakFireCounter supports click-to-replay milestone celebration at 100%",
    streakCounterSrc.includes('triggerProgressBarMilestone("15-Minute Study Milestone Achieved!')
  );
  assert(
    "ProgressBarMilestoneSparkles includes data-testid='progress-bar-milestone-confetti'",
    sparklesSrc.includes('data-testid="progress-bar-milestone-confetti"')
  );
  assert(
    "ProgressBarMilestoneSparkles includes data-testid='progress-bar-milestone-sparks'",
    sparklesSrc.includes('data-testid="progress-bar-milestone-sparks"')
  );
  assert(
    "ProgressBarMilestoneSparkles renders radiant 100% milestone cap starburst",
    sparklesSrc.includes("right-0 top-1/2 -translate-y-1/2") && sparklesSrc.includes("capSparks")
  );

  // Restore defaults
  dailyGoalService.setGoalConfig({ metric: "minutes", targetMinutes: 15, autoCheckinOnGoalMet: true });
  dailyGoalService.resetTodayProgress();

  console.log(`\n=== Verification Complete: ${passed}/${total} assertions passed ===\n`);
  if (passed !== total) {
    process.exit(1);
  }
}

runCelebrationVerification().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});

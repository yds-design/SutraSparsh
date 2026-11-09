/**
 * Test Suite: Ambient Soundscape Selector & Audio Synthesis Engine
 * Verifies that users can choose between 'Temple Bell', 'Himalayan Breeze',
 * or 'River Ganga' background ambient audio in more settings, and that the
 * 432Hz/136.1Hz Tanpura drone audio layer is disabled by default.
 */

import fs from "fs";
import {
  soundEngine,
  SOUNDSCAPES,
  SOUNDSCAPE_STORAGE_KEY,
  TANPURA_DRONE_ENABLED_STORAGE_KEY,
  type AmbientSoundscape,
} from "../utils/audio";

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
  console.log("🧪 Ambient Soundscape & Tanpura Drone Test Suite");
  console.log("=================================================");

  // --- Suite 1: Soundscape Definitions ---
  console.log("\n--- 1. Testing Soundscape Definitions & Metadata ---");
  assert("SOUNDSCAPES is an array with exactly 3 options", Array.isArray(SOUNDSCAPES) && SOUNDSCAPES.length === 3);

  const ids = SOUNDSCAPES.map((s) => s.id);
  assert("Contains 'temple-bell' soundscape", ids.includes("temple-bell"));
  assert("Contains 'himalayan-breeze' soundscape", ids.includes("himalayan-breeze"));
  assert("Contains 'river-ganga' soundscape", ids.includes("river-ganga"));

  const names = SOUNDSCAPES.map((s) => s.name);
  assert("Contains exact name 'Temple Bell'", names.includes("Temple Bell"));
  assert("Contains exact name 'Himalayan Breeze'", names.includes("Himalayan Breeze"));
  assert("Contains exact name 'River Ganga'", names.includes("River Ganga"));

  SOUNDSCAPES.forEach((s) => {
    assert(`${s.name} has authentic Sanskrit Devanagari title (${s.devanagari})`, typeof s.devanagari === "string" && s.devanagari.length > 0);
    assert(`${s.name} has detailed description`, typeof s.description === "string" && s.description.length > 20);
    assert(`${s.name} has acoustic elements list`, Array.isArray(s.elements) && s.elements.length >= 2);
    assert(`${s.name} has visual icon (${s.icon})`, typeof s.icon === "string" && s.icon.length > 0);
  });

  // --- Suite 2: Engine State & Storage Persistence ---
  console.log("\n--- 2. Testing Sound Engine State & Event Notification ---");
  assert("SOUNDSCAPE_STORAGE_KEY is defined", SOUNDSCAPE_STORAGE_KEY === "sutrasparsh_ambient_soundscape");
  assert("TANPURA_DRONE_ENABLED_STORAGE_KEY is defined", TANPURA_DRONE_ENABLED_STORAGE_KEY === "sutrasparsh_tanpura_drone_enabled");

  // Tanpura drone MUST BE DISABLED (false) BY DEFAULT
  assert("Tanpura drone 432Hz/136.1Hz is DISABLED by default (false)", soundEngine.getIsTanpuraEnabled() === false);

  // Test toggling Tanpura drone state
  soundEngine.setTanpuraEnabled(true);
  assert("Tanpura drone state updates to enabled (true) upon explicit request", soundEngine.getIsTanpuraEnabled() === true);

  soundEngine.setTanpuraEnabled(false);
  assert("Tanpura drone state updates back to disabled (false)", soundEngine.getIsTanpuraEnabled() === false);

  const initial = soundEngine.getSoundscape();
  assert("Initial soundscape is a valid AmbientSoundscape", ["temple-bell", "himalayan-breeze", "river-ganga"].includes(initial));

  // Test setting each soundscape
  soundEngine.setSoundscape("himalayan-breeze");
  assert("Sound engine updates soundscape to 'himalayan-breeze'", soundEngine.getSoundscape() === "himalayan-breeze");

  soundEngine.setSoundscape("river-ganga");
  assert("Sound engine updates soundscape to 'river-ganga'", soundEngine.getSoundscape() === "river-ganga");

  soundEngine.setSoundscape("temple-bell");
  assert("Sound engine resets soundscape back to 'temple-bell'", soundEngine.getSoundscape() === "temple-bell");

  // --- Suite 3: Audio Synthesis Engine Structure in audio.ts ---
  console.log("\n--- 3. Testing Web Audio API Synthesis Architecture in audio.ts ---");
  const audioSrc = fs.readFileSync("/app/applet/src/utils/audio.ts", "utf-8");

  assert("audio.ts implements startTempleBellSoundscape", audioSrc.includes("startTempleBellSoundscape"));
  assert("audio.ts implements startHimalayanBreezeSoundscape", audioSrc.includes("startHimalayanBreezeSoundscape"));
  assert("audio.ts implements startRiverGangaSoundscape", audioSrc.includes("startRiverGangaSoundscape"));
  assert("audio.ts implements stopSoundscape", audioSrc.includes("stopSoundscape"));
  assert("audio.ts implements previewSoundscape for 4s audition", audioSrc.includes("previewSoundscape"));
  assert("audio.ts initializes isTanpuraEnabled: boolean = false", audioSrc.includes("isTanpuraEnabled: boolean = false") || audioSrc.includes("isTanpuraEnabled = false"));
  assert("audio.ts only starts tanpura oscillators if isTanpuraEnabled is true", audioSrc.includes("if (this.isTanpuraEnabled)"));
  assert("audio.ts implements startTanpuraOscillators", audioSrc.includes("startTanpuraOscillators"));
  assert("audio.ts implements stopTanpuraOscillators", audioSrc.includes("stopTanpuraOscillators"));
  assert("audio.ts links soundscape playback directly to toggleTanpuraDrone", audioSrc.includes("this.startSoundscape(this.currentSoundscape)"));
  assert("audio.ts cleanly terminates soundscape when stopTanpuraDrone is called", audioSrc.includes("this.stopSoundscape()"));

  // --- Suite 4: Component Integration & Markup ---
  console.log("\n--- 4. Testing SoundscapeSelector Component Markup ---");
  const selectorSrc = fs.readFileSync("/app/applet/src/components/SoundscapeSelector.tsx", "utf-8");

  assert("SoundscapeSelector renders data-testid='soundscape-selector'", selectorSrc.includes('data-testid="soundscape-selector"'));
  assert("SoundscapeSelector renders tanpura settings card", selectorSrc.includes('data-testid="tanpura-drone-settings-card"'));
  assert("SoundscapeSelector renders dedicated tanpura toggle switch", selectorSrc.includes('data-testid="toggle-tanpura-drone"'));
  assert("SoundscapeSelector toggle switch has role='switch'", selectorSrc.includes('role="switch"'));
  assert("SoundscapeSelector highlights 'Disabled by default'", selectorSrc.includes("Disabled by default"));
  assert("SoundscapeSelector allows switching between soundscapes", selectorSrc.includes("soundEngine.setSoundscape"));
  assert("SoundscapeSelector renders preview buttons for listening", selectorSrc.includes("soundEngine.previewSoundscape(soundscape)"));
  assert("SoundscapeSelector adheres to Parchment Dawn tokens", (selectorSrc.includes("#cfcbe0") || selectorSrc.includes("#E8DCC2")) && (selectorSrc.includes("#1b1740") || selectorSrc.includes("#261B12")));

  // --- Suite 5: Integration in Preferences Views ---
  console.log("\n--- 5. Testing Integration in TempleApp & MoreView Preferences ---");
  const templeAppSrc = fs.readFileSync("/app/applet/src/components/SutraSparshTempleApp.tsx", "utf-8");
  const moreViewSrc = fs.readFileSync("/app/applet/src/components/MoreView.tsx", "utf-8");
  const headerSrc = fs.readFileSync("/app/applet/src/components/Header.tsx", "utf-8");

  assert("SutraSparshTempleApp imports SoundscapeSelector", templeAppSrc.includes('import { SoundscapeSelector } from "./SoundscapeSelector"'));
  assert("SutraSparshTempleApp renders SoundscapeSelector in preferences view", templeAppSrc.includes("<SoundscapeSelector isLight={isLight} />"));
  assert("MoreView imports SoundscapeSelector", moreViewSrc.includes('import { SoundscapeSelector } from "./SoundscapeSelector"'));
  assert("MoreView renders SoundscapeSelector in preferences view", moreViewSrc.includes("<SoundscapeSelector isLight={isLightCanvas} />"));
  assert("Header.tsx refers to Ambient Soundscape", headerSrc.includes("Play Meditative Ambient Soundscape"));

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

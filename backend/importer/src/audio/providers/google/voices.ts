/**
 * Google Cloud TTS Voice Discovery Command & Catalog Service
 *
 * Discovers and tabulates candidate voices matching the language code and
 * model capabilities required for classical Sanskrit recitation.
 *
 * CLI Execution: npm run tts:voices
 */

import { TtsVoiceMetadata } from "../../types.js";
import { googleTtsProvider } from "./client.js";

export async function discoverGoogleVoices(languageCode = "hi-IN"): Promise<TtsVoiceMetadata[]> {
  return googleTtsProvider.listVoices(languageCode);
}

/**
 * Formats and prints the voice discovery table to stdout.
 */
export async function runVoiceDiscoveryCli(): Promise<void> {
  const language = "hi-IN";
  const voices = await discoverGoogleVoices(language);

  console.log("\n================================================================================");
  console.log("                       SutraSparsh TTS Voice Discovery                          ");
  console.log("================================================================================");
  console.log(`Language Code: ${language} | Candidate Voices: ${voices.length}\n`);

  console.log(
    "Voice Identifier".padEnd(28) +
      "Model/Family".padEnd(16) +
      "Gender".padEnd(10) +
      "SSML".padEnd(8) +
      "Pace".padEnd(8) +
      "Recommended Use"
  );
  console.log("-".repeat(80));

  for (const voice of voices) {
    const isPrimary = voice.isRecommended ? "⭐ " : "   ";
    const voiceCol = `${isPrimary}${voice.id}`.padEnd(28);
    const familyCol = voice.modelFamily.toUpperCase().padEnd(16);
    const genderCol = voice.gender.padEnd(10);
    const ssmlCol = (voice.supportsSsml ? "YES" : "NO").padEnd(8);
    const paceCol = (voice.supportsPaceControl ? "YES" : "NO").padEnd(8);
    const profilesCol = voice.supportedProfiles.slice(0, 2).join(", ");

    console.log(`${voiceCol}${familyCol}${genderCol}${ssmlCol}${paceCol}${profilesCol}`);
  }

  console.log("-".repeat(80));
  console.log("Tier 1 Candidates: Chirp 3: HD (hi-IN) - Dedicated Pace & Pause Controls");
  console.log("Tier 2 Candidates: Neural2 (hi-IN) - SSML Prosody & Break Controls");
  console.log("Tier 3 Candidates: Journey (hi-IN) - Expressive Scriptural Narration\n");
}

// Auto-run if executed directly as entrypoint script
if (process.argv[1]?.includes("voices.ts") || process.argv[1]?.includes("voices.js")) {
  runVoiceDiscoveryCli().catch((err) => {
    console.error("Voice discovery error:", err);
    process.exit(1);
  });
}

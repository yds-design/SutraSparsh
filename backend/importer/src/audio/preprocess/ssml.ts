/**
 * Sanskrit SSML & Synthesis Input Generator
 *
 * Implements capability-aware synthesis payload formulation:
 * - For SSML-capable voices (e.g. Neural2, Standard): generates standard <speak> with <break time="..."/>
 * - For Chirp 3: HD: generates optimized plain text without unsupported SSML tags, leveraging
 *   native sentence boundaries, danda preservation, and dedicated pace parameters.
 */

import { TtsVoiceMetadata, AudioProfileConfig } from "../types.js";
import { analyzeVersePauses } from "./danda.js";
import { normalizeSanskritUnicode } from "./unicode.js";

export interface SynthesisPayloadResult {
  payload: string;
  inputMode: "ssml" | "text" | "pace_pause_controls";
  characterCount: number;
  pauseCount: number;
  appliedPace: number;
}

/**
 * Escapes XML special characters for safe SSML generation.
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Prepares the synthesis payload tailored to the voice model's confirmed capabilities.
 */
export function prepareSynthesisPayload(
  canonicalText: string,
  voice: TtsVoiceMetadata,
  profile: AudioProfileConfig,
  customPace?: number
): SynthesisPayloadResult {
  const normalized = normalizeSanskritUnicode(canonicalText);
  const pauseAnalysis = analyzeVersePauses(
    normalized,
    profile.dandaPauseMs,
    profile.dvidandaPauseMs
  );
  const targetPace = customPace ?? profile.recommendedPace;

  // 1. If voice is Chirp 3: HD or explicitly does not support standard SSML
  if (voice.modelFamily === "chirp-3-hd" || !voice.supportsSsml) {
    // Chirp 3 HD works best with natural punctuation and spaced lines to trigger unhurried pauses
    const formattedText = pauseAnalysis.segments
      .map((seg) => {
        const punctuation = seg.marker === "dvidanda" ? "॥\n\n" : seg.marker === "danda" ? "।\n" : " ";
        return `${seg.text}${punctuation}`;
      })
      .join("")
      .trim();

    return {
      payload: formattedText,
      inputMode: "pace_pause_controls",
      characterCount: formattedText.length,
      pauseCount: pauseAnalysis.dandaCount + pauseAnalysis.dvidandaCount,
      appliedPace: targetPace,
    };
  }

  // 2. For SSML-capable voices (e.g. Neural2, Standard)
  const ssmlSegments = pauseAnalysis.segments.map((seg) => {
    const escapedText = escapeXml(seg.text);
    const breakTag = seg.pauseAfterMs > 0 ? `<break time="${seg.pauseAfterMs}ms"/>` : "";
    return `${escapedText}${seg.marker === "dvidanda" ? "॥" : seg.marker === "danda" ? "।" : ""}${breakTag}`;
  });

  // Wrap in <speak> with prosody rate if supported
  const body = ssmlSegments.join(" ");
  const prosodyRate = Math.round(targetPace * 100);
  const ssml = `<speak><prosody rate="${prosodyRate}%">${body}</prosody></speak>`;

  return {
    payload: ssml,
    inputMode: "ssml",
    characterCount: ssml.length,
    pauseCount: pauseAnalysis.dandaCount + pauseAnalysis.dvidandaCount,
    appliedPace: targetPace,
  };
}

/**
 * Sanskrit Metric Pause & Danda Preprocessor
 *
 * Deconstructs verses around Single Danda (।) [Ardha-shloka / half verse]
 * and Double Danda (॥) [Purna-shloka / full verse] to calculate natural
 * devotional pause cadences.
 */

import { normalizeSanskritUnicode } from "./unicode.js";

export interface VerseSegment {
  index: number;
  text: string;
  marker: "danda" | "dvidanda" | "none";
  pauseAfterMs: number;
}

export interface VersePauseAnalysis {
  normalizedText: string;
  segments: VerseSegment[];
  dandaCount: number;
  dvidandaCount: number;
  estimatedRecitationDurationMs: number;
}

export const DEFAULT_DANDA_PAUSE_MS = 320;
export const DEFAULT_DVIDANDA_PAUSE_MS = 650;
export const WORD_READING_PACE_MS = 280; // approximate ms per Sanskrit word

/**
 * Analyzes Sanskrit verse structure and calculates intentional pauses
 * at metric boundaries.
 */
export function analyzeVersePauses(
  rawText: string,
  customDandaMs = DEFAULT_DANDA_PAUSE_MS,
  customDvidandaMs = DEFAULT_DVIDANDA_PAUSE_MS
): VersePauseAnalysis {
  const normalized = normalizeSanskritUnicode(rawText);

  // Split while retaining delimiters
  const tokens = normalized.split(/([।॥])/g);
  const segments: VerseSegment[] = [];

  let dandaCount = 0;
  let dvidandaCount = 0;
  let currentSegmentText = "";

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (!token) continue;

    if (token === "।") {
      dandaCount++;
      if (currentSegmentText.trim()) {
        segments.push({
          index: segments.length,
          text: currentSegmentText.trim(),
          marker: "danda",
          pauseAfterMs: customDandaMs,
        });
        currentSegmentText = "";
      }
    } else if (token === "॥") {
      dvidandaCount++;
      if (currentSegmentText.trim()) {
        segments.push({
          index: segments.length,
          text: currentSegmentText.trim(),
          marker: "dvidanda",
          pauseAfterMs: customDvidandaMs,
        });
        currentSegmentText = "";
      }
    } else {
      currentSegmentText += token;
    }
  }

  // Handle any trailing text without terminal danda
  if (currentSegmentText.trim()) {
    segments.push({
      index: segments.length,
      text: currentSegmentText.trim(),
      marker: "none",
      pauseAfterMs: 150,
    });
  }

  // Calculate estimated recitation duration
  const totalWords = normalized.split(/\s+/).filter(Boolean).length;
  const totalPauseMs = segments.reduce((sum, s) => sum + s.pauseAfterMs, 0);
  const estimatedDurationMs = totalWords * WORD_READING_PACE_MS + totalPauseMs;

  return {
    normalizedText: normalized,
    segments,
    dandaCount,
    dvidandaCount,
    estimatedRecitationDurationMs: estimatedDurationMs,
  };
}

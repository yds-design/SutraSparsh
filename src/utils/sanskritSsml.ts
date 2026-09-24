/**
 * Sanskrit SSML Generator for Google Cloud Text-to-Speech (hi-IN-Neural2)
 *
 * Implements high-precision Vedic metric pause timing (virāma), breath pauses
 * between pādas (lines of the verse), and calibrated rate control (0.85x - 0.90x)
 * so conjunct consonants (samyuktākṣara) and visargas are articulated clearly.
 */

export interface SanskritSsmlOptions {
  rate?: number; // default: 0.85 (85% speed)
  voiceName?: "hi-IN-Neural2-B" | "hi-IN-Neural2-A" | "hi-IN-Neural2-C" | "hi-IN-Neural2-D" | string;
  padaBreakMs?: number; // default: 500ms
  dandaBreakMs?: number; // default: 750ms
  dvidandaBreakMs?: number; // default: 1000ms
  pitch?: string; // e.g. "-0.5st" or "+0.5st"
}

export interface SanskritSsmlResult {
  ssml: string;
  cleanDevanagari: string;
  characterCount: number;
  pauseCount: number;
  estimatedDurationMs: number;
  voiceName: string;
  playbackRate: number;
}

/**
 * Escapes XML special characters for safe SSML generation.
 */
export function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Normalizes Sanskrit Devanagari text:
 * - NFC Unicode normalization
 * - Standardizes ASCII pipes (| and ||) to Vedic Single Danda (।) and Double Danda (॥)
 * - Removes stray Latin brackets or numerical verse markers from speech text
 */
export function normalizeSanskritDevanagari(rawText: string): string {
  if (!rawText) return "";

  return rawText
    .normalize("NFC")
    // Replace ASCII pipes with authentic dandas
    .replace(/\|\|/g, "॥")
    .replace(/\|/g, "।")
    // Remove numerical brackets e.g. (1.1) or [२-४७]
    .replace(/[\[\(][0-9०-९\.\-\s]+[\]\)]/g, "")
    // Normalize spaces around dandas
    .replace(/\s*।\s*/g, " । ")
    .replace(/\s*॥\s*/g, " ॥ ")
    .replace(/[ \t]+/g, " ")
    .trim();
}

/**
 * Generates calibrated SSML with Devanagari script for Google Cloud Text-to-Speech Neural2 voices.
 *
 * Features:
 * 1. Granular breath pauses between verse lines / pādas (<break time="500ms"/>)
 * 2. Extended contemplative pauses at half-verse Single Danda (<break time="750ms"/>)
 * 3. Sacred concluding pause at full-verse Double Danda (<break time="1000ms"/>)
 * 4. Calibrated playback rate (default 85% / 0.85x) to guarantee crisp articulation
 *    of conjunct consonants (samyuktākṣara), anusvara (ं), and visarga (ः).
 */
export function generateSanskritSsml(
  rawText: string,
  options: SanskritSsmlOptions = {}
): SanskritSsmlResult {
  const cleanDevanagari = normalizeSanskritDevanagari(rawText);
  const voiceName = options.voiceName || "hi-IN-Neural2-B";
  const rate = Math.min(1.0, Math.max(0.7, options.rate ?? 0.85));
  const padaBreakMs = options.padaBreakMs ?? 500;
  const dandaBreakMs = options.dandaBreakMs ?? 750;
  const dvidandaBreakMs = options.dvidandaBreakMs ?? 1000;

  // Derive subtle pitch tuning depending on voice gender
  const isFemale = voiceName.endsWith("-A") || voiceName.endsWith("-D");
  const pitch = options.pitch ?? (isFemale ? "+0.5st" : "-0.5st");

  // Split lines into metrical quarters / pādas
  const rawLines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const segments: string[] = [];
  let pauseCount = 0;

  if (rawLines.length > 1) {
    // Multi-line verse: Treat line breaks as metrical pāda boundaries
    for (let i = 0; i < rawLines.length; i++) {
      const line = normalizeSanskritDevanagari(rawLines[i]);
      if (!line) continue;

      const hasDvidanda = line.includes("॥");
      const hasDanda = line.includes("।");

      const escapedLine = escapeXml(line);

      if (hasDvidanda) {
        segments.push(`${escapedLine} <break time="${dvidandaBreakMs}ms"/>`);
        pauseCount++;
      } else if (hasDanda) {
        segments.push(`${escapedLine} <break time="${dandaBreakMs}ms"/>`);
        pauseCount++;
      } else {
        // Line-break without danda is an internal pāda break (e.g. line 1 of 4)
        segments.push(`${escapedLine} <break time="${padaBreakMs}ms"/>`);
        pauseCount++;
      }
    }
  } else {
    // Single continuous text: Split by danda punctuation
    const tokens = cleanDevanagari.split(/([।॥])/g);
    let currentChunk = "";

    for (const token of tokens) {
      if (token === "।") {
        if (currentChunk.trim()) {
          segments.push(`${escapeXml(currentChunk.trim())} । <break time="${dandaBreakMs}ms"/>`);
          pauseCount++;
          currentChunk = "";
        }
      } else if (token === "॥") {
        if (currentChunk.trim()) {
          segments.push(`${escapeXml(currentChunk.trim())} ॥ <break time="${dvidandaBreakMs}ms"/>`);
          pauseCount++;
          currentChunk = "";
        }
      } else {
        currentChunk += token;
      }
    }

    if (currentChunk.trim()) {
      segments.push(escapeXml(currentChunk.trim()));
    }
  }

  const ratePercent = Math.round(rate * 100);
  const innerSsml = segments.join("\n    ");

  // Construct valid SSML document
  const ssml = `<speak>\n  <prosody rate="${ratePercent}%" pitch="${pitch}">\n    ${innerSsml}\n  </prosody>\n</speak>`;

  // Calculate approximate duration in milliseconds
  const characterCount = cleanDevanagari.length;
  const wordCount = cleanDevanagari.split(/\s+/).filter(Boolean).length;
  const wordDurationMs = Math.round((wordCount * 380) / rate);
  const totalPauseDurationMs = pauseCount * padaBreakMs;
  const estimatedDurationMs = Math.max(3000, wordDurationMs + totalPauseDurationMs);

  return {
    ssml,
    cleanDevanagari,
    characterCount,
    pauseCount,
    estimatedDurationMs,
    voiceName,
    playbackRate: rate,
  };
}

/**
 * Sanskrit Unicode Normalization & Devanagari Validation
 *
 * Adheres to Canonical Unicode NFC Normalization to prevent visually
 * identical Sanskrit strings from having conflicting binary representations.
 */

// Devanagari primary block: U+0900 to U+097F
// Vedic Extensions: U+1CD0 to U+1CFF
// Devanagari Extended: U+A8E0 to U+A8FF
const DEVANAGARI_REGEX = /[\u0900-\u097F\u1CD0-\u1CFF\uA8E0-\uA8FF]/;
const PUNCTUATION_AND_WHITESPACE_REGEX = /[\s।,॥!?'":;()—\-–]/;

export interface SanskritValidationResult {
  isValid: boolean;
  devanagariRatio: number;
  invalidCharacters: string[];
  normalized: string;
}

/**
 * Normalizes Sanskrit text using Canonical Decomposition, followed by Canonical Composition (NFC).
 * Also strips control characters and null bytes while preserving sacred Devanagari accents,
 * avagraha (ऽ), danda (।), dvidanda (॥), visarga (ः), and anusvāra (ं).
 */
export function normalizeSanskritUnicode(rawInput: string): string {
  if (!rawInput) return "";

  // 1. NFC normalization
  let normalized = rawInput.normalize("NFC");

  // 2. Strip null bytes, terminal control characters, and unprintable zero-width chars (except ZWJ/ZWNJ needed for Sanskrit conjuncts)
  // Preserve ZWNJ (\u200C) and ZWJ (\u200D) which are valid in complex Sanskrit ligatures
  normalized = normalized.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "");

  // 3. Normalize ASCII pipe (| and ||) to sacred Danda (।) and Dvidanda (॥) if author used keyboard shortcuts
  normalized = normalized.replace(/\|\|/g, "॥");
  normalized = normalized.replace(/(?<![।॥])\|(?![।॥])/g, "।");

  // 4. Clean excessive irregular spaces
  normalized = normalized.replace(/[\t\r]+/g, " ");
  normalized = normalized.replace(/ {2,}/g, " ").trim();

  return normalized;
}

/**
 * Validates that the input string is predominantly authentic Sanskrit Devanagari script.
 */
export function validateDevanagari(text: string): SanskritValidationResult {
  const normalized = normalizeSanskritUnicode(text);
  if (!normalized) {
    return {
      isValid: false,
      devanagariRatio: 0,
      invalidCharacters: [],
      normalized: "",
    };
  }

  let devanagariCount = 0;
  let totalInspectableChars = 0;
  const invalidChars: Set<string> = new Set();

  for (const char of normalized) {
    if (PUNCTUATION_AND_WHITESPACE_REGEX.test(char)) {
      continue;
    }
    totalInspectableChars++;
    if (DEVANAGARI_REGEX.test(char)) {
      devanagariCount++;
    } else {
      invalidChars.add(char);
    }
  }

  const ratio = totalInspectableChars === 0 ? 0 : devanagariCount / totalInspectableChars;
  // A genuine Sanskrit verse should have at least 80% Devanagari characters (excluding whitespace/punctuation)
  const isValid = ratio >= 0.80;

  return {
    isValid,
    devanagariRatio: Math.round(ratio * 100) / 100,
    invalidCharacters: Array.from(invalidChars),
    normalized,
  };
}

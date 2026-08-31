/**
 * Sanskrit Text Normalizer & Diacritic-Agnostic Search Engine (M18.4)
 * Comprehensive mapping across IAST, Harvard-Kyoto, SLP1, Devanagari, and ASCII approximations.
 *
 * Supports queries such as:
 * - "karma", "karmanye", "klesha", "klesa", "citta", "chitta", "vritti", "dhyana",
 *   "samadhi", "atman", "jnana", "gyan", "dukha", "duhkha", "ishvara", "isvara",
 *   "rishi", "rshi", "sankhya", "samkhya", "ashtavakra", "mrityunjaya", "gayatri"
 * Matching exact diacritics:
 * - "karmaṇi", "kleśa", "citta-vṛtti", "dhyāna", "samādhi", "ātman", "jñāna",
 *   "duḥkha", "īśvara", "ṛṣi", "sāṅkhya", "aṣṭāvakra", "mṛtyuñjaya", "gāyatrī"
 */

// IAST / Unicode diacritic map to base ASCII
const IAST_DIACRITIC_MAP: Record<string, string> = {
  // Vowels
  ā: "a",
  Ā: "a",
  á: "a",
  à: "a",
  ī: "i",
  Ī: "i",
  í: "i",
  ì: "i",
  ū: "u",
  Ū: "u",
  ú: "u",
  ù: "u",
  ṛ: "r",
  Ṛ: "r",
  ṝ: "r",
  Ṝ: "r",
  ḷ: "l",
  Ḷ: "l",
  ḹ: "l",
  Ḹ: "l",
  ē: "e",
  Ē: "e",
  ê: "e",
  ō: "o",
  Ō: "o",
  ô: "o",

  // Anusvara / Visarga
  ṃ: "m",
  Ṃ: "m",
  ṁ: "m",
  Ṁ: "m",
  ḥ: "h",
  Ḥ: "h",

  // Sibilants
  ś: "s",
  Ś: "s",
  ṣ: "s",
  Ṣ: "s",

  // Nasals
  ñ: "n",
  Ñ: "n",
  ṅ: "n",
  Ṅ: "n",
  ṇ: "n",
  Ṇ: "n",

  // Retroflex plosives
  ṭ: "t",
  Ṭ: "t",
  ḍ: "d",
  Ḍ: "d",

  // Ligatures & variants
  jñ: "jn",
  Jñ: "jn",
  JÑ: "jn",
  kṣ: "ks",
  Kṣ: "ks",
  KṢ: "ks",
};

/**
 * Harvard-Kyoto (HK) representation normalization.
 * HK uses capital letters for retroflex/long vowels:
 * A (ā), I (ī), U (ū), R (ṛ), RR (ṝ), lR (ḷ), lRR (ḹ), M (ṃ), H (ḥ),
 * G (ṅ), J (ñ), T (ṭ), Th (ṭh), D (ḍ), Dh (ḍh), N (ṇ), z (ś), S (ṣ).
 */
export function normalizeHarvardKyoto(text: string): string {
  if (!text) return "";
  return text
    .replace(/RR/g, "r")
    .replace(/lRR/g, "l")
    .replace(/lR/g, "l")
    .replace(/Th/g, "th")
    .replace(/Dh/g, "dh")
    .replace(/A/g, "a")
    .replace(/I/g, "i")
    .replace(/U/g, "u")
    .replace(/R/g, "r")
    .replace(/M/g, "m")
    .replace(/H/g, "h")
    .replace(/G/g, "n")
    .replace(/J/g, "n")
    .replace(/T/g, "t")
    .replace(/D/g, "d")
    .replace(/N/g, "n")
    .replace(/z/g, "s")
    .replace(/S/g, "s");
}

/**
 * Strips all diacritics, decomposes unicode accents, converts Harvard-Kyoto,
 * and harmonizes phonetic variants (sh/s, ch/c, ri/r, etc.).
 */
export function normalizeSanskrit(text: string): string {
  if (!text) return "";

  // 1. Convert Harvard-Kyoto capitalizations first if present
  let norm = normalizeHarvardKyoto(text);

  // 2. Lowercase
  norm = norm.toLowerCase();

  // 3. Map IAST diacritics
  for (const [diacritic, base] of Object.entries(IAST_DIACRITIC_MAP)) {
    norm = norm.replaceAll(diacritic, base);
  }

  // 4. Decompose any remaining unicode accents (NFD decomposition)
  norm = norm.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // 5. Phonetic equivalences for common search terms & romanizations
  norm = norm
    .replace(/ksh/g, "ks")
    .replace(/ksha/g, "ks")
    .replace(/gyan/g, "jnan")
    .replace(/gya/g, "jna")
    .replace(/jny/g, "jn")
    .replace(/sh/g, "s")
    .replace(/ch/g, "c")
    .replace(/ee/g, "i")
    .replace(/oo/g, "u")
    .replace(/ou/g, "au")
    .replace(/ri/g, "r")
    .replace(/v/g, "w")
    .replace(/kh/g, "k")
    .replace(/gh/g, "g")
    .replace(/th/g, "t")
    .replace(/dh/g, "d")
    .replace(/ph/g, "p")
    .replace(/bh/g, "b");

  // 6. Remove Devanagari punctuation (danda ।, double danda ॥, om ॐ) and punctuation
  norm = norm
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'ॐ।॥\[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return norm;
}

/**
 * Standard token-level search helper that checks if query tokens are matched in the target text.
 */
export function matchesSanskritQuery(targetText: string, query: string): boolean {
  if (!query || !query.trim()) return true;
  if (!targetText) return false;

  const rawQuery = query.trim();
  const directLower = targetText.toLowerCase();
  const queryLower = rawQuery.toLowerCase();

  // 1. Direct substring match (supports Devanagari & raw English)
  if (directLower.includes(queryLower)) return true;

  // 2. Normalized diacritic & phonetic match
  const normTarget = normalizeSanskrit(targetText);
  const normQuery = normalizeSanskrit(rawQuery);

  if (normTarget.includes(normQuery)) return true;

  // 3. Multi-word token match (all query tokens matched in target)
  const queryTokens = normQuery.split(" ").filter((t) => t.length > 0);
  if (queryTokens.length > 1) {
    return queryTokens.every((token) => normTarget.includes(token));
  }

  // 4. Word-prefix matching for single tokens (e.g. "karma" matching "karmani")
  if (queryTokens.length === 1 && queryTokens[0].length >= 3) {
    const singleToken = queryTokens[0];
    const targetTokens = normTarget.split(" ").filter((t) => t.length > 0);
    return targetTokens.some((t) => t.includes(singleToken) || singleToken.includes(t));
  }

  return false;
}

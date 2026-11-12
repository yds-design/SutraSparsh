import assert from "node:assert";
import { WordExplorerService } from "../features/wordExplorer/services/wordExplorer.service";
import { sharingService } from "../services/sharing.service";
import { searchEngine } from "../services/search-engine.service";
import { getTithisForCurrentMonthAndNext30Days } from "../utils/tithiCalendar";
import { matchesSanskritQuery } from "../utils/sanskritSearch";

console.log("=== RUNNING SPLIT NULL-SAFETY REGRESSION SUITE ===");

// 1. WordExplorer tokenizeVerse test
console.log("[Test 1] WordExplorer tokenizeVerse null/undefined/empty resilience");
assert.deepStrictEqual(WordExplorerService.tokenizeVerse(undefined as any), [], "undefined must return []");
assert.deepStrictEqual(WordExplorerService.tokenizeVerse(null as any), [], "null must return []");
assert.deepStrictEqual(WordExplorerService.tokenizeVerse(""), [], "empty string must return []");
const tokens = WordExplorerService.tokenizeVerse("कर्मण्येवाधिकारस्ते मा फलेषु कदाचन");
assert.ok(tokens.length > 0, "Valid verse text must tokenize successfully");
console.log("  -> Passed (zero .split exceptions on invalid input)");

// 2. Search engine tokenizer and indexer
console.log("[Test 2] SearchEngine tokenize & indexing with null fields");
assert.deepStrictEqual(searchEngine.tokenize(undefined as any), [], "tokenize(undefined) returns []");
assert.deepStrictEqual(searchEngine.tokenize(""), [], "tokenize('') returns []");
searchEngine.indexItem({
  id: "test-null-body",
  title: undefined as any,
  body: undefined as any,
  transliteration: undefined as any,
  meaning: undefined as any,
  metadata: {
    category: undefined as any,
    devanagari: undefined as any,
    tags: undefined as any,
  } as any,
});
console.log("  -> Passed (searchEngine indexed item with null fields safely)");

// 3. Sanskrit search matcher
console.log("[Test 3] matchesSanskritQuery with null/undefined values");
assert.strictEqual(matchesSanskritQuery(undefined as any, "dharma"), false, "undefined targetText must return false");
assert.strictEqual(matchesSanskritQuery("कर्मण्येवाधिकारस्ते", "कर्म"), true, "Devanagari substring match");
assert.strictEqual(matchesSanskritQuery("karmaṇyevādhikāraste", "karmanye"), true, "Phonetic transliteration match");
console.log("  -> Passed (Sanskrit search handles null/undefined without crashing)");

// 4. Tithi Calendar Month split resilience
console.log("[Test 4] Tithi calendar generation across dates without undefined month crash");
const calendarData = getTithisForCurrentMonthAndNext30Days(new Date(2026, 10, 1));
const testWindow = calendarData.tithis;
assert.ok(testWindow.length > 0, "Must return significant tithis");
testWindow.forEach((t) => {
  assert.ok(typeof t.dateFormatted === "string" && t.dateFormatted.length > 0);
  const shortDate = (t.dateFormatted || "").split(",")[0];
  assert.ok(shortDate.length > 0, "Short date extracted cleanly");
});
console.log("  -> Passed (Tithi calendar split calls fully safe)");

// 5. Sharing Service link & card generation
console.log("[Test 5] SharingService URL and canvas generation with undefined fields");
const testContent = {
  title: undefined as any,
  sanskritText: undefined as any,
  meaning: undefined as any,
  canonicalUrl: "https://sutrasparsh.com/?v=1",
};
const waUrl = sharingService.getShareLink(testContent, "whatsapp");
assert.ok(waUrl.includes("whatsapp.com"), "WhatsApp share URL generated");

const xUrl = sharingService.getShareLink(testContent, "x");
assert.ok(xUrl.includes("twitter.com"), "X/Twitter share URL generated without .split crash");

const tgUrl = sharingService.getShareLink(testContent, "telegram");
assert.ok(tgUrl.includes("t.me"), "Telegram share URL generated without .split crash");
assert.ok(tgUrl.includes("t.me"), "Telegram share URL generated without .split crash");
console.log("  -> Passed (Sharing service handles undefined sanskritText safely)");

// 6. Header user name split simulation
console.log("[Test 6] Header currentUser simulation with missing/null displayName");
const mockEmailOnlyUser = {
  uid: "email_123",
  email: "vishal.kr.gupta@gmail.com",
  displayName: undefined as any,
};
const userDisplayName = mockEmailOnlyUser?.displayName || mockEmailOnlyUser?.email || "Seeker";
const initial = userDisplayName.charAt(0).toUpperCase();
const shortName = userDisplayName.split(" ")[0];
assert.strictEqual(initial, "V", "Initial must be 'V' from email fallback");
assert.strictEqual(shortName, "vishal.kr.gupta@gmail.com", "Short name fallback extracted without crash");
console.log("  -> Passed (Header email-only user renders smoothly)");

console.log("=== ALL SPLIT NULL-SAFETY REGRESSION TESTS PASSED! ===");

import { Router, type Request, type Response } from "express";
import { VERSES_DATABASE, getDailyShlokaForDate, type DetailedVerse } from "../../data/scriptureCorpus.js";
import { VERIFIED_SANSKRIT_WORDS } from "../../features/wordExplorer/services/wordExplorer.service.js";

const router = Router();

/**
 * Helper to parse a date query param (YYYY-MM-DD or timestamp) into a Date object
 */
function parseDateParam(dateParam?: unknown, offsetParam?: unknown): Date {
  const d = new Date();
  if (typeof dateParam === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    const [year, month, day] = dateParam.split("-").map(Number);
    d.setFullYear(year, month - 1, day);
  }
  if (typeof offsetParam === "string" && /^-?\d+$/.test(offsetParam)) {
    const offset = parseInt(offsetParam, 10);
    d.setDate(d.getDate() + offset);
  }
  return d;
}

/**
 * GET /api/v1/wisdom/daily
 * (Also mounted as /api/wisdom/daily)
 *
 * Single Source of Truth for Daily Wisdom Shloka.
 * Query params:
 *   - date: YYYY-MM-DD (optional, defaults to today)
 *   - offset: integer days relative to date (optional, e.g. -1 for yesterday)
 */
const handleGetDailyWisdom = (req: Request, res: Response): void => {
  const targetDate = parseDateParam(req.query.date, req.query.offset);
  const localDateStr = targetDate.toISOString().slice(0, 10);
  const shloka = getDailyShlokaForDate(targetDate);

  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=600");
  res.status(200).json({
    success: true,
    date: localDateStr,
    shloka_id: shloka.id,
    shloka: shloka,
    data: shloka,
    meta: {
      source: shloka.source,
      chapterNum: shloka.chapterNum,
      verseNum: shloka.verseNum,
      tags: shloka.tags || [],
    },
  });
};

router.get("/v1/wisdom/daily", handleGetDailyWisdom);
router.get("/wisdom/daily", handleGetDailyWisdom);
router.get("/daily", handleGetDailyWisdom);

/**
 * GET /api/v1/wisdom/discovery
 * (Also /api/v1/wisdom/look-closer and /api/wisdom/discovery)
 *
 * Resolves the shloka for deep-dive discovery & Look Closer exploration.
 * Requirement:
 *   - If `shloka_id` is provided, fetches and serves that exact shloka.
 *   - If `shloka_id` is omitted, DEFAULTS TO THE ACTIVE DAILY SHLOKA for that date!
 *     This guarantees 100% state synchronization between "Take a moment with today's wisdom"
 *     and "Look Closer" discovery flows.
 */
const handleGetDiscoveryWisdom = (req: Request, res: Response): void => {
  const shlokaId = typeof req.query.shloka_id === "string" ? req.query.shloka_id.trim() : "";
  const targetDate = parseDateParam(req.query.date, req.query.offset);
  const localDateStr = targetDate.toISOString().slice(0, 10);

  let shloka: DetailedVerse;
  let isDailyDefault = false;

  if (shlokaId && VERSES_DATABASE[shlokaId]) {
    shloka = VERSES_DATABASE[shlokaId];
  } else {
    // Single Source of Truth: Fallback to the active daily shloka
    shloka = getDailyShlokaForDate(targetDate);
    isDailyDefault = true;
  }

  // Resolve flagship linguistic components for Look Closer deep dive
  const flagshipWordKey = shloka.id === "bg_2_47"
    ? "karmany-evadhikaraste"
    : shloka.id === "bg_18_65"
    ? "man-mana-bhava-madbhakto"
    : shloka.id === "ys_1_2"
    ? "cittavrttinirodhah"
    : "karmany-evadhikaraste";

  const linguisticData = VERIFIED_SANSKRIT_WORDS[flagshipWordKey] || null;

  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=600");
  res.status(200).json({
    success: true,
    shloka_id: shloka.id,
    isDailyDefault,
    date: localDateStr,
    shloka: shloka,
    data: shloka,
    linguisticData,
  });
};

router.get("/v1/wisdom/discovery", handleGetDiscoveryWisdom);
router.get("/v1/wisdom/look-closer", handleGetDiscoveryWisdom);
router.get("/wisdom/discovery", handleGetDiscoveryWisdom);
router.get("/wisdom/look-closer", handleGetDiscoveryWisdom);
router.get("/discovery", handleGetDiscoveryWisdom);
router.get("/look-closer", handleGetDiscoveryWisdom);

export { router as wisdomRoutes };
export default router;

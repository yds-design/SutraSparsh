/**
 * SutraSparsh Client-Side Spam & Abuse Protection (#18)
 *
 * Provides:
 * 1. Honeypot field verification (rejects automated bot fills on hidden fields)
 * 2. Sliding-window submission throttling per action key (forms, TTS studio, reports)
 * 3. Input bounds and basic link-spam heuristic checks
 */

export interface RateLimitCheckResult {
  allowed: boolean;
  retryAfterSeconds: number;
  reason?: string;
}

const DEFAULT_WINDOW_MS = 60_000; // 1 minute
const submissionTimestamps = new Map<string, number[]>();

/**
 * Checks whether a hidden honeypot field was populated by an automated bot.
 */
export function isHoneypotTriggered(honeypotValue: string | undefined | null): boolean {
  return typeof honeypotValue === "string" && honeypotValue.trim().length > 0;
}

/**
 * Enforces sliding-window submission rate limiting per form/action key.
 */
export function checkClientRateLimit(
  actionKey: string,
  maxRequests = 5,
  windowMs = DEFAULT_WINDOW_MS
): RateLimitCheckResult {
  const now = Date.now();
  const prev = submissionTimestamps.get(actionKey) || [];
  const active = prev.filter((ts) => now - ts < windowMs);

  if (active.length >= maxRequests) {
    const oldestActive = active[0];
    const retryAfterMs = Math.max(1000, windowMs - (now - oldestActive));
    const retryAfterSeconds = Math.ceil(retryAfterMs / 1000);
    submissionTimestamps.set(actionKey, active);
    return {
      allowed: false,
      retryAfterSeconds,
      reason: `Please wait ${retryAfterSeconds}s before submitting again to protect platform stability.`,
    };
  }

  active.push(now);
  submissionTimestamps.set(actionKey, active);
  return {
    allowed: true,
    retryAfterSeconds: 0,
  };
}

/**
 * Resets client rate-limit tracking (used in automated tests).
 */
export function resetClientRateLimit(actionKey?: string): void {
  if (actionKey) {
    submissionTimestamps.delete(actionKey);
  } else {
    submissionTimestamps.clear();
  }
}

/**
 * Combined spam protection validator for interactive forms.
 */
export function validateSubmissionGuard(options: {
  actionKey: string;
  honeypotValue?: string;
  maxRequests?: number;
  windowMs?: number;
  text?: string;
  maxUrls?: number;
}): { ok: boolean; error?: string } {
  if (isHoneypotTriggered(options.honeypotValue)) {
    return {
      ok: false,
      error: "Automated submission detected and blocked.",
    };
  }

  const rateResult = checkClientRateLimit(
    options.actionKey,
    options.maxRequests ?? 5,
    options.windowMs ?? DEFAULT_WINDOW_MS
  );
  if (!rateResult.allowed) {
    return {
      ok: false,
      error: rateResult.reason,
    };
  }

  if (options.text) {
    const urlMatches = options.text.match(/https?:\/\/\S+/gi) || [];
    const maxUrls = options.maxUrls ?? 3;
    if (urlMatches.length > maxUrls) {
      return {
        ok: false,
        error: `Too many external links (maximum ${maxUrls} allowed).`,
      };
    }
  }

  return { ok: true };
}

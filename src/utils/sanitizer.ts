/**
 * SutraSparsh Input Sanitizer & Security Utilities
 * Treats all external inputs (query params, body, search terms, headers) as untrusted.
 */

// Regex patterns to identify and neutralize malicious scripts, injection, and invalid control characters
const SCRIPT_TAG_REGEX = /<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi;
const HTML_TAG_REGEX = /<[^>]+>/g;
const JAVASCRIPT_PROTO_REGEX = /javascript\s*:/gi;
const EVENT_HANDLER_REGEX = /\bon\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;
const CONTROL_CHARS_REGEX = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

export class Sanitizer {
  /**
   * Sanitizes a string by stripping HTML, script tags, event handlers, and invalid control characters.
   */
  public static sanitizeString(input: unknown, maxLength = 10000): string {
    if (input === null || input === undefined) {
      return "";
    }

    let str = String(input);

    // Bound length first to protect against ReDoS
    if (str.length > maxLength) {
      str = str.substring(0, maxLength);
    }

    // Strip control characters
    str = str.replace(CONTROL_CHARS_REGEX, "");

    // Strip script blocks
    str = str.replace(SCRIPT_TAG_REGEX, "");

    // Neutralize javascript: protocols
    str = str.replace(JAVASCRIPT_PROTO_REGEX, "blocked-protocol:");

    // Strip inline HTML event handlers (e.g. onerror=, onclick=)
    str = str.replace(EVENT_HANDLER_REGEX, "");

    // Strip remaining HTML tags
    str = str.replace(HTML_TAG_REGEX, "");

    // Clean whitespace and normalize Unicode
    return str.normalize("NFC").trim();
  }

  /**
   * Sanitizes search queries specifically, ensuring length bounds and Sanskrit character safety.
   */
  public static sanitizeSearchQuery(query: unknown, maxLength = 200): string {
    if (!query) return "";
    const sanitized = this.sanitizeString(query, maxLength);
    // Replace multiple spaces with a single space
    return sanitized.replace(/\s+/g, " ");
  }

  /**
   * Validates and sanitizes an alphanumeric ID (e.g. verse ID, job ID, user ID).
   */
  public static sanitizeId(id: unknown, maxLength = 128): string {
    if (!id || typeof id !== "string") return "";
    const clean = id.trim();
    if (clean.length > maxLength) return "";
    if (/^[a-zA-Z0-9_\-]+$/.test(clean)) {
      return clean;
    }
    return "";
  }

  /**
   * Deep sanitizes any JSON object or array recursively.
   */
  public static sanitizePayload<T>(payload: T): T {
    if (payload === null || payload === undefined) {
      return payload;
    }

    if (typeof payload === "string") {
      return this.sanitizeString(payload) as unknown as T;
    }

    if (typeof payload === "number" || typeof payload === "boolean") {
      return payload;
    }

    if (Array.isArray(payload)) {
      return payload.map((item) => this.sanitizePayload(item)) as unknown as T;
    }

    if (typeof payload === "object") {
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
        const sanitizedKey = this.sanitizeString(key, 100);
        result[sanitizedKey] = this.sanitizePayload(value);
      }
      return result as T;
    }

    return payload;
  }
}

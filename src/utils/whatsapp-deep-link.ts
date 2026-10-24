/**
 * WhatsApp Deep-Linking Utility for sutraSparsh Zero-Fee Pandit Directory
 * Generates pre-filled, URI-encoded message strings and deep-link URLs
 * for mobile (wa.me) and desktop (api.whatsapp.com/web.whatsapp.com).
 */

export interface WhatsAppDeepLinkOptions {
  phone: string;
  panditName: string;
  ritualName: string;
  platform?: "auto" | "mobile" | "desktop";
}

export interface WhatsAppDeepLinkResult {
  url: string;
  mobileUrl: string;
  desktopFallbackUrl: string;
  webWhatsappUrl: string;
  rawMessage: string;
  encodedMessage: string;
  formattedPhone: string;
}

/**
 * Normalizes phone numbers to WhatsApp required format (E.164 without leading + or symbols).
 * If a 10-digit Indian number is provided without country code, '91' is prefixed automatically.
 *
 * Example:
 * "+91 98765-43210" -> "919876543210"
 * "9876543210" -> "919876543210"
 * "09876543210" -> "919876543210"
 */
export function formatWhatsAppPhoneNumber(phone: string): string {
  if (!phone) return "";

  // Strip all non-digit characters
  let digits = phone.replace(/\D/g, "");

  // If starts with 0 and length is 11 (Indian trunk prefix e.g. 09876543210), strip 0
  if (digits.startsWith("0") && digits.length === 11) {
    digits = digits.slice(1);
  }

  // If 10 digits (standard Indian mobile starting with 6, 7, 8, 9), prefix with 91
  if (digits.length === 10 && /^[6-9]/.test(digits)) {
    digits = "91" + digits;
  }

  return digits;
}

/**
 * Normalizes Pandit name to fit the "[Pandit Name]" placeholder in the template.
 * Avoids duplicate honorifics such as "Panditji Pandit Ramesh".
 */
export function formatPanditDisplayName(name: string): string {
  if (!name) return "";
  const trimmed = name.trim();
  // Strip leading "Panditji ", "Pandit ", "Acharya " to cleanly fit "Namaste Panditji [Name]"
  const cleaned = trimmed
    .replace(/^panditji\s+/i, "")
    .replace(/^pandit\s+/i, "")
    .replace(/^acharya\s+/i, "")
    .trim();
  return cleaned || trimmed;
}

/**
 * Generates the standardized pre-filled message string as specified by the business case:
 * "Namaste Panditji [Pandit Name], I found your profile on sutraSparsh and would like to connect regarding the [Selected Ritual] ritual. Please let me know your availability."
 */
export function buildWhatsAppRitualMessage(panditName: string, ritualName: string): string {
  const cleanName = formatPanditDisplayName(panditName);
  const cleanRitual = (ritualName || "sacred puja").trim();
  return `Namaste Panditji ${cleanName}, I found your profile on sutraSparsh and would like to connect regarding the ${cleanRitual} ritual. Please let me know your availability.`;
}

/**
 * Detects whether the current browser environment is desktop or mobile.
 */
export function isMobileDevice(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Constructs the deep-link URL and fallback URLs with complete URI encoding.
 * Correctly encodes special characters, spaces, punctuation, and Sanskrit Unicode diacritics.
 */
export function createWhatsAppDeepLink(options: WhatsAppDeepLinkOptions): WhatsAppDeepLinkResult {
  const formattedPhone = formatWhatsAppPhoneNumber(options.phone);
  const rawMessage = buildWhatsAppRitualMessage(options.panditName, options.ritualName);
  const encodedMessage = encodeURIComponent(rawMessage);

  const mobileUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
  const desktopFallbackUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedMessage}`;
  const webWhatsappUrl = `https://web.whatsapp.com/send?phone=${formattedPhone}&text=${encodedMessage}`;

  let url = mobileUrl;
  const targetPlatform = options.platform || "auto";

  if (targetPlatform === "desktop") {
    url = desktopFallbackUrl;
  } else if (targetPlatform === "auto") {
    // If auto, on non-mobile devices we can default to wa.me which redirects,
    // or api.whatsapp.com which opens WhatsApp Web if desktop app isn't installed.
    url = isMobileDevice() ? mobileUrl : desktopFallbackUrl;
  }

  return {
    url,
    mobileUrl,
    desktopFallbackUrl,
    webWhatsappUrl,
    rawMessage,
    encodedMessage,
    formattedPhone,
  };
}

/**
 * Initiates the WhatsApp connection directly in a safe cross-platform manner.
 */
export function triggerWhatsAppConnect(options: WhatsAppDeepLinkOptions): { success: boolean; url: string } {
  if (typeof window === "undefined") {
    const res = createWhatsAppDeepLink(options);
    return { success: false, url: res.url };
  }

  const { url } = createWhatsAppDeepLink(options);

  try {
    const newWindow = window.open(url, "_blank", "noopener,noreferrer");
    if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
      // Fallback navigation in case popup was blocked
      window.location.href = url;
    }
    return { success: true, url };
  } catch {
    window.location.href = url;
    return { success: true, url };
  }
}

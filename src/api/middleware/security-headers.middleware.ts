import type { Request, Response, NextFunction } from "express";

/**
 * Security Headers Middleware (M17.2)
 * Applies hardened HTTP response headers for defense-in-depth against
 * clickjacking, MIME-sniffing, XSS, and data leakage, while allowing
 * secure iframe embedding within the AI Studio development environment.
 */
export function securityHeadersMiddleware(
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Force modern XSS filter in legacy browsers
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Strict Referrer Policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // HTTP Strict Transport Security
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );

  // Cross-Origin Resource Policy (allow cross-origin embedding for AI Studio preview)
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

  // Permissions Policy - Disable unnecessary device sensors
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
  );

  // Content Security Policy: Permit iframe embedding across AI Studio environments, Firebase Auth helper iframe/scripts, and audio/media streams
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.googletagmanager.com https://www.gstatic.com https://accounts.google.com https://sutrasparsh-17a55.firebaseapp.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: https: blob:; media-src 'self' data: https: blob:; connect-src 'self' https: ws: wss:; frame-src 'self' https://sutrasparsh-17a55.firebaseapp.com https://*.firebaseapp.com https://accounts.google.com; frame-ancestors *;"
  );

  next();
}

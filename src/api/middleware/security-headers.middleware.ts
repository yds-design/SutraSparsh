import type { Request, Response, NextFunction } from "express";

/**
 * Security Headers Middleware (M17.2)
 * Applies hardened HTTP response headers for defense-in-depth against
 * clickjacking, MIME-sniffing, XSS, and data leakage.
 */
export function securityHeadersMiddleware(
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Prevent Clickjacking in iframes (allowing same origin / studio embed)
  res.setHeader("X-Frame-Options", "SAMEORIGIN");

  // Force modern XSS filter in legacy browsers
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Strict Referrer Policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // HTTP Strict Transport Security
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );

  // Cross-Origin Resource & Opener Policies
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");

  // Permissions Policy - Disable unnecessary device sensors
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
  );

  // Content Security Policy
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https: ws: wss:; frame-ancestors 'self' https://ai.studio https://*.google.com;"
  );

  next();
}

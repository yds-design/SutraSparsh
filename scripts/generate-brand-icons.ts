import { Resvg } from "@resvg/resvg-js";
import fs from "node:fs";

/**
 * Official SutraSparsh Brand Identity
 * Faithfully implemented from official brand mark:
 * - Radiant Saffron/Orange Sunrise Emblem (#FF6E14)
 * - Pure Geometric Symmetrical Architecture (Ashṭādhyāyī / Vedic Sunrise motif)
 * - Deep Charcoal Slate Wordmark (#1F242D)
 * - Pure Neutral Canvas (#ECECEC)
 */

export const BRAND_COLORS = {
  orange: "#FF6E14",
  dark: "#1F242D",
  background: "#ECECEC",
  white: "#FFFFFF",
};

// Symmetrical 1024x1024 geometric emblem coordinates
export const SVR_EMBLEM_PATH = `
  M 333 512
  L 333 446
  L 460 469
  L 353 397
  L 420 332
  L 488 440
  L 467 313
  L 557 313
  L 536 440
  L 604 332
  L 671 397
  L 564 469
  L 691 446
  L 691 512
  Z
`.trim().replace(/\s+/g, " ");

export function generateSutraSparshLogoSvg(opts: {
  foregroundOnly?: boolean;
  monochrome?: boolean;
  backgroundOnly?: boolean;
  emblemOnly?: boolean;
} = {}): string {
  const isForegroundOnly = opts.foregroundOnly || false;
  const isMonochrome = opts.monochrome || false;
  const isBackgroundOnly = opts.backgroundOnly || false;
  const isEmblemOnly = opts.emblemOnly || false;

  if (isBackgroundOnly) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
      <rect width="1024" height="1024" fill="${BRAND_COLORS.background}"/>
    </svg>`;
  }

  const bgRect = isForegroundOnly
    ? ""
    : `<rect width="1024" height="1024" fill="${BRAND_COLORS.background}"/>`;

  const emblemColor = isMonochrome ? BRAND_COLORS.white : BRAND_COLORS.orange;
  const textColor = isMonochrome ? BRAND_COLORS.white : BRAND_COLORS.dark;

  if (isEmblemOnly) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
      ${bgRect}
      <g transform="translate(0, 70) scale(1.35) translate(-179, -80)">
        <path d="${SVR_EMBLEM_PATH}" fill="${emblemColor}"/>
      </g>
    </svg>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
    ${bgRect}
    <g id="brand-emblem">
      <path d="${SVR_EMBLEM_PATH}" fill="${emblemColor}"/>
    </g>
    <g id="brand-text" fill="${textColor}" font-family="Archivo Black" font-weight="900" text-anchor="middle">
      <text x="512" y="616" font-size="108" letter-spacing="6px">SUTRA</text>
      <text x="512" y="722" font-size="108" letter-spacing="-1.5px">SPARSH</text>
    </g>
  </svg>`;
}

export function renderPngBuffer(svg: string, width: number): Buffer {
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: width },
    font: {
      fontFiles: [
        "assets/fonts/ArchivoBlack.ttf",
        "assets/fonts/Montserrat.ttf",
        "assets/fonts/Inter.ttf",
      ],
      defaultFontFamily: "Archivo Black",
      loadSystemFonts: false,
    },
  });
  return resvg.render().asPng();
}

export function generateAllBrandIcons() {
  console.log("Generating brand assets from official SutraSparsh logo...");
  const masterSvg = generateSutraSparshLogoSvg();
  const emblemSvg = generateSutraSparshLogoSvg({ emblemOnly: true });

  // Write master SVGs
  fs.writeFileSync("public/logo.svg", masterSvg);
  fs.mkdirSync("public/assets", { recursive: true });
  fs.writeFileSync("public/assets/logo.svg", masterSvg);

  // Render PNG sizes
  const png1024 = renderPngBuffer(masterSvg, 1024);
  const png512 = renderPngBuffer(masterSvg, 512);
  const png192 = renderPngBuffer(masterSvg, 192);
  const faviconPng = renderPngBuffer(emblemSvg, 64);
  const faviconIco = renderPngBuffer(emblemSvg, 48);

  const fgSvg = generateSutraSparshLogoSvg({ foregroundOnly: true });
  const fgPng = renderPngBuffer(fgSvg, 512);

  const bgSvg = generateSutraSparshLogoSvg({ backgroundOnly: true });
  const bgPng = renderPngBuffer(bgSvg, 512);

  const monoSvg = generateSutraSparshLogoSvg({ monochrome: true, foregroundOnly: true });
  const monoPng = renderPngBuffer(monoSvg, 512);

  // Write to public/
  fs.writeFileSync("public/icon-1024.png", png1024);
  fs.writeFileSync("public/icon.png", png512);
  fs.writeFileSync("public/favicon.png", faviconPng);
  fs.writeFileSync("public/favicon.ico", faviconIco);
  fs.writeFileSync("public/assets/icon.png", png512);
  fs.writeFileSync("public/assets/favicon.png", faviconPng);

  // Write to assets/
  fs.mkdirSync("assets", { recursive: true });
  fs.writeFileSync("assets/icon.png", png1024);
  fs.writeFileSync("assets/splash-icon.png", png512);
  fs.writeFileSync("assets/favicon.png", faviconPng);
  fs.writeFileSync("assets/android-icon-foreground.png", fgPng);
  fs.writeFileSync("assets/android-icon-background.png", bgPng);
  fs.writeFileSync("assets/android-icon-monochrome.png", monoPng);

  // Sync to dist/
  if (fs.existsSync("dist")) {
    fs.writeFileSync("dist/icon-1024.png", png1024);
    fs.writeFileSync("dist/icon.png", png512);
    fs.writeFileSync("dist/favicon.png", faviconPng);
    fs.writeFileSync("dist/favicon.ico", faviconIco);
    fs.mkdirSync("dist/assets", { recursive: true });
    fs.writeFileSync("dist/assets/icon.png", png512);
    fs.writeFileSync("dist/assets/favicon.png", faviconPng);
    fs.writeFileSync("dist/logo.svg", masterSvg);
    fs.writeFileSync("dist/assets/logo.svg", masterSvg);
  }

  console.log("All brand assets successfully generated from official logo!");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateAllBrandIcons();
}

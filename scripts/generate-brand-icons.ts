import { Resvg } from "@resvg/resvg-js";
import fs from "node:fs";

export function generateSutraSparshLogoSvg(opts: {
  foregroundOnly?: boolean;
  monochrome?: boolean;
  backgroundOnly?: boolean;
} = {}): string {
  const isForegroundOnly = opts.foregroundOnly || false;
  const isMonochrome = opts.monochrome || false;
  const isBackgroundOnly = opts.backgroundOnly || false;

  const bgRect = isForegroundOnly ? "" : `<rect width="1024" height="1024" fill="url(#bgGrad)"/>`;

  if (isBackgroundOnly) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FF2F28"/>
          <stop offset="25%" stop-color="#FF4B29"/>
          <stop offset="50%" stop-color="#FF6E2F"/>
          <stop offset="75%" stop-color="#FF8E37"/>
          <stop offset="100%" stop-color="#FFAA42"/>
        </linearGradient>
      </defs>
      <rect width="1024" height="1024" fill="url(#bgGrad)"/>
    </svg>`;
  }

  const sutraFill = "#FFFFFF";
  const sparshFill = isMonochrome ? "#FFFFFF" : "#FFD54F";
  const sparshStroke = isMonochrome ? "#000000" : "#FFFFFF";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF2F28"/>
      <stop offset="25%" stop-color="#FF4B29"/>
      <stop offset="50%" stop-color="#FF6E2F"/>
      <stop offset="75%" stop-color="#FF8E37"/>
      <stop offset="100%" stop-color="#FFAA42"/>
    </linearGradient>
  </defs>

  ${bgRect}

  <g id="logo-text">
    <text 
      x="512" 
      y="525" 
      text-anchor="middle" 
      font-family="Fredoka" 
      font-weight="700" 
      font-size="205" 
      fill="${sutraFill}" 
      letter-spacing="-2px"
    >Sutra</text>

    <g transform="translate(512, 615) rotate(-2)">
      <text 
        x="0" 
        y="0" 
        text-anchor="middle" 
        font-family="Pacifico" 
        font-size="160" 
        fill="${sparshStroke}"
        stroke="${sparshStroke}" 
        stroke-width="26" 
        stroke-linejoin="round" 
        stroke-linecap="round"
      >Sparsh</text>
      
      <text 
        x="0" 
        y="0" 
        text-anchor="middle" 
        font-family="Pacifico" 
        font-size="160" 
        fill="${sparshFill}"
      >Sparsh</text>
    </g>
  </g>
</svg>`;
}

export function renderPngBuffer(svg: string, width: number): Buffer {
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: width },
    font: {
      fontFiles: ["assets/fonts/Fredoka.ttf", "assets/fonts/Pacifico.ttf"],
      defaultFontFamily: "Fredoka",
      loadSystemFonts: false,
    },
  });
  return resvg.render().asPng();
}

export function generateAllBrandIcons() {
  const masterSvg = generateSutraSparshLogoSvg();
  
  fs.writeFileSync("public/logo.svg", masterSvg);
  fs.mkdirSync("public/assets", { recursive: true });
  fs.writeFileSync("public/assets/logo.svg", masterSvg);

  const png1024 = renderPngBuffer(masterSvg, 1024);
  const png512 = renderPngBuffer(masterSvg, 512);
  const png192 = renderPngBuffer(masterSvg, 192);
  const png64 = renderPngBuffer(masterSvg, 64);
  const png48 = renderPngBuffer(masterSvg, 48);

  const fgSvg = generateSutraSparshLogoSvg({ foregroundOnly: true });
  const fgPng = renderPngBuffer(fgSvg, 512);

  const bgSvg = generateSutraSparshLogoSvg({ backgroundOnly: true });
  const bgPng = renderPngBuffer(bgSvg, 512);

  const monoSvg = generateSutraSparshLogoSvg({ monochrome: true, foregroundOnly: true });
  const monoPng = renderPngBuffer(monoSvg, 512);

  // Write to public/
  fs.writeFileSync("public/icon-1024.png", png1024);
  fs.writeFileSync("public/icon.png", png512);
  fs.writeFileSync("public/favicon.png", png64);
  fs.writeFileSync("public/favicon.ico", png48);
  fs.writeFileSync("public/assets/icon.png", png512);
  fs.writeFileSync("public/assets/favicon.png", png64);

  // Write to assets/
  fs.mkdirSync("assets", { recursive: true });
  fs.writeFileSync("assets/icon.png", png1024);
  fs.writeFileSync("assets/splash-icon.png", png512);
  fs.writeFileSync("assets/favicon.png", png64);
  fs.writeFileSync("assets/android-icon-foreground.png", fgPng);
  fs.writeFileSync("assets/android-icon-background.png", bgPng);
  fs.writeFileSync("assets/android-icon-monochrome.png", monoPng);

  // Sync to dist/ if present
  if (fs.existsSync("dist")) {
    fs.writeFileSync("dist/icon-1024.png", png1024);
    fs.writeFileSync("dist/icon.png", png512);
    fs.writeFileSync("dist/favicon.png", png64);
    fs.writeFileSync("dist/favicon.ico", png48);
    fs.mkdirSync("dist/assets", { recursive: true });
    fs.writeFileSync("dist/assets/icon.png", png512);
    fs.writeFileSync("dist/assets/favicon.png", png64);
    fs.writeFileSync("dist/logo.svg", masterSvg);
    fs.writeFileSync("dist/assets/logo.svg", masterSvg);
  }

  console.log("All brand assets generated successfully!");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateAllBrandIcons();
}

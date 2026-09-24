#!/usr/bin/env tsx
/**
 * SutraSparsh Google Play Store Marketing Screenshot Generator
 *
 * Generates 1080x1920 (9:16) Play Store marketing screenshots showcasing:
 * 1. Temple Atmosphere Themes (Sandstone, Amethyst, Parchment, Festival, Golden Hour)
 * 2. Sādhana Streak Dashboard (Flame Streak, Brahma Muhurta, Study Radial Goal)
 * 3. Sacred Scripture Corpus (Gita, Yoga Sutras, Upanishads)
 * 4. Word-by-Word Padaccheda (Linguistic & Etymological breakdown)
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const OUTPUT_DIR = path.resolve(process.cwd(), "public", "assets", "screenshots");
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// 1. Temple Atmosphere Showcase (1080x1920)
const svgTempleAtmosphere = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0A0604"/>
      <stop offset="40%" stop-color="#160D08"/>
      <stop offset="75%" stop-color="#241409"/>
      <stop offset="100%" stop-color="#0F0804"/>
    </linearGradient>

    <radialGradient id="diyaGlow" cx="50%" cy="35%" r="45%">
      <stop offset="0%" stop-color="#FF9E1B" stop-opacity="0.25"/>
      <stop offset="50%" stop-color="#D97706" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>

    <linearGradient id="phoneBorder" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F59E0B" stop-opacity="0.6"/>
      <stop offset="50%" stop-color="#78350F" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#D97706" stop-opacity="0.5"/>
    </linearGradient>

    <linearGradient id="goldText" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#FDE68A"/>
      <stop offset="50%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#FBBF24"/>
    </linearGradient>

    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="24" stdDeviation="32" flood-color="#000000" flood-opacity="0.8"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1080" height="1920" fill="url(#bgGrad)"/>
  <circle cx="540" cy="700" r="600" fill="url(#diyaGlow)"/>

  <!-- Top Marketing Headers -->
  <g text-anchor="middle">
    <rect x="360" y="100" width="360" height="46" rx="23" fill="#F59E0B" fill-opacity="0.12" stroke="#F59E0B" stroke-opacity="0.3"/>
    <text x="540" y="130" font-family="system-ui, sans-serif" font-size="18" font-weight="700" fill="#FBBF24" letter-spacing="3">TEMPLE ATMOSPHERE</text>

    <text x="540" y="225" font-family="'Cinzel', Georgia, serif" font-size="52" font-weight="800" fill="url(#goldText)" letter-spacing="1">Immersive Sacred Themes</text>
    <text x="540" y="275" font-family="system-ui, sans-serif" font-size="24" fill="#D6C4B0" fill-opacity="0.85">Sandstone • Amethyst Nocturnal • Parchment • Festival Deepam</text>
  </g>

  <!-- Smartphone Mockup Container -->
  <g transform="translate(120, 340)" filter="url(#shadow)">
    <!-- Phone Outer Shell -->
    <rect width="840" height="1460" rx="64" fill="#120A06" stroke="url(#phoneBorder)" stroke-width="4"/>
    
    <!-- Phone Speaker & Camera Notch -->
    <rect x="340" y="24" width="160" height="24" rx="12" fill="#000000" fill-opacity="0.8"/>
    <circle cx="450" cy="36" r="5" fill="#1F2937"/>

    <!-- Screen Content: Sandstone Temple Sanctuary -->
    <g transform="translate(30, 70)">
      <rect width="780" height="1340" rx="40" fill="#1E130B"/>

      <!-- App Header inside phone -->
      <text x="50" y="70" font-family="'Cinzel', Georgia, serif" font-size="28" font-weight="700" fill="#FDE68A">SutraSparsh</text>
      <text x="730" y="70" text-anchor="end" font-family="system-ui, sans-serif" font-size="18" fill="#F59E0B">🪔 432Hz Drone</text>

      <!-- Theme Switcher Pills -->
      <g transform="translate(50, 110)">
        <rect x="0" y="0" width="130" height="38" rx="19" fill="#D97706" fill-opacity="0.25" stroke="#F59E0B" stroke-width="1.5"/>
        <text x="65" y="24" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" font-weight="700" fill="#FDE68A">Sandstone</text>

        <rect x="145" y="0" width="130" height="38" rx="19" fill="#3B1254" fill-opacity="0.4" stroke="#8B5CF6" stroke-width="1"/>
        <text x="210" y="24" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" fill="#C4B5FD">Amethyst</text>

        <rect x="290" y="0" width="130" height="38" rx="19" fill="#F5EBE0" fill-opacity="0.15" stroke="#E6D7C3" stroke-width="1"/>
        <text x="355" y="24" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" fill="#E6D7C3">Parchment</text>

        <rect x="435" y="0" width="130" height="38" rx="19" fill="#7C1D24" fill-opacity="0.35" stroke="#EF4444" stroke-width="1"/>
        <text x="500" y="24" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" fill="#FCA5A5">Festival</text>

        <rect x="580" y="0" width="100" height="38" rx="19" fill="#B45309" fill-opacity="0.3" stroke="#F59E0B" stroke-width="1"/>
        <text x="630" y="24" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" fill="#FCD34D">Golden</text>
      </g>

      <!-- Sacred Shloka Card in Temple Frame -->
      <g transform="translate(50, 180)">
        <rect width="680" height="680" rx="32" fill="#291A0E" stroke="#D97706" stroke-opacity="0.3" stroke-width="2"/>
        
        <text x="50" y="70" font-family="system-ui, sans-serif" font-size="16" font-weight="700" fill="#F59E0B" letter-spacing="2">BHAGAVAD GITA 2.47</text>
        <text x="630" y="70" text-anchor="end" font-family="system-ui, sans-serif" font-size="15" fill="#9CA3AF">Karma Yoga</text>

        <!-- Sacred Sanskrit Calligraphy -->
        <text x="340" y="190" text-anchor="middle" font-family="'Noto Sans Devanagari', 'Shree Devanagari 714', serif" font-size="34" font-weight="600" fill="#FEF3C7" line-height="1.6">कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।</text>
        <text x="340" y="260" text-anchor="middle" font-family="'Noto Sans Devanagari', 'Shree Devanagari 714', serif" font-size="34" font-weight="600" fill="#FEF3C7" line-height="1.6">मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥</text>

        <!-- Divider with sacred emblem -->
        <line x1="80" y1="330" x2="600" y2="330" stroke="#F59E0B" stroke-opacity="0.3" stroke-width="1.5"/>
        <circle cx="340" cy="330" r="14" fill="#291A0E" stroke="#F59E0B" stroke-width="1.5"/>
        <text x="340" y="335" text-anchor="middle" font-size="12" fill="#F59E0B">ॐ</text>

        <!-- IAST Roman Transliteration -->
        <text x="340" y="390" text-anchor="middle" font-family="Georgia, serif" font-size="20" font-style="italic" fill="#E5D3B8">karmaṇy-evādhikāras te mā phaleṣu kadācana</text>
        <text x="340" y="425" text-anchor="middle" font-family="Georgia, serif" font-size="20" font-style="italic" fill="#E5D3B8">mā karma-phala-hetur bhūr mā te saṅgo 'stvakarmaṇi</text>

        <!-- English Meaning -->
        <text x="340" y="495" text-anchor="middle" font-family="system-ui, sans-serif" font-size="18" fill="#F3E8D6" fill-opacity="0.9">"You have a right only to perform your duties,"</text>
        <text x="340" y="525" text-anchor="middle" font-family="system-ui, sans-serif" font-size="18" fill="#F3E8D6" fill-opacity="0.9">"never to the fruits of action."</text>

        <!-- Listen / Chant Button -->
        <g transform="translate(190, 580)">
          <rect width="300" height="60" rx="30" fill="url(#goldText)"/>
          <text x="150" y="37" text-anchor="middle" font-family="system-ui, sans-serif" font-size="18" font-weight="800" fill="#1C1008">▶ Clean Recitation Voice</text>
        </g>
      </g>

      <!-- Temple Ambience & Sound Control Tray -->
      <g transform="translate(50, 890)">
        <rect width="680" height="220" rx="24" fill="#190F08" stroke="#78350F" stroke-opacity="0.4"/>
        <text x="40" y="50" font-family="system-ui, sans-serif" font-size="18" font-weight="700" fill="#FBBF24">Temple Sound Sanctuary</text>
        <text x="40" y="80" font-family="system-ui, sans-serif" font-size="15" fill="#9CA3AF">Acoustic Tanpura 432Hz Drone • Natural Vedic Meter Pauses</text>

        <!-- Sound Sliders -->
        <text x="40" y="130" font-family="system-ui, sans-serif" font-size="14" fill="#D1D5DB">Tanpura Drone</text>
        <line x1="180" y1="125" x2="520" y2="125" stroke="#F59E0B" stroke-width="6" stroke-linecap="round"/>
        <circle cx="440" cy="125" r="10" fill="#FBBF24"/>
        <text x="620" y="130" text-anchor="end" font-family="system-ui, sans-serif" font-size="14" fill="#F59E0B">75%</text>

        <text x="40" y="180" font-family="system-ui, sans-serif" font-size="14" fill="#D1D5DB">Brahma Bell</text>
        <line x1="180" y1="175" x2="520" y2="175" stroke="#4B5563" stroke-width="6" stroke-linecap="round"/>
        <line x1="180" y1="175" x2="380" y2="175" stroke="#F59E0B" stroke-width="6" stroke-linecap="round"/>
        <circle cx="380" cy="175" r="10" fill="#FBBF24"/>
        <text x="620" y="180" text-anchor="end" font-family="system-ui, sans-serif" font-size="14" fill="#F59E0B">50%</text>
      </g>
    </g>
  </g>
</svg>
`;

// 2. Sadhana Streak Dashboard Showcase (1080x1920)
const svgSadhanaStreak = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
  <defs>
    <linearGradient id="bgGrad2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#08070F"/>
      <stop offset="40%" stop-color="#120D1F"/>
      <stop offset="75%" stop-color="#1E1433"/>
      <stop offset="100%" stop-color="#0B0614"/>
    </linearGradient>

    <radialGradient id="streakGlow" cx="50%" cy="30%" r="50%">
      <stop offset="0%" stop-color="#F97316" stop-opacity="0.3"/>
      <stop offset="40%" stop-color="#EF4444" stop-opacity="0.1"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>

    <linearGradient id="phoneBorder2" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F97316" stop-opacity="0.6"/>
      <stop offset="50%" stop-color="#9333EA" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#EA580C" stop-opacity="0.5"/>
    </linearGradient>

    <linearGradient id="flameGrad" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stop-color="#DC2626"/>
      <stop offset="50%" stop-color="#EA580C"/>
      <stop offset="100%" stop-color="#FDE047"/>
    </linearGradient>

    <filter id="shadow2" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="24" stdDeviation="32" flood-color="#000000" flood-opacity="0.85"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1080" height="1920" fill="url(#bgGrad2)"/>
  <circle cx="540" cy="650" r="600" fill="url(#streakGlow)"/>

  <!-- Top Marketing Headers -->
  <g text-anchor="middle">
    <rect x="340" y="100" width="400" height="46" rx="23" fill="#EA580C" fill-opacity="0.15" stroke="#F97316" stroke-opacity="0.35"/>
    <text x="540" y="130" font-family="system-ui, sans-serif" font-size="18" font-weight="700" fill="#FB923C" letter-spacing="3">SĀDHANA DISCIPLINE</text>

    <text x="540" y="225" font-family="'Cinzel', Georgia, serif" font-size="52" font-weight="800" fill="#FFEDD5" letter-spacing="1">Daily Streak Dashboard</text>
    <text x="540" y="275" font-family="system-ui, sans-serif" font-size="24" fill="#CBD5E1" fill-opacity="0.85">Brahma Muhurta Dawn Timers • 15m Contemplation Radial Goal</text>
  </g>

  <!-- Smartphone Mockup Container -->
  <g transform="translate(120, 340)" filter="url(#shadow2)">
    <!-- Phone Outer Shell -->
    <rect width="840" height="1460" rx="64" fill="#0D0A14" stroke="url(#phoneBorder2)" stroke-width="4"/>
    
    <!-- Phone Notch -->
    <rect x="340" y="24" width="160" height="24" rx="12" fill="#000000" fill-opacity="0.8"/>
    <circle cx="450" cy="36" r="5" fill="#1F2937"/>

    <!-- Screen Content: Sadhana Streak Dashboard -->
    <g transform="translate(30, 70)">
      <rect width="780" height="1340" rx="40" fill="#151022"/>

      <!-- App Top Bar inside phone -->
      <text x="50" y="70" font-family="'Cinzel', Georgia, serif" font-size="28" font-weight="700" fill="#FED7AA">Sādhana Tracker</text>
      <g transform="translate(580, 45)">
        <rect width="150" height="36" rx="18" fill="#EA580C" fill-opacity="0.2" stroke="#F97316" stroke-opacity="0.4"/>
        <text x="75" y="24" text-anchor="middle" font-family="system-ui, sans-serif" font-size="15" font-weight="800" fill="#FDBA74">🔥 7-Day Streak</text>
      </g>

      <!-- Hero Streak Card with Big Flame & Days -->
      <g transform="translate(50, 110)">
        <rect width="680" height="340" rx="32" fill="#201736" stroke="#F97316" stroke-opacity="0.4" stroke-width="2"/>
        
        <!-- Large Flame Graphic -->
        <g transform="translate(80, 60)">
          <circle cx="70" cy="90" r="65" fill="#EA580C" fill-opacity="0.15"/>
          <path d="M70,20 C85,60 115,80 115,115 C115,145 95,165 70,165 C45,165 25,145 25,115 C25,85 55,60 70,20 Z" fill="url(#flameGrad)"/>
          <path d="M70,65 C78,85 92,100 92,118 C92,135 82,148 70,148 C58,148 48,135 48,118 C48,100 62,85 70,65 Z" fill="#FEF08A"/>
        </g>

        <g transform="translate(260, 80)">
          <text x="0" y="55" font-family="'Cinzel', Georgia, serif" font-size="64" font-weight="900" fill="#FFF7ED">7 DAYS</text>
          <text x="0" y="95" font-family="system-ui, sans-serif" font-size="20" font-weight="600" fill="#FDBA74">Continuous Sādhana Active</text>
          <text x="0" y="130" font-family="system-ui, sans-serif" font-size="16" fill="#94A3B8">Top 5% of dedicated Sanskrit seekers</text>
        </g>

        <!-- 7-Day Completion Dots Row -->
        <g transform="translate(70, 250)">
          <circle cx="30" cy="20" r="18" fill="#EA580C"/><text x="30" y="25" text-anchor="middle" font-size="12" fill="#FFF" font-weight="bold">M</text>
          <circle cx="110" cy="20" r="18" fill="#EA580C"/><text x="110" y="25" text-anchor="middle" font-size="12" fill="#FFF" font-weight="bold">T</text>
          <circle cx="190" cy="20" r="18" fill="#EA580C"/><text x="190" y="25" text-anchor="middle" font-size="12" fill="#FFF" font-weight="bold">W</text>
          <circle cx="270" cy="20" r="18" fill="#EA580C"/><text x="270" y="25" text-anchor="middle" font-size="12" fill="#FFF" font-weight="bold">T</text>
          <circle cx="350" cy="20" r="18" fill="#EA580C"/><text x="350" y="25" text-anchor="middle" font-size="12" fill="#FFF" font-weight="bold">F</text>
          <circle cx="430" cy="20" r="18" fill="#EA580C"/><text x="430" y="25" text-anchor="middle" font-size="12" fill="#FFF" font-weight="bold">S</text>
          <circle cx="510" cy="20" r="18" fill="#F59E0B" stroke="#FEF08A" stroke-width="2"/><text x="510" y="25" text-anchor="middle" font-size="12" fill="#000" font-weight="bold">S</text>
        </g>
      </g>

      <!-- 15m Contemplation Radial Progress Ring -->
      <g transform="translate(50, 480)">
        <rect width="680" height="320" rx="32" fill="#1C1430" stroke="#8B5CF6" stroke-opacity="0.3" stroke-width="2"/>
        
        <!-- Radial Ring Progress -->
        <g transform="translate(140, 160)">
          <circle cx="0" cy="0" r="85" fill="none" stroke="#2D214D" stroke-width="18"/>
          <circle cx="0" cy="0" r="85" fill="none" stroke="#F59E0B" stroke-width="18" stroke-dasharray="534" stroke-dashoffset="106" stroke-linecap="round" transform="rotate(-90)"/>
          <text x="0" y="10" text-anchor="middle" font-family="system-ui, sans-serif" font-size="34" font-weight="900" fill="#FFF">80%</text>
          <text x="0" y="36" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="#CBD5E1">12 / 15 MIN</text>
        </g>

        <g transform="translate(280, 80)">
          <text x="0" y="30" font-family="system-ui, sans-serif" font-size="24" font-weight="800" fill="#FFF">Daily Study Goal</text>
          <text x="0" y="65" font-family="system-ui, sans-serif" font-size="16" fill="#A78BFA">3 minutes remaining today</text>
          <text x="0" y="110" font-family="system-ui, sans-serif" font-size="15" fill="#94A3B8">• Shloka 2.47 Recitation (6m)</text>
          <text x="0" y="138" font-family="system-ui, sans-serif" font-size="15" fill="#94A3B8">• Padaccheda Word Study (4m)</text>
          <text x="0" y="166" font-family="system-ui, sans-serif" font-size="15" fill="#94A3B8">• Meditative 432Hz Audio (2m)</text>
        </g>
      </g>

      <!-- Brahma Muhurta Dawn Timer Card -->
      <g transform="translate(50, 830)">
        <rect width="680" height="200" rx="28" fill="#18112A" stroke="#F59E0B" stroke-opacity="0.3"/>
        <text x="40" y="55" font-family="system-ui, sans-serif" font-size="20" font-weight="700" fill="#FDE68A">🌅 Brahma Muhurta Awakening</text>
        <text x="40" y="90" font-family="system-ui, sans-serif" font-size="15" fill="#94A3B8">Optimal meditative dawn alignment: 04:24 AM - 05:12 AM</text>
        
        <g transform="translate(40, 120)">
          <rect width="180" height="42" rx="21" fill="#F59E0B" fill-opacity="0.2" stroke="#F59E0B" stroke-width="1"/>
          <text x="90" y="27" text-anchor="middle" font-family="system-ui, sans-serif" font-size="15" font-weight="700" fill="#FBBF24">Alarm Set 04:30 AM</text>
        </g>
      </g>
    </g>
  </g>
</svg>
`;

async function main() {
  console.log("🎨 Generating SutraSparsh Google Play Store Marketing Screenshots (1080x1920)...");

  // Write SVGs
  const file1Svg = path.join(OUTPUT_DIR, "screenshot-1-temple-atmosphere.svg");
  const file1Png = path.join(OUTPUT_DIR, "screenshot-1-temple-atmosphere.png");
  fs.writeFileSync(file1Svg, svgTempleAtmosphere.trim(), "utf-8");

  const file2Svg = path.join(OUTPUT_DIR, "screenshot-2-sadhana-streak.svg");
  const file2Png = path.join(OUTPUT_DIR, "screenshot-2-sadhana-streak.png");
  fs.writeFileSync(file2Svg, svgSadhanaStreak.trim(), "utf-8");

  // Also copy to public/store-assets/
  const storeAssetsDir = path.resolve(process.cwd(), "public", "store-assets");
  fs.writeFileSync(path.join(storeAssetsDir, "screenshot-1-temple-atmosphere.svg"), svgTempleAtmosphere.trim(), "utf-8");
  fs.writeFileSync(path.join(storeAssetsDir, "screenshot-2-sadhana-streak.svg"), svgSadhanaStreak.trim(), "utf-8");

  // Render to 1080x1920 PNG via ffmpeg
  try {
    console.log("Rendering screenshot 1: Temple Atmosphere (1080x1920 PNG)...");
    execSync(`ffmpeg -y -i "${file1Svg}" -vf "scale=1080:1920" "${file1Png}"`, { stdio: "pipe" });
    fs.copyFileSync(file1Png, path.join(storeAssetsDir, "screenshot-1-temple-atmosphere.png"));
    console.log(`✅ Generated: ${file1Png}`);

    console.log("Rendering screenshot 2: Sadhana Streak (1080x1920 PNG)...");
    execSync(`ffmpeg -y -i "${file2Svg}" -vf "scale=1080:1920" "${file2Png}"`, { stdio: "pipe" });
    fs.copyFileSync(file2Png, path.join(storeAssetsDir, "screenshot-2-sadhana-streak.png"));
    console.log(`✅ Generated: ${file2Png}`);
  } catch (err: any) {
    console.warn("Notice during ffmpeg png conversion:", err.message);
  }

  console.log("✨ Google Play Store marketing screenshots generated successfully!");
}

main().catch((err) => {
  console.error("Error generating screenshots:", err);
});

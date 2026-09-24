/**
 * SEO Compliance & Feature Verification Suite for SutraSparsh
 * Verifies:
 * 1. Title length & quality (30-60 chars, branded, non-generic)
 * 2. Meta description length & quality (120-160 chars, compelling CTA)
 * 3. Sync between metadata.json and index.html
 * 4. OpenGraph and Twitter card metadata integrity
 * 5. Schema.org JSON-LD structured data syntax and feature coverage
 * 6. Search engine crawler directives (robots.txt, canonical links, sitemap.xml)
 * 7. Implemented daily study goal and celebration feature integration
 */

import fs from "fs";
import path from "path";

// Mock localStorage and window in node test runner if undefined
if (typeof globalThis.localStorage === "undefined") {
  const store = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (key: string) => store.get(key) || null,
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
    get length() {
      return store.size;
    },
    key: (index: number) => Array.from(store.keys())[index] || null,
  };
}

if (typeof globalThis.window === "undefined") {
  const listeners: Record<string, Function[]> = {};
  (globalThis as any).window = {
    addEventListener: (event: string, cb: Function) => {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(cb);
    },
    removeEventListener: (event: string, cb: Function) => {
      if (!listeners[event]) return;
      listeners[event] = listeners[event].filter((f) => f !== cb);
    },
    dispatchEvent: (event: any) => {
      const type = event?.type;
      if (listeners[type]) {
        listeners[type].forEach((cb) => cb(event));
      }
      return true;
    },
  };
  (globalThis as any).CustomEvent = class {
    type: string;
    detail: any;
    constructor(type: string, params?: { detail: any }) {
      this.type = type;
      this.detail = params?.detail;
    }
  };
}

import { dailyGoalService } from "../services/dailyGoal.service.js";

async function runSEOVerification() {
  console.log("=== SutraSparsh SEO Compliance & Verification Suite ===\n");
  let passed = 0;
  let total = 0;

  function assert(desc: string, condition: boolean) {
    total++;
    if (condition) {
      console.log(`  ✓ [PASS] ${desc}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${desc}`);
    }
  }

  // 1. metadata.json Verification
  console.log("[Test Suite 1: metadata.json Integrity]");
  const metadataPath = path.resolve("./metadata.json");
  assert("metadata.json exists", fs.existsSync(metadataPath));
  const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
  assert("metadata.name is 'SutraSparsh'", metadata.name === "SutraSparsh");
  assert(
    "metadata.description is between 120 and 160 characters",
    metadata.description && metadata.description.length >= 120 && metadata.description.length <= 160
  );
  assert(
    "metadata.majorCapabilities includes MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API",
    Array.isArray(metadata.majorCapabilities) &&
      metadata.majorCapabilities.includes("MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API")
  );

  // 2. index.html Head Metadata
  console.log("\n[Test Suite 2: Primary SEO & Social Metadata in index.html]");
  const indexPath = path.resolve("./index.html");
  assert("index.html exists", fs.existsSync(indexPath));
  const indexHtml = fs.readFileSync(indexPath, "utf-8");

  // Title check
  const titleMatch = indexHtml.match(/<title>([^<]+)<\/title>/i);
  assert("Title tag exists", !!titleMatch);
  const titleText = titleMatch ? titleMatch[1].replace(/&amp;/g, "&") : "";
  assert(
    `Title length is between 30 and 60 chars (Current: ${titleText.length})`,
    titleText.length >= 30 && titleText.length <= 60
  );
  assert("Title includes 'SutraSparsh'", titleText.includes("SutraSparsh"));
  assert("Title is not generic placeholder", !/^(vite app|react app|home|my app)$/i.test(titleText));

  // Description check
  const descMatch = indexHtml.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  assert("Meta description tag exists", !!descMatch);
  const descText = descMatch ? descMatch[1] : "";
  assert(
    `Meta description length is between 120 and 160 chars (Current: ${descText.length})`,
    descText.length >= 120 && descText.length <= 160
  );
  assert(
    "Meta description synced with metadata.json",
    descText === metadata.description
  );

  // Canonical tag check
  const canonicalMatch = indexHtml.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  assert("Canonical link tag exists", !!canonicalMatch);
  assert("Canonical URL is https://sutrasparsh.com/", canonicalMatch?.[1] === "https://sutrasparsh.com/");

  // Robots meta tags
  assert("Robots directive allows index and follow", indexHtml.includes('name="robots"') && indexHtml.includes("index, follow"));
  assert("Googlebot directive configured", indexHtml.includes('name="googlebot"'));
  assert("Bingbot directive configured", indexHtml.includes('name="bingbot"'));

  // 3. OpenGraph & Twitter Cards
  console.log("\n[Test Suite 3: OpenGraph & Twitter Social Share Cards]");
  assert("og:type is website", indexHtml.includes('property="og:type" content="website"'));
  assert("og:site_name is SutraSparsh", indexHtml.includes('property="og:site_name" content="SutraSparsh"'));
  assert("og:title is configured", indexHtml.includes('property="og:title"'));
  assert("og:description is configured and matches meta description", indexHtml.includes(`property="og:description" content="${descText}"`));
  assert("og:image is configured with high-res icon", indexHtml.includes('property="og:image" content="https://sutrasparsh.com/icon-1024.png"'));
  assert("og:image dimensions specified (1024x1024)", indexHtml.includes('property="og:image:width" content="1024"') && indexHtml.includes('property="og:image:height" content="1024"'));
  assert("twitter:card is summary_large_image", indexHtml.includes('name="twitter:card" content="summary_large_image"'));
  assert("twitter:title is configured", indexHtml.includes('name="twitter:title"'));
  assert("twitter:description is configured", indexHtml.includes('name="twitter:description"'));
  assert("twitter:image is configured", indexHtml.includes('name="twitter:image"'));

  // 4. Schema.org JSON-LD Structured Data
  console.log("\n[Test Suite 4: Schema.org JSON-LD Structured Data]");
  const jsonLdMatch = indexHtml.match(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/i);
  assert("JSON-LD script tag exists in head", !!jsonLdMatch);
  let parsedJsonLd: any = null;
  try {
    parsedJsonLd = JSON.parse(jsonLdMatch![1]);
    assert("JSON-LD parses cleanly without syntax errors", true);
  } catch (e) {
    assert("JSON-LD parses cleanly without syntax errors", false);
  }

  if (parsedJsonLd && parsedJsonLd["@graph"]) {
    const graph: any[] = parsedJsonLd["@graph"];
    const websiteObj = graph.find((item) => item["@type"] === "WebSite");
    assert("Schema.org includes WebSite entity", !!websiteObj);
    assert("WebSite has SearchAction potentialAction", !!websiteObj?.potentialAction);

    const orgObj = graph.find((item) => item["@type"] === "Organization");
    assert("Schema.org includes Organization entity", !!orgObj);

    const appObj = graph.find(
      (item) =>
        item["@type"] === "SoftwareApplication" ||
        item["@type"] === "WebApplication" ||
        (Array.isArray(item["@type"]) && item["@type"].includes("WebApplication"))
    );
    assert("Schema.org includes WebApplication / SoftwareApplication", !!appObj);
    assert("WebApplication specifies priceCurrency", !!appObj?.offers?.priceCurrency);
    
    // Check featureList mentions daily study goals
    const features: string[] = appObj?.featureList || [];
    assert(
      "Schema.org featureList highlights Daily Study Goals",
      features.some((f) => f.toLowerCase().includes("daily study goals") || f.toLowerCase().includes("progress bar"))
    );
    assert(
      "Schema.org featureList highlights Celebratory Milestones",
      features.some((f) => f.toLowerCase().includes("celebrat") || f.toLowerCase().includes("confetti"))
    );
    assert(
      "Schema.org featureList highlights Radiant Spark & Confetti Milestone Animation",
      features.some((f) => f.toLowerCase().includes("spark") && f.toLowerCase().includes("confetti"))
    );
  }

  // 5. Noscript & Crawler Accessibility
  console.log("\n[Test Suite 5: Noscript & Indexable Content]");
  assert("Noscript fallback container exists", indexHtml.includes("<noscript>"));
  assert("Noscript includes daily study goals link", indexHtml.includes("tab=my-journey"));

  // 6. Robots.txt and Sitemap.xml
  console.log("\n[Test Suite 6: Search Engine Discovery Assets]");
  const robotsPath = path.resolve("./public/robots.txt");
  assert("public/robots.txt exists", fs.existsSync(robotsPath));
  const robotsContent = fs.readFileSync(robotsPath, "utf-8");
  assert("robots.txt declares Sitemap location", robotsContent.includes("Sitemap: https://sutrasparsh.com/sitemap.xml"));
  assert("robots.txt allows Googlebot and Bingbot", robotsContent.includes("Googlebot") && robotsContent.includes("Bingbot"));

  const sitemapPath = path.resolve("./public/sitemap.xml");
  assert("public/sitemap.xml exists", fs.existsSync(sitemapPath));
  const sitemapContent = fs.readFileSync(sitemapPath, "utf-8");
  assert("sitemap.xml contains home entry", sitemapContent.includes("<loc>https://sutrasparsh.com/</loc>"));
  assert("sitemap.xml contains daily study journey entry", sitemapContent.includes("<loc>https://sutrasparsh.com/?tab=my-journey</loc>"));

  // 7. Verification of Goal & Streak Feature Service
  console.log("\n[Test Suite 7: Implemented Features Runtime Contract]");
  dailyGoalService.resetTodayProgress();
  const goalConf = dailyGoalService.getGoalConfig();
  assert("Default study target is calibrated to 15 minutes", goalConf.targetMinutes === 15);
  dailyGoalService.recordStudySeconds(900); // 15 mins
  const doneProgress = dailyGoalService.getDailyProgress();
  assert("15-minute study target reaches 100% completion", doneProgress.percentage === 100);
  assert("15-minute study target marks isGoalMet as true", doneProgress.isGoalMet === true);
  dailyGoalService.resetTodayProgress();

  console.log(`\n=== SEO Verification Complete: ${passed}/${total} assertions passed ===\n`);
  if (passed !== total) {
    process.exit(1);
  }
}

runSEOVerification().catch((err) => {
  console.error("Fatal SEO verification error:", err);
  process.exit(1);
});

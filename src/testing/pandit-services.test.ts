/**
 * Automated Verification Suite for sutraSparsh Pandit Profile & Click-to-WhatsApp Integration
 * 
 * Verifies:
 * 1. Phone number normalization (E.164 without leading + or symbols)
 * 2. WhatsApp message template generation with exact business case structure
 * 3. Sanskrit diacritics & special character URI encoding
 * 4. Target URL format (wa.me) & desktop fallback (api.whatsapp.com)
 * 5. PanditTrustBadges component metadata props & accessibility
 * 6. Semantic HTML & SEO compliance (ProfessionalService schema, sitemap, index.html)
 */

import {
  formatWhatsAppPhoneNumber,
  formatPanditDisplayName,
  buildWhatsAppRitualMessage,
  createWhatsAppDeepLink,
} from "../utils/whatsapp-deep-link";
import { PANDIT_CORPUS } from "../data/panditCorpus";
import * as fs from "fs";
import * as path from "path";

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  ✗ [FAIL] ${message}`);
    failed++;
  }
}

console.log("=== SutraSparsh Pandit Profile & WhatsApp Integration Test Suite ===");

// ════════════ TEST SUITE 1: Phone Number Formatting & Normalization ════════════
console.log("\n[Test Suite 1: Phone Number Normalization]");

const phone1 = formatWhatsAppPhoneNumber("+91 98201 44521");
assert(phone1 === "919820144521", "Strips '+', spaces, and preserves country code 91");

const phone2 = formatWhatsAppPhoneNumber("9820144521");
assert(phone2 === "919820144521", "Automatically prefixes 10-digit Indian mobile numbers with 91");

const phone3 = formatWhatsAppPhoneNumber("+91-94440-21893");
assert(phone3 === "919444021893", "Strips hyphens and '+' symbol");

const phone4 = formatWhatsAppPhoneNumber("09820144521");
assert(phone4 === "919820144521", "Strips leading trunk 0 and prefixes 91 for Indian mobile numbers");

const phone5 = formatWhatsAppPhoneNumber("(+91) 99002 77164");
assert(phone5 === "919900277164", "Handles parentheses and arbitrary spacing");

// ════════════ TEST SUITE 2: Pandit Name Normalization & Template Formatting ════════════
console.log("\n[Test Suite 2: Pandit Name Normalization & Message Template]");

const cleanName1 = formatPanditDisplayName("Pandit Ramesh Shastri");
assert(cleanName1 === "Ramesh Shastri", "Strips leading 'Pandit' prefix cleanly");

const cleanName2 = formatPanditDisplayName("Acharya Krishna Kant Joshi");
assert(cleanName2 === "Krishna Kant Joshi", "Strips leading 'Acharya' prefix cleanly");

const cleanName3 = formatPanditDisplayName("Sundaram Dikshitar");
assert(cleanName3 === "Sundaram Dikshitar", "Preserves names without honorific prefix");

const message1 = buildWhatsAppRitualMessage("Ramesh Shastri", "Griha Pravesha & Vastu Shanti");
assert(
  message1 ===
    "Namaste Panditji Ramesh Shastri, I found your profile on sutraSparsh and would like to connect regarding the Griha Pravesha & Vastu Shanti ritual. Please let me know your availability.",
  "Constructs exact business case message template for Griha Pravesha"
);

const message2 = buildWhatsAppRitualMessage("Pandit Sundaram Dikshitar", "Upanayana Samskara");
assert(
  message2 ===
    "Namaste Panditji Sundaram Dikshitar, I found your profile on sutraSparsh and would like to connect regarding the Upanayana Samskara ritual. Please let me know your availability.",
  "Constructs exact message with normalized Panditji name and requested ritual"
);

// ════════════ TEST SUITE 3: Sanskrit Unicode & Special Character URI Encoding ════════════
console.log("\n[Test Suite 3: Sanskrit Unicode & Special Character URI Encoding]");

const deepLinkResult = createWhatsAppDeepLink({
  phone: "+91 98201 44521",
  panditName: "Pandit Ramesh Shastri",
  ritualName: "Śrī Satyanārāyaṇa Vrata & Laghū Rudrābhiṣeka",
});

assert(deepLinkResult.formattedPhone === "919820144521", "Deep-link result includes formatted phone");
assert(
  deepLinkResult.rawMessage.includes("Śrī Satyanārāyaṇa Vrata & Laghū Rudrābhiṣeka"),
  "Raw message preserves sacred Sanskrit IAST diacritics and ampersands"
);
assert(
  deepLinkResult.encodedMessage.includes("%C5%9Ar%C4%AB"),
  "URI encoding safely encodes Sanskrit unicode 'Śrī'"
);
assert(
  !deepLinkResult.encodedMessage.includes(" "),
  "URI encoded message has zero raw whitespace characters"
);

// ════════════ TEST SUITE 4: Target URL Formats & Desktop Fallback ════════════
console.log("\n[Test Suite 4: Target URL Formats & Fallbacks]");

assert(
  deepLinkResult.mobileUrl.startsWith("https://wa.me/919820144521?text="),
  "Mobile URL uses https://wa.me/[phone]?text= format"
);
assert(
  deepLinkResult.desktopFallbackUrl.startsWith("https://api.whatsapp.com/send?phone=919820144521&text="),
  "Desktop fallback URL uses https://api.whatsapp.com/send?phone=[phone]&text= format"
);
assert(
  deepLinkResult.webWhatsappUrl.startsWith("https://web.whatsapp.com/send?phone=919820144521&text="),
  "Web WhatsApp URL uses https://web.whatsapp.com/send?phone=[phone]&text= format"
);

const desktopResult = createWhatsAppDeepLink({
  phone: "9820144521",
  panditName: "Ramesh Shastri",
  ritualName: "Rudrabhishek",
  platform: "desktop",
});
assert(
  desktopResult.url.startsWith("https://api.whatsapp.com/send?phone=919820144521"),
  "Platform 'desktop' routes to api.whatsapp.com"
);

const mobileResult = createWhatsAppDeepLink({
  phone: "9820144521",
  panditName: "Ramesh Shastri",
  ritualName: "Rudrabhishek",
  platform: "mobile",
});
assert(
  mobileResult.url.startsWith("https://wa.me/919820144521"),
  "Platform 'mobile' routes to wa.me"
);

// ════════════ TEST SUITE 5: Pandit Corpus & Trust Signals ════════════
console.log("\n[Test Suite 5: Pandit Corpus & Trust Signals Data]");

assert(PANDIT_CORPUS.length >= 6, "Seed corpus contains at least 6 verified Vedic priests");

const allHaveRituals = PANDIT_CORPUS.every((p) => p.rituals && p.rituals.length >= 2);
assert(allHaveRituals, "Every priest profile offers at least 2 rituals with durations");

const verifiedPriests = PANDIT_CORPUS.filter((p) => p.isVerified);
assert(verifiedPriests.length >= 5, "Corpus contains verified priests with Pathashala credentials");

const allVerifiedHaveDetails = verifiedPriests.every(
  (p) => p.verificationDetails && p.verificationDetails.institution && p.verificationDetails.credentialId
);
assert(allVerifiedHaveDetails, "All verified priests have certifying institution and credential ID");

const endorsedPriests = PANDIT_CORPUS.filter((p) => p.peerEndorsements && p.peerEndorsements.length > 0);
assert(endorsedPriests.length >= 4, "Corpus contains priests with peer endorsements");

const allEndorsementsValid = endorsedPriests.every((p) =>
  p.peerEndorsements.every((pe) => pe.endorserName && pe.endorserTitle && pe.comment)
);
assert(allEndorsementsValid, "All peer endorsements contain endorser name, title, and testimonial");

// ════════════ TEST SUITE 6: Component Files & Semantic HTML Audit ════════════
console.log("\n[Test Suite 6: Component Files & Semantic HTML Audit]");

const badgesFilePath = path.resolve("src/components/services/PanditTrustBadges.tsx");
assert(fs.existsSync(badgesFilePath), "PanditTrustBadges.tsx exists");
const badgesCode = fs.readFileSync(badgesFilePath, "utf8");
assert(badgesCode.includes('role="group"'), "PanditTrustBadges uses accessible role='group'");
assert(badgesCode.includes('role="tooltip"'), "PanditTrustBadges flyout implements role='tooltip'");
assert(badgesCode.includes("aria-expanded"), "PanditTrustBadges implements aria-expanded for interactive states");
assert(badgesCode.includes("aria-label"), "PanditTrustBadges provides screen-reader accessible aria-label");
assert(badgesCode.includes("onMouseEnter"), "PanditTrustBadges implements desktop hover trigger");
assert(badgesCode.includes("onClick"), "PanditTrustBadges implements mobile tap trigger");
assert(badgesCode.includes("Escape"), "PanditTrustBadges supports Escape key dismissal");

const cardFilePath = path.resolve("src/components/services/PanditProfileCard.tsx");
assert(fs.existsSync(cardFilePath), "PanditProfileCard.tsx exists");
const cardCode = fs.readFileSync(cardFilePath, "utf8");
assert(cardCode.includes("<article"), "PanditProfileCard uses semantic <article> element");
assert(cardCode.includes("<header"), "PanditProfileCard uses semantic <header> element");
assert(cardCode.includes("<footer"), "PanditProfileCard uses semantic <footer> element");
assert(cardCode.includes("PanditTrustBadges"), "PanditProfileCard renders PanditTrustBadges in header");
assert(cardCode.includes("createWhatsAppDeepLink"), "PanditProfileCard uses WhatsApp deep-linking utility");
assert(cardCode.includes("Select Requested Ritual"), "PanditProfileCard includes interactive ritual selector");

const viewFilePath = path.resolve("src/components/services/PanditServicesView.tsx");
assert(fs.existsSync(viewFilePath), "PanditServicesView.tsx exists");
const viewCode = fs.readFileSync(viewFilePath, "utf8");
assert(viewCode.includes("ProfessionalService"), "PanditServicesView includes Schema.org ProfessionalService schema");
assert(viewCode.includes("selectedTradition"), "PanditServicesView implements tradition filtering");
assert(viewCode.includes("selectedLanguage"), "PanditServicesView implements language filtering");
assert(viewCode.includes("selectedRitualCategory"), "PanditServicesView implements ritual category filtering");
assert(viewCode.includes("verifiedOnly"), "PanditServicesView implements verified-only filter");
assert(viewCode.includes("peerEndorsedOnly"), "PanditServicesView implements peer-endorsed filter");

// ════════════ TEST SUITE 7: Navigation & App Integration ════════════
console.log("\n[Test Suite 7: Navigation & App Integration]");

const headerFilePath = path.resolve("src/components/Header.tsx");
const headerCode = fs.readFileSync(headerFilePath, "utf8");
assert(headerCode.includes('"services"'), "Header.tsx NavTab includes 'services'");
assert(headerCode.includes('id="tab-services"'), "Header.tsx includes tab-services button");

const appFilePath = path.resolve("src/App.tsx");
const appCode = fs.readFileSync(appFilePath, "utf8");
assert(appCode.includes("PanditServicesView"), "App.tsx imports PanditServicesView");
assert(appCode.includes('activeTab === "services"'), "App.tsx renders PanditServicesView for activeTab === 'services'");
assert(appCode.includes("Vedic Purohit Directory & Ritual Services"), "App.tsx defines tabMetadata for services");

const moreViewPath = path.resolve("src/components/MoreView.tsx");
const moreViewCode = fs.readFileSync(moreViewPath, "utf8");
assert(moreViewCode.includes('onNavigateTab?.("services")'), "MoreView.tsx provides link to services tab");

// ════════════ TEST SUITE 8: SEO, Schema & Sitemap Compliance ════════════
console.log("\n[Test Suite 8: SEO, Schema & Sitemap Compliance]");

const indexHtmlPath = path.resolve("index.html");
const indexHtmlCode = fs.readFileSync(indexHtmlPath, "utf8");
assert(indexHtmlCode.includes("Vedic Purohit Directory"), "index.html Schema.org contains Vedic Purohit Directory");
assert(indexHtmlCode.includes("/?tab=services"), "index.html noscript includes /?tab=services link");

const sitemapPath = path.resolve("public/sitemap.xml");
const sitemapCode = fs.readFileSync(sitemapPath, "utf8");
assert(sitemapCode.includes("<loc>https://sutrasparsh.com/?tab=services</loc>"), "sitemap.xml includes ?tab=services entry");

// ════════════ SUMMARY ════════════
console.log(`\n=== Verification Complete: ${passed}/${passed + failed} assertions passed ===`);
if (failed > 0) {
  process.exit(1);
}

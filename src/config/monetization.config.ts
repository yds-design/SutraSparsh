/**
 * Phase 16 — Monetization Strategy & Foundation Configuration (M25)
 * Defines product pricing, free vs premium matrices, ethical boundaries, and subscription rules.
 */

import type { SubscriptionPlan, SubscriptionPlanId, EntitlementKey } from "../types/monetization.js";

export const ETHICAL_MONETIZATION_PRINCIPLES = [
  "Core sacred verses and foundational meanings remain 100% accessible to every seeker regardless of ability to pay.",
  "Monetization supports scholarly preservation, audio production, and server infrastructure with complete financial transparency.",
  "No intrusive pop-ups during active recitation or meditation timers.",
  "Fair and transparent refund policy with easy 1-click self-service cancellation.",
  "Zero data selling or third-party behavioral ad tracking.",
];

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlanId, SubscriptionPlan> = {
  free: {
    id: "free",
    name: { en: "Jijñāsu (Seeker)", hi: "जिज्ञासु (साधारण)" },
    description: {
      en: "Essential daily sacred verses, foundational word lookup, and contemplation tools.",
      hi: "दैनिक श्लोक, मूल शब्दार्थ और मनन के आवश्यक साधन।"
    },
    pricing: {
      INR: { currency: "INR", amount: 0, interval: "month", displayPrice: "₹0 / forever" },
      USD: { currency: "USD", amount: 0, interval: "month", displayPrice: "$0 / forever" }
    },
    trialDays: 0,
    gracePeriodDays: 0,
    entitlements: [],
    features: [
      { en: "Daily Shloka & basic reflection", hi: "दैनिक श्लोक और चिंतन", included: true },
      { en: "Standard Devanagari & IAST transliteration", hi: "देवनागरी एवं IAST पाठ", included: true },
      { en: "Basic word dictionary lookup (3 lookups/day)", hi: "मूल शब्दार्थ (3 प्रति दिन)", included: true },
      { en: "Save up to 5 favorite verses", hi: "अधिकतम 5 पसंदीदा श्लोक सहेजें", included: true },
      { en: "Comprehensive Vedic commentaries", hi: "विस्तृत भाष्य एवं टीकाएँ", included: false },
      { en: "Unlimited word-by-word Sanskrit etymology", hi: "असीमित शब्दार्थ एवं व्युत्पत्ति", included: false },
      { en: "Studio master chanting audio & Vedic meter chants", hi: "स्टूडियो पाठ एवं वैदिक स्वर", included: false },
      { en: "Offline study mode & audio downloads", hi: "ऑफलाइन अध्ययन एवं डाउनलोड", included: false },
    ]
  },
  sadhaka_monthly: {
    id: "sadhaka_monthly",
    name: { en: "Sādhaka (Practitioner)", hi: "साधक (मासिक)" },
    badge: { en: "Monthly", hi: "मासिक" },
    description: {
      en: "Deepen your sacred journey with full dictionary access, multi-tradition commentaries, and unlimited bookmarks.",
      hi: "संपूर्ण शब्दकोश, विभिन्न भाष्य एवं असीमित संग्रह के साथ अपनी साधना को समृद्ध करें।"
    },
    pricing: {
      INR: { currency: "INR", amount: 199, interval: "month", displayPrice: "₹199 / month" },
      USD: { currency: "USD", amount: 4.99, interval: "month", displayPrice: "$4.99 / month" }
    },
    trialDays: 7,
    gracePeriodDays: 3,
    entitlements: [
      "premium",
      "advancedSearch",
      "unlimitedBookmarks",
      "premiumAudio",
      "exclusiveCommentaries",
      "wisdomJournalSync"
    ],
    features: [
      { en: "Unlimited word-by-word Sanskrit & Hindi dictionary", hi: "असीमित संस्कृत-हिंदी शब्दार्थ", included: true, highlight: true },
      { en: "Authentic commentaries (Shankara, Ramanuja, Aurobindo)", hi: "प्रामाणिक भाष्य (शंकराचार्य, रामानुज, अरविंद)", included: true },
      { en: "Unlimited bookmarks and Wisdom Journal cloud sync", hi: "असीमित पसंदीदा एवं डायरी क्लाउड सिंक", included: true },
      { en: "High-fidelity Sanskrit recitation & Om drone audio", hi: "उच्च गुणवत्ता मंत्रोच्चारण एवं ॐ ध्वनि", included: true },
      { en: "Advanced search with IAST and semantic filters", hi: "उन्नत खोज एवं व्याकरण विश्लेषण", included: true },
      { en: "7-day risk-free trial, cancel anytime", hi: "7 दिन का निःशुल्क परीक्षण", included: true, highlight: true },
    ]
  },
  rishi_annual: {
    id: "rishi_annual",
    name: { en: "Rishi (Sage Annual)", hi: "ऋषि (वार्षिक)" },
    badge: { en: "Best Value • 37% Off", hi: "सर्वश्रेष्ठ • 37% छूट" },
    popular: true,
    description: {
      en: "Complete immersion for dedicated scholars and devotees. Includes offline listening and future study tracks.",
      hi: "समर्पित साधकों और स्वाध्यायियों के लिए पूर्ण अनुभव। ऑफलाइन ऑडियो और आगामी पाठ शामिल।"
    },
    pricing: {
      INR: { currency: "INR", amount: 1499, interval: "year", displayPrice: "₹1,499 / year (₹125/mo)", savingsPercentage: 37 },
      USD: { currency: "USD", amount: 39.99, interval: "year", displayPrice: "$39.99 / year ($3.33/mo)", savingsPercentage: 33 }
    },
    trialDays: 7,
    gracePeriodDays: 5,
    entitlements: [
      "premium",
      "advancedSearch",
      "unlimitedBookmarks",
      "premiumAudio",
      "exclusiveCommentaries",
      "offlineAccess",
      "wisdomJournalSync",
      "expertQnA"
    ],
    features: [
      { en: "Everything in Sādhaka Monthly", hi: "साधक योजना की सभी सुविधाएँ", included: true },
      { en: "Save 37% compared to monthly plan", hi: "मासिक योजना की तुलना में 37% की बचत", included: true, highlight: true },
      { en: "Full offline download of scripture tracks & chants", hi: "ऑफलाइन श्लोक एवं ऑडियो डाउनलोड", included: true, highlight: true },
      { en: "Priority access to newly restored Upanishadic texts", hi: "नए उपनिषद ग्रंथों तक प्राथमिकता से पहुंच", included: true },
      { en: "Dedicated spiritual scholarship Q&A portal", hi: "विद्वान प्रश्नोत्तरी एवं परामर्श", included: true },
      { en: "Gurukula Certificate of Scripture Immersion", hi: "स्वाध्याय प्रमाण पत्र", included: true },
    ]
  },
  ashram_patron: {
    id: "ashram_patron",
    name: { en: "Ashram Patron (Lifetime)", hi: "आश्रम संरक्षक (आजीवन)" },
    badge: { en: "Patronage", hi: "संरक्षक" },
    description: {
      en: "Lifetime unlimited access for you and your family, plus patron recognition in the digital archive.",
      hi: "आपके और परिवार के लिए आजीवन असीमित पहुंच, एवं डिजिटल संग्रहालय में संरक्षक सम्मान।"
    },
    pricing: {
      INR: { currency: "INR", amount: 4999, interval: "lifetime", displayPrice: "₹4,999 / lifetime" },
      USD: { currency: "USD", amount: 99.99, interval: "lifetime", displayPrice: "$99.99 / lifetime" }
    },
    trialDays: 0,
    gracePeriodDays: 0,
    entitlements: [
      "premium",
      "advancedSearch",
      "unlimitedBookmarks",
      "premiumAudio",
      "exclusiveCommentaries",
      "offlineAccess",
      "wisdomJournalSync",
      "expertQnA",
      "commercialUse"
    ],
    features: [
      { en: "Lifetime access to all current and future scriptures", hi: "सभी वर्तमान एवं भावी ग्रंथों का आजीवन उपयोग", included: true, highlight: true },
      { en: "Digital certificate & archive patron listing", hi: "डिजिटल प्रमाण पत्र एवं संरक्षक सूची में नाम", included: true },
      { en: "Includes 80G tax exemption donation allocation", hi: "80G कर छूट रसीद सहित", included: true },
    ]
  },
  institutional: {
    id: "institutional",
    name: { en: "Gurukula / Institutional", hi: "गुरुकुल / संस्थागत" },
    description: {
      en: "Campus and ashram multi-seat licenses with bulk academic access and API integration.",
      hi: "गुरुकुल, विश्वविद्यालय एवं आश्रमों के लिए बहु-उपयोगकर्ता लाइसेंस।"
    },
    pricing: {
      INR: { currency: "INR", amount: 14999, interval: "year", displayPrice: "₹14,999 / year (50 seats)" },
      USD: { currency: "USD", amount: 299.99, interval: "year", displayPrice: "$299.99 / year (50 seats)" }
    },
    trialDays: 14,
    gracePeriodDays: 10,
    entitlements: [
      "premium",
      "advancedSearch",
      "unlimitedBookmarks",
      "premiumAudio",
      "exclusiveCommentaries",
      "offlineAccess",
      "wisdomJournalSync",
      "expertQnA",
      "commercialUse"
    ],
    features: [
      { en: "Up to 50 concurrent student/researcher seats", hi: "50 समवर्ती शोधार्थी खाते", included: true },
      { en: "REST API & bulk Sanskrit corpora export", hi: "REST API एवं डेटा निर्यात", included: true },
      { en: "Dedicated technical & academic support", hi: "समर्पित तकनीकी सहायता", included: true },
    ]
  }
};

export const DONATION_PRESETS = [
  { amount: 108, currency: "INR", label: "₹108 (Auspicious)", meaning: "Sacred 108 beads • Supports 1 week of digital hosting" },
  { amount: 501, currency: "INR", label: "₹501 (Vedic Scholar)", meaning: "Supports authentic manuscript proofreading & translation" },
  { amount: 1008, currency: "INR", label: "₹1,008 (Sahasra)", meaning: "Funds high-resolution Devanagari audio digitisation", popular: true },
  { amount: 5000, currency: "INR", label: "₹5,000 (Sanatana Patron)", meaning: "Complete chapter commentary restoration & 80G Tax receipt" },
];

export const FEATURE_ENTITLEMENT_MAP: Record<string, EntitlementKey> = {
  "unlimited_dictionary": "premium",
  "full_commentaries": "exclusiveCommentaries",
  "audio_recitation_hd": "premiumAudio",
  "offline_downloads": "offlineAccess",
  "unlimited_journal": "wisdomJournalSync",
  "advanced_semantic_search": "advancedSearch",
};

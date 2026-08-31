import React, { useState, useEffect } from "react";
import { speechSafetyEngine } from "../utils/speech";
import { recitationEngine } from "../utils/recitationEngine";
import { PricingModal } from "./PricingModal";
import { DonationModal } from "./DonationModal";
import { SutraSparshTempleApp } from "./SutraSparshTempleApp";

export interface WordDictEntry {
  trans: string;
  en: string;
  hi: string;
}

export interface AppConfig {
  page: {
    eyebrow: string;
    title: string;
    subtitle: string;
  };
  modal: {
    title: string;
    body: string;
    cta: string;
    confirmNote: string;
  };
  appName: string;
  dayNumber: number;
  sessionMinutes: number;
  verseLines: string[];
  transliterationLines: string[];
  sourceCitation: string;
  wordDict: Record<string, WordDictEntry>;
  audio: {
    idle: { en: string; hi: string };
    playing: { en: string; hi: string };
  };
  closing: {
    title: { en: string; hi: string };
    subtitle: { en: string; hi: string };
  };
  promo: {
    icon: string;
    title: string;
    subtitle: string;
  };
  history: Array<{ title: string; sub: string }>;
}

export const DEFAULT_CONFIG: AppConfig = {
  page: {
    eyebrow: "Early Access Preview",
    title: "Your Daily Shloka",
    subtitle: "A living verse, a language of your choosing, and a dictionary at your fingertip."
  },
  modal: {
    title: "Your Daily Shloka App Preview",
    body: "Tap words in the shloka card below to test the premium dictionary lookup — in English or Hindi — or listen to the chant.",
    cta: "Join Early Access Waitlist →",
    confirmNote: "You're on the list — we'll notify you before public launch."
  },
  appName: "YOUR DAILY SHLOKA",
  dayNumber: 12,
  sessionMinutes: 20,
  verseLines: [
    "कर्मण्येवाधिकारस्ते",
    "मा फलेषु कदाचन।",
    "मा कर्मफलहेतुर्भूर्मा ते",
    "संगोऽस्त्वकर्मणि॥"
  ],
  transliterationLines: [
    "karmaṇy-evādhikāras te",
    "mā phaleṣu kadācana |",
    "mā karma-phala-hetur bhūr",
    "mā te saṅgo 'stv akarmaṇi ||"
  ],
  sourceCitation: "— श्रीमद्भगवद्गीता 2.47",
  wordDict: {
    "कर्मण्येवाधिकारस्ते": { trans: "karmaṇy-evādhikāras te", en: "In action alone is your right — your domain is duty, not results.", hi: "केवल कर्म में ही तुम्हारा अधिकार है — फल में कभी नहीं।" },
    "मा": { trans: "mā", en: "Never / do not — firm spiritual injunction.", hi: "कभी नहीं — एक दृढ़ निषेध।" },
    "फलेषु": { trans: "phaleṣu", en: "In the fruits / outcomes of action.", hi: "फलों में — कर्म के परिणामों में।" },
    "कदाचन": { trans: "kadācana", en: "Ever, at any time.", hi: "कभी भी।" },
    "संगोऽस्त्वकर्मणि": { trans: "saṅgo 'stv akarmaṇi", en: "Nor let your attachment be to inaction.", hi: "न ही अकर्म में तुम्हारी आसक्ति हो।" }
  },
  audio: {
    idle: { en: "Traditional Sanskrit recitation · 0:42", hi: "पारंपरिक संस्कृत पाठ · 0:42" },
    playing: { en: "Playing recitation… 0:07 / 0:42", hi: "मंत्र चल रहा है… 0:07 / 0:42" }
  },
  closing: {
    title: { en: "Carry this with you today", hi: "आज इसे अपने साथ रखें" },
    subtitle: { en: "A gentle reminder will greet you tomorrow morning.", hi: "कल सुबह एक कोमल याद आपका स्वागत करेगी।" }
  },
  promo: {
    icon: "🌸",
    title: "SutraSparsh Journeys",
    subtitle: "Unlock 30+ spiritual tracks"
  },
  history: [
    { title: "मृत्युर्न तस्य वाच्यम्…", sub: "Day 11 · Gita 2.20" },
    { title: "योगः कर्मसु कौशलम्…", sub: "Day 10 · Gita 2.50" },
    { title: "वासांसि जीर्णानि यथा…", sub: "Day 9 · Gita 2.22" }
  ]
};

export interface DailyShlokaMobileProps {
  onOpenAdmin?: () => void;
}

export const DailyShlokaMobile: React.FC<DailyShlokaMobileProps> = ({ onOpenAdmin }) => {
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);

  // Unmount cleanup for audio synthesis and stream recitation
  useEffect(() => {
    return () => {
      speechSafetyEngine.cancel();
      recitationEngine.stop();
    };
  }, []);

  return (
    <>
      <SutraSparshTempleApp
        onOpenAdmin={onOpenAdmin}
        onOpenPricing={() => setIsPricingModalOpen(true)}
        onOpenDonation={() => setIsDonationModalOpen(true)}
      />

      {/* Sādhaka Sacred Membership Pricing Modal */}
      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        lang="en"
      />

      {/* Sacred Gurudakshina & Seva (80G Tax Exemption) Modal */}
      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
        lang="en"
      />
    </>
  );
};

import React from "react";
import { ArrowLeft, FileText, Volume2, Scale, ShieldAlert, Mail } from "lucide-react";
import type { AppTheme } from "../../types";

interface TermsPageProps {
  theme?: AppTheme;
  onNavigateHome: () => void;
  onNavigatePrivacy: () => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({
  theme = "light",
  onNavigateHome,
  onNavigatePrivacy,
}) => {
  const isLight = theme === "light";

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-6 space-y-6 animate-fadeIn">
      <button
        type="button"
        onClick={onNavigateHome}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
          isLight
            ? "bg-white border-[#cfcbe0] text-[#1b1740] hover:bg-[#efedf6]"
            : "bg-stone-900 border-stone-700 text-amber-200 hover:bg-stone-800"
        }`}
      >
        <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Back to SutraSparsh Sanctuary</span>
      </button>

      <article
        className={`rounded-3xl border p-6 sm:p-10 space-y-6 shadow-sm ${
          isLight
            ? "bg-white border-[#cfcbe0] text-[#1d1b2e]"
            : "bg-stone-900/80 border-amber-500/25 text-[#F4E9D2]"
        }`}
      >
        <header className={`border-b pb-6 space-y-2 ${isLight ? "border-[#e6e3f0]" : "border-white/10"}`}>
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                isLight ? "bg-[#fbf0d6] text-[#874606]" : "bg-amber-500/20 text-amber-400"
              }`}
            >
              <FileText className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <h1
                className={`font-serif-sacred text-2xl sm:text-3xl font-bold ${
                  isLight ? "text-[#1b1740]" : "text-amber-200"
                }`}
              >
                Terms of Service &amp; Acceptable Use
              </h1>
              <p className={`text-xs ${isLight ? "text-[#55526b]" : "text-stone-400"}`}>
                Effective Date: November 2026 • SutraSparsh Spiritual Wisdom &amp; Voice Platform
              </p>
            </div>
          </div>
        </header>

        <section className="space-y-2 text-xs sm:text-sm leading-relaxed">
          <h2 className={`font-serif-sacred text-lg font-bold flex items-center gap-2 ${isLight ? "text-[#1b1740]" : "text-amber-300"}`}>
            <Scale className="w-4 h-4" aria-hidden="true" />
            <span>1. Acceptance &amp; Spiritual Purpose</span>
          </h2>
          <p>
            By accessing or using SutraSparsh (&ldquo;the Platform&rdquo;), you agree to comply with these Terms of Service and our{" "}
            <a
              href="/privacy-policy"
              onClick={(e) => {
                e.preventDefault();
                onNavigatePrivacy();
              }}
              className="underline font-semibold"
            >
              Privacy Policy
            </a>
            . SutraSparsh provides educational, devotional, and linguistic access to classical Sanskrit scriptures including the Bhagavad Gita, Patanjali Yoga Sutras, Upanishads, and Vedic Chants.
          </p>
        </section>

        <section className="space-y-2 text-xs sm:text-sm leading-relaxed">
          <h2 className={`font-serif-sacred text-lg font-bold flex items-center gap-2 ${isLight ? "text-[#1b1740]" : "text-amber-300"}`}>
            <Volume2 className="w-4 h-4" aria-hidden="true" />
            <span>2. Text-to-Speech Acceptable Use &amp; Audio Output Rights</span>
          </h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Permitted Use:</strong> Generated Sanskrit/Indic voice recitations are intended for personal study, meditation, classroom teaching, and devotional contemplation.
            </li>
            <li>
              <strong>Prohibited Misuse:</strong> You may not use the Text-to-Speech engine to generate abusive, hateful, defamatory, deceptive, or automated high-volume commercial spam content, nor attempt to bypass rate limits or character quotas.
            </li>
            <li>
              <strong>Synthesized Audio Usage &amp; IP Rights:</strong> Underlying sacred scripture texts remain part of open classical heritage. Audio waveforms synthesized via Bhashini ULCA or Google Cloud Neural2 are licensed for personal non-commercial listening and study; any redistribution must respect upstream provider terms and preserve attribution.
            </li>
          </ul>
        </section>

        <section className="space-y-2 text-xs sm:text-sm leading-relaxed">
          <h2 className={`font-serif-sacred text-lg font-bold flex items-center gap-2 ${isLight ? "text-[#1b1740]" : "text-amber-300"}`}>
            <ShieldAlert className="w-4 h-4" aria-hidden="true" />
            <span>3. Community Conduct &amp; Zero-Fee Facilitator Directory</span>
          </h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Community Satsang reflections must uphold respectful dialogue; automated spam, harassment, or commercial solicitation is prohibited.</li>
            <li>The Vedic Purohit Directory connects seekers directly with priests with zero platform commission. SutraSparsh does not intermediate payments or guarantee ritual outcomes.</li>
            <li>The Platform is provided &ldquo;as is&rdquo; without warranties of uninterrupted upstream TTS availability, though deterministic failsafe audio is provided for continuity.</li>
          </ul>
        </section>

        <section className="space-y-2 text-xs sm:text-sm leading-relaxed">
          <h2 className={`font-serif-sacred text-lg font-bold flex items-center gap-2 ${isLight ? "text-[#1b1740]" : "text-amber-300"}`}>
            <Mail className="w-4 h-4" aria-hidden="true" />
            <span>4. Contact</span>
          </h2>
          <p>
            Questions regarding these Terms may be sent to{" "}
            <a href="mailto:support@sutrasparsh.com" className="underline font-semibold">
              support@sutrasparsh.com
            </a>
            .
          </p>
        </section>
      </article>
    </div>
  );
};

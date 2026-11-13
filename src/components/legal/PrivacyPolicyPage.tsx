import React from "react";
import { ArrowLeft, ShieldCheck, Lock, Server, Trash2, Mail, Sliders } from "lucide-react";
import type { AppTheme } from "../../types";
import { consentService } from "../../services/consent.service";

interface PrivacyPolicyPageProps {
  theme?: AppTheme;
  onNavigateHome: () => void;
  onNavigateTerms: () => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({
  theme = "light",
  onNavigateHome,
  onNavigateTerms,
}) => {
  const isLight = theme === "light";

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-6 space-y-6 animate-fadeIn">
      <div className="flex flex-wrap items-center justify-between gap-3">
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

        <button
          type="button"
          onClick={() => consentService.openPreferencesModal()}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
            isLight
              ? "bg-[#fbf0d6] border-[#d9a441] text-[#5c3004] hover:bg-[#f3e1b6]"
              : "bg-amber-500/15 border-amber-500/35 text-amber-300 hover:bg-amber-500/25"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Manage Cookie Preferences</span>
        </button>
      </div>

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
              <ShieldCheck className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <h1
                className={`font-serif-sacred text-2xl sm:text-3xl font-bold ${
                  isLight ? "text-[#1b1740]" : "text-amber-200"
                }`}
              >
                Privacy Policy &amp; Data Protection
              </h1>
              <p className={`text-xs ${isLight ? "text-[#55526b]" : "text-stone-400"}`}>
                Effective Date: November 2026 • DPDP Act 2023 &amp; GDPR Aligned • App Store &amp; Play Store Compliant
              </p>
            </div>
          </div>
        </header>

        <section
          className={`p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed ${
            isLight
              ? "bg-[#FAF6EE] border-[#E8DCC2] text-[#261B12]"
              : "bg-amber-500/10 border-amber-500/30 text-amber-100"
          }`}
        >
          <strong>Core Privacy Commitment:</strong> SutraSparsh is built as an offline-first spiritual wisdom and Sanskrit TTS companion. We do not sell personal data, do not display third-party advertising trackers, and process all text-to-speech audio synthesis requests transiently.
        </section>

        <section className="space-y-2 text-xs sm:text-sm leading-relaxed">
          <h2 className={`font-serif-sacred text-lg font-bold flex items-center gap-2 ${isLight ? "text-[#1b1740]" : "text-amber-300"}`}>
            <Server className="w-4 h-4" aria-hidden="true" />
            <span>1. Text-to-Speech (TTS) &amp; Voice Processing Disclosure</span>
          </h2>
          <p>
            When you synthesize spoken Sanskrit or Indic audio recitations, SutraSparsh transmits the submitted verse or custom text through our authenticated backend API proxy (<code>/api/tts/synthesize</code>) to the active speech synthesis engine:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Bhashini ULCA (MeitY / AI4Bharat):</strong> Receives only the text string, selected language code (<code>sa</code> or <code>hi</code>), voice gender profile, and cadence parameter to return WAV audio.
            </li>
            <li>
              <strong>Google Cloud Text-to-Speech (Neural2):</strong> Serves as a high-reliability voice engine/failsafe, receiving SSML-formatted text to return MP3 audio.
            </li>
            <li>
              <strong>Transient Processing &amp; Zero Voice Biometrics:</strong> Submitted TTS text and generated audio streams are processed transiently in memory to deliver your audio response and are <strong>not</strong> stored permanently on external servers, used to train AI models, or retained as voice biometric identifiers. Browser audio caching stays strictly on your own device.
            </li>
          </ul>
        </section>

        <section className="space-y-2 text-xs sm:text-sm leading-relaxed">
          <h2 className={`font-serif-sacred text-lg font-bold flex items-center gap-2 ${isLight ? "text-[#1b1740]" : "text-amber-300"}`}>
            <Lock className="w-4 h-4" aria-hidden="true" />
            <span>2. Information We Collect &amp; Local Persistence</span>
          </h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Optional Account Identity:</strong> If you sign in with Google or email via Firebase Authentication, we store your display name and email solely to synchronize bookmarks and journal notes across your devices.
            </li>
            <li>
              <strong>Essential Device Storage:</strong> Reading streaks, study goals, theme preference (Parchment Dawn / Golden Hour), and cached shloka audio are stored locally in your browser.
            </li>
            <li>
              <strong>Opt-In Telemetry:</strong> Privacy-friendly analytics (page views and aggregated TTS latency events) remain strictly blocked until you grant consent via the Cookie Preferences banner.
            </li>
          </ul>
        </section>

        <section className="space-y-2 text-xs sm:text-sm leading-relaxed">
          <h2 className={`font-serif-sacred text-lg font-bold flex items-center gap-2 ${isLight ? "text-[#1b1740]" : "text-amber-300"}`}>
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            <span>3. Your Rights Under DPDP Act 2023 &amp; GDPR</span>
          </h2>
          <p>
            You hold full rights to access, export, correct, withdraw consent, and erase your personal data:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Export or erase all local reading progress and reflections at any time under <strong>Settings &rarr; Backup &amp; Data Sovereignty</strong>.</li>
            <li>Withdraw analytics consent at any time using the <strong>Manage Cookie Preferences</strong> control in the footer.</li>
            <li>Request complete account and cloud backup deletion by contacting our Grievance &amp; Data Protection Officer below.</li>
          </ul>
        </section>

        <section className="space-y-2 text-xs sm:text-sm leading-relaxed">
          <h2 className={`font-serif-sacred text-lg font-bold flex items-center gap-2 ${isLight ? "text-[#1b1740]" : "text-amber-300"}`}>
            <Mail className="w-4 h-4" aria-hidden="true" />
            <span>4. Contact &amp; Grievance Redressal</span>
          </h2>
          <p>
            For privacy inquiries, DPDP/GDPR data requests, or account deletion, email{" "}
            <a href="mailto:support@sutrasparsh.com" className="underline font-semibold">
              support@sutrasparsh.com
            </a>{" "}
            or{" "}
            <a href="mailto:your.daily.shloka@gmail.com" className="underline font-semibold">
              your.daily.shloka@gmail.com
            </a>
            . Read our{" "}
            <a
              href="/terms"
              onClick={(e) => {
                e.preventDefault();
                onNavigateTerms();
              }}
              className="underline font-semibold"
            >
              Terms of Service
            </a>
            .
          </p>
        </section>
      </article>
    </div>
  );
};

import React from "react";
import { X, ShieldCheck, Lock, EyeOff, Database, Globe, CheckCircle2, ExternalLink } from "lucide-react";

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: "sandstone" | "amethyst" | "light" | "festival";
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
  theme = "sandstone",
}) => {
  if (!isOpen) return null;

  const isLight = theme === "light";
  const isFestival = theme === "festival";
  const isAmethyst = theme === "amethyst";

  const modalBg = isLight
    ? "#FFFBF5"
    : isFestival
    ? "#4B0E17"
    : isAmethyst
    ? "#140A28"
    : "#1C120B";

  const modalBorder = isLight
    ? "#E6D7C3"
    : isFestival
    ? "rgba(255, 138, 0, 0.35)"
    : "rgba(216, 137, 22, 0.3)";

  const textColor = isLight ? "#3A2818" : "#F4E9D2";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-policy-title"
      className="fixed inset-0 z-50 overflow-y-auto backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
      style={{
        backgroundColor: isLight ? "rgba(58, 40, 24, 0.45)" : "rgba(0, 0, 0, 0.8)",
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-3xl shadow-2xl border overflow-hidden relative transition-all max-h-[90vh] flex flex-col"
        style={{
          backgroundColor: modalBg,
          borderColor: modalBorder,
          color: textColor,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="p-6 border-b flex items-center justify-between"
          style={{
            borderColor: isLight ? "#E6D7C3" : "rgba(255, 255, 255, 0.08)",
          }}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-500 flex items-center justify-center text-lg font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 id="privacy-policy-title" className="font-serif-sacred text-lg font-bold">
                Privacy Policy & Sādhaka Data Safety
              </h3>
              <p className="text-[11px] opacity-75">
                Last updated: September 2026 • Apple App Store & Google Play Compliant
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer hover:opacity-80"
            style={{
              backgroundColor: isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.1)",
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Legal Body */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs leading-relaxed opacity-90">
          {/* Summary Box */}
          <div
            className="p-4 rounded-2xl border space-y-2"
            style={{
              backgroundColor: isLight ? "#FAF6EE" : "rgba(255,255,255,0.04)",
              borderColor: isLight ? "#E6D7C3" : "rgba(255,255,255,0.08)",
            }}
          >
            <div className="flex items-center space-x-2 font-bold text-amber-500">
              <CheckCircle2 className="w-4 h-4" />
              <span>Core Privacy Commitment</span>
            </div>
            <p className="text-[11.5px]">
              SutraSparsh is designed as an offline-first spiritual sanctuary. We believe your sacred reflections, meditation habits, and study journey are private to you. We do not sell personal data, do not run third-party advertising trackers, and store your primary data locally on your device.
            </p>
          </div>

          {/* Section 1 */}
          <div className="space-y-2">
            <h4 className="font-serif-sacred text-sm font-bold text-amber-400 flex items-center space-x-2">
              <Lock className="w-4 h-4 text-amber-500" />
              <span>1. Information We Collect</span>
            </h4>
            <p>
              When you use SutraSparsh, we collect minimal data required to deliver core sacred features:
            </p>
            <ul className="list-disc list-inside pl-2 space-y-1">
              <li>
                <strong>Account Credentials:</strong> If you sign in via Google or personal email, we store your email address and display name solely to identify your account and sync bookmarks.
              </li>
              <li>
                <strong>Sādhana Progress & Reflections:</strong> Verses read, journal entries, and streak dates are saved locally on your device with optional encrypted cloud backup.
              </li>
              <li>
                <strong>Preferences:</strong> Theme preference, audio recitation tempo, and script options (Devanagari/IAST).
              </li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="space-y-2">
            <h4 className="font-serif-sacred text-sm font-bold text-amber-400 flex items-center space-x-2">
              <EyeOff className="w-4 h-4 text-amber-500" />
              <span>2. What We Never Do</span>
            </h4>
            <ul className="list-disc list-inside pl-2 space-y-1">
              <li>We never sell, rent, or monetize your personal information.</li>
              <li>We never inject advertising tracking SDKs (e.g. ad networks).</li>
              <li>We never read or share your contemplative journal reflections with third parties.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-2">
            <h4 className="font-serif-sacred text-sm font-bold text-amber-400 flex items-center space-x-2">
              <Database className="w-4 h-4 text-amber-500" />
              <span>3. Data Storage & Local Persistence</span>
            </h4>
            <p>
              SutraSparsh stores all holy scripture corpora, transliterations, and audio assets offline on your client device. Even without internet connectivity, the entire library of 700 Bhagavad Gita verses, Patanjali Yoga Sutras, and Vedic peace mantras is accessible.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-2">
            <h4 className="font-serif-sacred text-sm font-bold text-amber-400 flex items-center space-x-2">
              <Globe className="w-4 h-4 text-amber-500" />
              <span>4. Your Data Rights & Deletion</span>
            </h4>
            <p>
              You maintain full sovereignty over your data. Under <strong>Settings & Preferences → Backup & Data Sovereignty</strong>, you can:
            </p>
            <ul className="list-disc list-inside pl-2 space-y-1">
              <li>Export a complete JSON archive of your reading progress and journal.</li>
              <li>Clear local cache and delete all stored reading records at any time.</li>
              <li>Sign off or request complete deletion of your account profile by contacting support.</li>
            </ul>
          </div>

          {/* Section 5 */}
          <div className="space-y-2">
            <h4 className="font-serif-sacred text-sm font-bold text-amber-400">
              5. Contact & Support
            </h4>
            <p>
              For any questions regarding this Privacy Policy or data requests, contact our dedicated sanctuary guardian at:{" "}
              <a
                href="mailto:support@sutrasparsh.com"
                className="text-amber-400 underline font-mono"
              >
                support@sutrasparsh.com
              </a>{" "}
              or{" "}
              <a
                href="mailto:vishal.kr.gupta@gmail.com"
                className="text-amber-400 underline font-mono"
              >
                vishal.kr.gupta@gmail.com
              </a>
              .
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          className="p-4 border-t flex items-center justify-between gap-3"
          style={{
            borderColor: isLight ? "#E6D7C3" : "rgba(255, 255, 255, 0.08)",
          }}
        >
          <a
            href="/privacy.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-amber-400 hover:text-amber-300 underline flex items-center space-x-1"
          >
            <span>Open Standalone Web Policy</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-bold bg-amber-500 text-stone-950 text-xs shadow hover:scale-105 transition-all cursor-pointer"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

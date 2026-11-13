import React, { useEffect, useState } from "react";
import { ShieldCheck, Sliders, X, Check } from "lucide-react";
import { consentService } from "../services/consent.service";
import type { AppTheme } from "../types";

interface CookieConsentBannerProps {
  theme?: AppTheme;
  onNavigateRoute?: (path: string) => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({
  theme = "light",
  onNavigateRoute,
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(() => !consentService.hasResponded());
  const [showCustomize, setShowCustomize] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState<boolean>(
    () => consentService.getPreferences().analytics
  );

  useEffect(() => {
    const handleOpen = () => {
      const prefs = consentService.getPreferences();
      setAnalyticsEnabled(prefs.analytics);
      setShowCustomize(true);
      setIsVisible(true);
    };
    window.addEventListener("sutrasparsh:open_cookie_preferences", handleOpen);
    return () => {
      window.removeEventListener("sutrasparsh:open_cookie_preferences", handleOpen);
    };
  }, []);

  if (!isVisible) return null;

  const isLight = theme === "light";

  const handleAcceptAll = () => {
    consentService.acceptAll();
    setAnalyticsEnabled(true);
    setShowCustomize(false);
    setIsVisible(false);
  };

  const handleEssentialOnly = () => {
    consentService.rejectNonEssential();
    setAnalyticsEnabled(false);
    setShowCustomize(false);
    setIsVisible(false);
  };

  const handleSaveCustom = () => {
    consentService.savePreferences(analyticsEnabled);
    setShowCustomize(false);
    setIsVisible(false);
  };

  return (
    <aside
      id="cookie-consent-banner"
      role="dialog"
      aria-live="polite"
      aria-label="Privacy and Cookie Consent"
      className="fixed bottom-16 md:bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-fadeIn"
    >
      <div
        className={`rounded-2xl border p-4 sm:p-5 shadow-2xl backdrop-blur-md transition-colors ${
          isLight
            ? "bg-[#FFFDF8] border-[#cfcbe0] text-[#1d1b2e]"
            : "bg-[#1C1510]/95 border-amber-500/35 text-[#F4E9D2]"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isLight ? "bg-[#fbf0d6] text-[#874606]" : "bg-amber-500/20 text-amber-400"
              }`}
            >
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h2
                className={`text-xs sm:text-sm font-bold font-serif-sacred ${
                  isLight ? "text-[#1b1740]" : "text-amber-200"
                }`}
              >
                Privacy &amp; Cookie Preferences
              </h2>
              <p className={`text-[10.5px] ${isLight ? "text-[#55526b]" : "text-stone-400"}`}>
                DPDP Act 2023 &amp; GDPR Compliant
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleEssentialOnly}
            aria-label="Continue with essential cookies only"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isLight ? "text-[#55526b] hover:bg-stone-100" : "text-stone-400 hover:bg-white/10"
            }`}
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <p
          className={`mt-2.5 text-xs leading-relaxed ${
            isLight ? "text-[#3a3652]" : "text-stone-300"
          }`}
        >
          SutraSparsh uses essential storage for your reading progress, themes, and offline audio cache. Optional privacy-friendly telemetry helps improve TTS recitation reliability and stays{" "}
          <strong>strictly disabled</strong> unless you opt in.{" "}
          <a
            href="/privacy-policy"
            onClick={(e) => {
              if (onNavigateRoute) {
                e.preventDefault();
                onNavigateRoute("/privacy-policy");
              }
            }}
            className={`underline font-semibold ${
              isLight ? "text-[#874606] hover:text-[#1b1740]" : "text-amber-400 hover:text-amber-300"
            }`}
          >
            Privacy Policy
          </a>
        </p>

        {showCustomize && (
          <div
            className={`mt-3 p-3 rounded-xl border space-y-2.5 text-xs ${
              isLight
                ? "bg-[#FAF6EE] border-[#E8DCC2]"
                : "bg-black/30 border-white/10"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="font-bold">Strictly Essential Storage</div>
                <div className={`text-[11px] ${isLight ? "text-[#55526b]" : "text-stone-400"}`}>
                  Theme, bookmarks, journal, and cached recitation audio.
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  isLight ? "bg-emerald-100 text-emerald-900" : "bg-emerald-500/20 text-emerald-300"
                }`}
              >
                Always Active
              </span>
            </div>

            <label className="flex items-center justify-between gap-2 pt-2 border-t border-black/10 dark:border-white/10 cursor-pointer">
              <div>
                <div className="font-bold">Privacy-Friendly Analytics &amp; TTS Telemetry</div>
                <div className={`text-[11px] ${isLight ? "text-[#55526b]" : "text-stone-400"}`}>
                  Aggregated synthesis speed &amp; page usage (zero ad tracking).
                </div>
              </div>
              <input
                type="checkbox"
                checked={analyticsEnabled}
                onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                aria-label="Enable privacy-friendly analytics telemetry"
                className="w-4 h-4 accent-amber-600 cursor-pointer"
              />
            </label>
          </div>
        )}

        <div className="mt-3.5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleAcceptAll}
            className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              isLight
                ? "bg-[#1b1740] hover:bg-[#100e2b] text-white"
                : "bg-amber-500 hover:bg-amber-400 text-stone-950"
            }`}
          >
            <Check className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Accept All</span>
          </button>

          <button
            type="button"
            onClick={handleEssentialOnly}
            className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              isLight
                ? "bg-white hover:bg-stone-100 text-[#1b1740] border-[#cfcbe0]"
                : "bg-stone-800 hover:bg-stone-700 text-stone-100 border-stone-700"
            }`}
          >
            Essential Only
          </button>

          {showCustomize ? (
            <button
              type="button"
              onClick={handleSaveCustom}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                isLight
                  ? "bg-[#fbf0d6] hover:bg-[#f3e1b6] text-[#5c3004] border-[#d9a441]"
                  : "bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border-amber-500/40"
              }`}
            >
              Save Preferences
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowCustomize(true)}
              aria-label="Customize cookie preferences"
              className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1 ${
                isLight
                  ? "border-[#cfcbe0] text-[#1d1b2e] hover:bg-stone-100"
                  : "border-stone-700 text-stone-300 hover:bg-white/10"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Options</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

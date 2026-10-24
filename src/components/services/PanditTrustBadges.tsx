import React, { useState, useRef, useEffect } from "react";
import { ShieldCheck, Award, CheckCircle2, Building2, Calendar, UserCheck, X } from "lucide-react";
import type { VerificationDetails, PeerEndorsement } from "../../types/pandit";
import { type AppTheme } from "../../types";

export interface PanditTrustBadgesProps {
  isVerified: boolean;
  verificationDetails?: VerificationDetails;
  peerEndorsements?: PeerEndorsement[];
  panditName: string;
  theme?: AppTheme;
  compact?: boolean;
}

export const PanditTrustBadges: React.FC<PanditTrustBadgesProps> = ({
  isVerified,
  verificationDetails,
  peerEndorsements = [],
  panditName,
  theme = "light",
  compact = false,
}) => {
  const isLight = theme === "light";
  const [activeFlyout, setActiveFlyout] = useState<"verified" | "endorsed" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close flyout on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveFlyout(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveFlyout(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const hasEndorsements = peerEndorsements && peerEndorsements.length > 0;
  if (!isVerified && !hasEndorsements) {
    return null;
  }

  // Format date helper
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      ref={containerRef}
      className="pandit-trust-badges inline-flex flex-wrap items-center gap-1.5 relative select-none"
      role="group"
      aria-label={`Verification and trust credentials for ${panditName}`}
    >
      {/* ════════════ 1. VERIFIED STATUS BADGE (Saffron/Gold Accent) ════════════ */}
      {isVerified && (
        <div className="relative inline-block">
          <button
            type="button"
            onClick={() => setActiveFlyout(activeFlyout === "verified" ? null : "verified")}
            onMouseEnter={() => setActiveFlyout("verified")}
            onFocus={() => setActiveFlyout("verified")}
            aria-expanded={activeFlyout === "verified"}
            aria-haspopup="dialog"
            aria-label={`Verified Pandit status for ${panditName}. Tap or hover for Pathashala credentials.`}
            className={`group inline-flex items-center gap-1 rounded-full font-semibold transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
              compact ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
            } ${
              isLight
                ? "bg-amber-100/90 text-amber-900 border border-amber-300 hover:bg-amber-200/90 hover:border-amber-400 shadow-xs"
                : "bg-amber-950/40 text-amber-300 border border-amber-500/30 hover:bg-amber-900/50 hover:border-amber-400/50 shadow-xs"
            }`}
          >
            <ShieldCheck
              className={`text-amber-600 dark:text-amber-400 flex-shrink-0 transition-transform group-hover:scale-110 ${
                compact ? "w-3 h-3" : "w-3.5 h-3.5"
              }`}
              aria-hidden="true"
            />
            <span className="tracking-tight">
              {verificationDetails?.verificationBadgeTitle || "Verified"}
            </span>
            <span
              className={`w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse`}
              aria-hidden="true"
            />
          </button>

          {/* Verification Details Tooltip / Flyout Card */}
          {activeFlyout === "verified" && (
            <div
              role="tooltip"
              className={`absolute left-0 sm:left-auto top-full mt-2 z-40 w-72 sm:w-80 p-3.5 rounded-xl border shadow-xl backdrop-blur-md animate-fadeIn text-left ${
                isLight
                  ? "bg-stone-50/98 text-stone-900 border-amber-300/80 shadow-stone-400/20"
                  : "bg-stone-900/98 text-stone-100 border-amber-500/30 shadow-black/60"
              }`}
              onMouseLeave={() => setActiveFlyout(null)}
            >
              <div className="flex items-start justify-between border-b pb-2 mb-2.5 border-amber-500/20">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold leading-tight text-amber-800 dark:text-amber-300">
                      Vedic Lineage Verified
                    </h4>
                    <p className="text-[10px] text-stone-700 dark:text-stone-300">
                      Zero-Fee Pure Facilitator Protocol
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveFlyout(null);
                  }}
                  className="p-1 text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-100 rounded-md"
                  aria-label="Close details"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2 text-[11px] leading-relaxed">
                {verificationDetails?.institution && (
                  <div className="flex items-start gap-2">
                    <Building2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-stone-900 dark:text-stone-200">
                        Endorsing Authority:
                      </span>{" "}
                      <span className="text-stone-700 dark:text-stone-300 font-medium">
                        {verificationDetails.institution}
                      </span>
                    </div>
                  </div>
                )}

                {verificationDetails?.lineageOrGuru && (
                  <div className="flex items-start gap-2">
                    <UserCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-stone-900 dark:text-stone-200">
                        Parampara / Guru:
                      </span>{" "}
                      <span className="text-stone-700 dark:text-stone-300">
                        {verificationDetails.lineageOrGuru}
                      </span>
                    </div>
                  </div>
                )}

                {verificationDetails?.credentialId && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                      ID: {verificationDetails.credentialId}
                    </span>
                    {verificationDetails.verifiedDate && (
                      <span className="text-[10px] text-stone-600 dark:text-stone-300 flex items-center gap-1">
                        <Calendar className="w-3 h-3 inline" />
                        Verified: {formatDate(verificationDetails.verifiedDate)}
                      </span>
                    )}
                  </div>
                )}

                <div className="mt-2.5 pt-2 border-t border-amber-500/15 flex items-center gap-1.5 text-[10px] text-emerald-800 dark:text-emerald-300 font-medium">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700 dark:text-emerald-400 flex-shrink-0" />
                  <span>Verified credentials on file with sutraSparsh Seva Parishad</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════ 2. PEER ENDORSED STATUS BADGE (Temple-Blue Accent) ════════════ */}
      {hasEndorsements && (
        <div className="relative inline-block">
          <button
            type="button"
            onClick={() => setActiveFlyout(activeFlyout === "endorsed" ? null : "endorsed")}
            onMouseEnter={() => setActiveFlyout("endorsed")}
            onFocus={() => setActiveFlyout("endorsed")}
            aria-expanded={activeFlyout === "endorsed"}
            aria-haspopup="dialog"
            aria-label={`${peerEndorsements.length} peer endorsements for ${panditName}. Tap or hover for testimonials.`}
            className={`group inline-flex items-center gap-1 rounded-full font-semibold transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500/50 ${
              compact ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
            } ${
              isLight
                ? "bg-sky-100/90 text-sky-950 border border-sky-300 hover:bg-sky-200/90 hover:border-sky-400 shadow-xs"
                : "bg-sky-950/40 text-sky-200 border border-sky-500/30 hover:bg-sky-900/50 hover:border-sky-400/50 shadow-xs"
            }`}
          >
            <Award
              className={`text-sky-600 dark:text-sky-400 flex-shrink-0 transition-transform group-hover:scale-110 ${
                compact ? "w-3 h-3" : "w-3.5 h-3.5"
              }`}
              aria-hidden="true"
            />
            <span className="tracking-tight">
              {peerEndorsements.length}{" "}
              {peerEndorsements.length === 1 ? "Peer Endorsement" : "Peer Endorsed"}
            </span>
          </button>

          {/* Peer Endorsements Details Tooltip / Flyout Card */}
          {activeFlyout === "endorsed" && (
            <div
              role="tooltip"
              className={`absolute left-0 sm:left-auto top-full mt-2 z-40 w-72 sm:w-88 p-3.5 rounded-xl border shadow-xl backdrop-blur-md animate-fadeIn text-left ${
                isLight
                  ? "bg-stone-50/98 text-stone-900 border-sky-300/80 shadow-stone-400/20"
                  : "bg-stone-900/98 text-stone-100 border-sky-500/30 shadow-black/60"
              }`}
              onMouseLeave={() => setActiveFlyout(null)}
            >
              <div className="flex items-start justify-between border-b pb-2 mb-2.5 border-sky-500/20">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/15 flex items-center justify-center text-sky-600 dark:text-sky-400">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold leading-tight text-sky-900 dark:text-sky-300">
                      Peer Endorsements ({peerEndorsements.length})
                    </h4>
                    <p className="text-[10px] text-stone-700 dark:text-stone-300">
                      Recognized by Fellow Purohits & Temple Acharyas
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveFlyout(null);
                  }}
                  className="p-1 text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-100 rounded-md"
                  aria-label="Close endorsements"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {peerEndorsements.map((pe) => (
                  <div
                    key={pe.id}
                    className={`p-2.5 rounded-lg border text-[11px] leading-relaxed ${
                      isLight
                        ? "bg-white/80 border-sky-200/80 shadow-xs"
                        : "bg-stone-800/60 border-sky-500/20"
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold text-stone-900 dark:text-stone-200">
                      <span>{pe.endorserName}</span>
                      <span className="text-[9.5px] font-normal text-stone-600 dark:text-stone-300">
                        {formatDate(pe.date)}
                      </span>
                    </div>
                    <div className="text-[10px] text-sky-700 dark:text-sky-400 font-medium">
                      {pe.endorserTitle}
                      {pe.institution && ` • ${pe.institution}`}
                    </div>
                    <p className="mt-1 text-stone-600 dark:text-stone-300 italic text-[10.5px]">
                      &ldquo;{pe.comment}&rdquo;
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-2.5 pt-2 border-t border-sky-500/15 text-[10px] text-stone-700 dark:text-stone-300">
                Peer reviews are submitted by verified temple priests and verified Pathashala alumni.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

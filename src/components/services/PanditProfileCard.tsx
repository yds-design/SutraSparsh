import React, { useState } from "react";
import {
  Phone,
  MessageSquare,
  MapPin,
  Clock,
  Sparkles,
  BookOpen,
  Languages,
  CheckCircle,
  ChevronRight,
  ExternalLink,
  Star,
} from "lucide-react";
import type { PanditProfile } from "../../types/pandit";
import { PanditTrustBadges } from "./PanditTrustBadges";
import {
  createWhatsAppDeepLink,
  triggerWhatsAppConnect,
  formatWhatsAppPhoneNumber,
} from "../../utils/whatsapp-deep-link";
import { type AppTheme } from "../../types";

export interface PanditProfileCardProps {
  pandit: PanditProfile;
  theme?: AppTheme;
  onOpenDetails?: (pandit: PanditProfile) => void;
  onOpenReviews?: (pandit: PanditProfile) => void;
  defaultRitualId?: string;
}

export const PanditProfileCard: React.FC<PanditProfileCardProps> = ({
  pandit,
  theme = "light",
  onOpenDetails,
  onOpenReviews,
  defaultRitualId,
}) => {
  const isLight = theme === "light";

  // Selected ritual for devotee direct inquiry
  const [selectedRitualId, setSelectedRitualId] = useState<string>(() => {
    if (defaultRitualId && pandit.rituals.some((r) => r.id === defaultRitualId)) {
      return defaultRitualId;
    }
    return pandit.rituals[0]?.id || "general";
  });

  const selectedRitual =
    pandit.rituals.find((r) => r.id === selectedRitualId) ||
    pandit.rituals[0] || {
      id: "general",
      name: "Vedic Puja Consultation",
      duration: "2 hours",
      description: "Consultation and planning for home or temple rituals",
    };

  // WhatsApp deep-link generation
  const whatsAppInfo = createWhatsAppDeepLink({
    phone: pandit.phone,
    panditName: pandit.name,
    ritualName: selectedRitual.name,
  });

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault();
    triggerWhatsAppConnect({
      phone: pandit.phone,
      panditName: pandit.name,
      ritualName: selectedRitual.name,
    });
  };

  // Avatar initials and color
  const initials = pandit.name
    .replace(/^Pandit\s+|^Acharya\s+/i, "")
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <article
      className={`pandit-profile-card rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md ${
        isLight
          ? "bg-white/95 border-amber-900/10 hover:border-amber-500/40 text-stone-900"
          : "bg-stone-900/80 border-amber-500/20 hover:border-amber-500/40 text-stone-100"
      }`}
      aria-label={`Priest profile for ${pandit.name}`}
    >
      {/* ════════════ SEMANTIC HEADER: Profile Identity & Trust Signals ════════════ */}
      <header className="p-4 sm:p-5 border-b border-amber-500/10 space-y-3">
        <div className="flex items-start gap-3.5">
          {/* Avatar / Portrait Icon */}
          <div className="relative flex-shrink-0">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg shadow-inner border ${
                isLight
                  ? "bg-gradient-to-br from-amber-100 to-amber-200 text-amber-900 border-amber-300"
                  : "bg-gradient-to-br from-amber-900/60 to-stone-800 text-amber-300 border-amber-500/30"
              }`}
            >
              {initials || "🕉️"}
            </div>
            <div
              className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] border shadow-xs ${
                pandit.isAvailable
                  ? "bg-emerald-500 text-white border-white dark:border-stone-900"
                  : "bg-stone-400 text-white border-white dark:border-stone-900"
              }`}
              title={pandit.isAvailable ? "Available for Muhurtas" : "Currently Engaged"}
            >
              ✓
            </div>
          </div>

          {/* Identity & Badges in Header */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 justify-between">
              <h3 className="text-base sm:text-lg font-bold font-serif truncate leading-tight tracking-tight">
                {pandit.name}
              </h3>
              {pandit.sanskritName && (
                <span className="text-xs font-serif opacity-70 block sm:inline">
                  ({pandit.sanskritName})
                </span>
              )}
            </div>

            {/* Traditional Expertise Tag */}
            <p className="text-xs font-medium text-amber-800 dark:text-amber-300/90 mt-0.5 line-clamp-1">
              {pandit.title}
            </p>

            {/* Trust Badges & Rating: Positioned cleanly alongside name & expertise */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {onOpenReviews && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenReviews(pandit);
                  }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-300 border border-amber-500/30 transition-colors cursor-pointer"
                  title="View verified devotee reviews and ratings"
                >
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{(pandit.rating || 5.0).toFixed(1)}</span>
                  <span className="text-stone-500 dark:text-stone-400 font-normal">
                    ({pandit.reviewCount ?? 1})
                  </span>
                </button>
              )}
              <PanditTrustBadges
                isVerified={pandit.isVerified}
                verificationDetails={pandit.verificationDetails}
                peerEndorsements={pandit.peerEndorsements}
                panditName={pandit.name}
                theme={theme}
              />
            </div>
          </div>
        </div>

        {/* Location & Experience Meta Row */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-stone-700 dark:text-stone-300 pt-1">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <span>
              {pandit.location.city}, {pandit.location.state}
            </span>
          </span>

          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <span>{pandit.experienceYears} Years Experience</span>
          </span>

          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <span>{pandit.tradition}</span>
          </span>
        </div>

        {/* Languages Spoken Chips */}
        <div className="flex items-center gap-1 text-[11px] text-stone-700 dark:text-stone-300 overflow-x-auto py-0.5 scrollbar-none">
          <Languages className="w-3 h-3 text-stone-600 dark:text-stone-300 flex-shrink-0 mr-0.5" />
          {pandit.languages.map((lang) => (
            <span
              key={lang}
              className={`px-1.5 py-0.5 rounded text-[10.5px] border ${
                isLight
                  ? "bg-stone-100 text-stone-700 border-stone-200"
                  : "bg-stone-800/80 text-stone-300 border-stone-700/60"
              }`}
            >
              {lang}
            </span>
          ))}
        </div>
      </header>

      {/* ════════════ MAIN BODY: Bio & Interactive Ritual Selection ════════════ */}
      <section className="p-4 sm:p-5 space-y-3.5 flex-1">
        <p className="text-xs leading-relaxed text-stone-700 dark:text-stone-300 line-clamp-2">
          {pandit.bio}
        </p>

        {/* Ritual Selection for Devotee Connect */}
        <div className="space-y-1.5">
          <label
            htmlFor={`ritual-select-${pandit.id}`}
            className="block text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300/80"
          >
            Select Requested Ritual:
          </label>
          <div className="relative">
            <select
              id={`ritual-select-${pandit.id}`}
              value={selectedRitualId}
              onChange={(e) => setSelectedRitualId(e.target.value)}
              className={`w-full px-3 py-2 text-xs rounded-xl border transition-colors cursor-pointer appearance-none font-medium ${
                isLight
                  ? "bg-amber-50/50 border-amber-200 text-stone-900 focus:border-amber-500 focus:bg-white"
                  : "bg-stone-800/90 border-stone-700 text-stone-100 focus:border-amber-500/70"
              }`}
            >
              {pandit.rituals.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.duration})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-stone-600 dark:text-stone-300">
              ▼
            </div>
          </div>

          {selectedRitual?.description && (
            <p className="text-[11px] text-stone-700 dark:text-stone-300 italic pt-0.5 line-clamp-1">
              ✨ {selectedRitual.description}
            </p>
          )}
        </div>
      </section>

      {/* ════════════ FOOTER: Frictionless Direct Communication Layer ════════════ */}
      <footer className="p-4 sm:p-5 pt-2 border-t border-amber-500/10 space-y-2.5 bg-amber-500/[0.02]">
        {/* Pre-formatted WhatsApp Message Preview Box */}
        <div
          className={`p-2 rounded-lg text-[10.5px] border font-mono leading-tight truncate ${
            isLight
              ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
              : "bg-emerald-950/20 border-emerald-800/40 text-emerald-300"
          }`}
          title={whatsAppInfo.rawMessage}
        >
          <span className="font-semibold block text-[10px] uppercase font-sans tracking-wider text-emerald-800 dark:text-emerald-400">
            WhatsApp Inquiry Preview:
          </span>
          &ldquo;{whatsAppInfo.rawMessage}&rdquo;
        </div>

        {/* Action Buttons: Direct WhatsApp & Direct Phone */}
        <div className="grid grid-cols-2 gap-2">
          {/* 1. Direct Connect via WhatsApp (Feature B) */}
          <a
            href={whatsAppInfo.url}
            onClick={handleWhatsAppClick}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Connect via WhatsApp with ${pandit.name} regarding ${selectedRitual.name}`}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl font-semibold text-xs text-white bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] transition-all duration-150 shadow-sm cursor-pointer"
          >
            {/* WhatsApp Logo SVG */}
            <svg
              className="w-4 h-4 fill-current flex-shrink-0"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
            <span className="truncate">WhatsApp</span>
          </a>

          {/* 2. Direct Call (Zero Intermediation) */}
          <a
            href={`tel:${formatWhatsAppPhoneNumber(pandit.phone)}`}
            aria-label={`Call Pandit ${pandit.name} directly at ${pandit.phone}`}
            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl font-semibold text-xs border transition-all duration-150 cursor-pointer ${
              isLight
                ? "bg-amber-50 hover:bg-amber-100/80 text-amber-950 border-amber-300"
                : "bg-stone-800 hover:bg-stone-700 text-amber-300 border-amber-500/30"
            }`}
          >
            <Phone className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <span>Direct Call</span>
          </a>
        </div>

        {/* View Profile Details & Reviews Links */}
        <div className="flex items-center justify-between pt-1 gap-2 text-[11px] font-semibold text-amber-850 dark:text-amber-300/90">
          {onOpenDetails && (
            <button
              type="button"
              onClick={() => onOpenDetails(pandit)}
              className="hover:text-amber-950 dark:hover:text-amber-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Full Credentials</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
          {onOpenReviews && (
            <button
              type="button"
              onClick={() => onOpenReviews(pandit)}
              className="hover:text-amber-950 dark:hover:text-amber-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>Devotee Reviews ({pandit.reviewCount ?? 1})</span>
            </button>
          )}
        </div>
      </footer>
    </article>
  );
};

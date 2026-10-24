import React, { useState } from "react";
import {
  X,
  MapPin,
  Clock,
  BookOpen,
  Languages,
  Building2,
  Calendar,
  CheckCircle2,
  Award,
  Phone,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Heart,
  Share2,
} from "lucide-react";
import type { PanditProfile } from "../../types/pandit";
import { PanditTrustBadges } from "./PanditTrustBadges";
import {
  createWhatsAppDeepLink,
  triggerWhatsAppConnect,
  formatWhatsAppPhoneNumber,
} from "../../utils/whatsapp-deep-link";
import { type AppTheme } from "../../types";

export interface PanditProfileModalProps {
  pandit: PanditProfile | null;
  isOpen: boolean;
  onClose: () => void;
  theme?: AppTheme;
}

export const PanditProfileModal: React.FC<PanditProfileModalProps> = ({
  pandit,
  isOpen,
  onClose,
  theme = "light",
}) => {
  if (!isOpen || !pandit) return null;

  const isLight = theme === "light";
  const [selectedRitualId, setSelectedRitualId] = useState<string>(
    pandit.rituals[0]?.id || "general"
  );
  const [activeTab, setActiveTab] = useState<"rituals" | "credentials" | "endorsements">("rituals");

  const selectedRitual =
    pandit.rituals.find((r) => r.id === selectedRitualId) || pandit.rituals[0];

  const whatsAppInfo = createWhatsAppDeepLink({
    phone: pandit.phone,
    panditName: pandit.name,
    ritualName: selectedRitual?.name || "Vedic Puja",
  });

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault();
    triggerWhatsAppConnect({
      phone: pandit.phone,
      panditName: pandit.name,
      ritualName: selectedRitual?.name || "Vedic Puja",
    });
  };

  const initials = pandit.name
    .replace(/^Pandit\s+|^Acharya\s+/i, "")
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pandit-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-2xl max-h-[90vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden animate-scaleUp ${
          isLight
            ? "bg-[#FCF8F2] text-stone-900 border-amber-300"
            : "bg-stone-900 text-stone-100 border-amber-500/30"
        }`}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-amber-500/15 flex items-start justify-between relative bg-amber-500/[0.03]">
          <div className="flex items-start gap-4">
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center font-bold text-xl sm:text-2xl shadow-inner border flex-shrink-0 ${
                isLight
                  ? "bg-gradient-to-br from-amber-100 to-amber-200 text-amber-900 border-amber-300"
                  : "bg-gradient-to-br from-amber-900/60 to-stone-800 text-amber-300 border-amber-500/30"
              }`}
            >
              {initials || "🕉️"}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  id="pandit-modal-title"
                  className="text-lg sm:text-xl font-bold font-serif leading-tight"
                >
                  {pandit.name}
                </h2>
                {pandit.sanskritName && (
                  <span className="text-sm font-serif opacity-75">
                    ({pandit.sanskritName})
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm font-medium text-amber-800 dark:text-amber-300/90 mt-0.5">
                {pandit.title}
              </p>

              {/* Trust Badges directly in modal header */}
              <div className="mt-2.5">
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

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-full text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-amber-500/10 px-4 sm:px-6 bg-amber-500/[0.01]">
          {[
            { id: "rituals", label: `Rituals & Pujas (${pandit.rituals.length})` },
            { id: "credentials", label: "Lineage & Credentials" },
            { id: "endorsements", label: `Peer Endorsements (${pandit.peerEndorsements.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "border-amber-500 text-amber-900 dark:text-amber-300"
                  : "border-transparent text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === "rituals" && (
            <div className="space-y-4">
              <div className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                {pandit.bio}
              </div>

              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                  Select a ritual to connect directly with Panditji:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {pandit.rituals.map((r) => {
                    const isSelected = selectedRitualId === r.id;
                    return (
                      <div
                        key={r.id}
                        onClick={() => setSelectedRitualId(r.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? "border-amber-500 bg-amber-500/10 shadow-xs"
                            : isLight
                            ? "border-stone-200 hover:border-amber-300 bg-white"
                            : "border-stone-800 hover:border-amber-500/30 bg-stone-800/40"
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold text-xs text-stone-900 dark:text-stone-100">
                          <span>{r.name}</span>
                          <span className="text-[11px] font-mono text-amber-700 dark:text-amber-400">
                            {r.duration}
                          </span>
                        </div>
                        {r.sanskritName && (
                          <div className="text-[11px] font-serif opacity-70 mt-0.5">
                            {r.sanskritName}
                          </div>
                        )}
                        <p className="text-[11px] text-stone-700 dark:text-stone-300 mt-1 line-clamp-2">
                          {r.description}
                        </p>
                        {r.samagriListProvided && (
                          <div className="mt-2 text-[10px] text-emerald-800 dark:text-emerald-400 flex items-center gap-1 font-medium">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Full Samagri & Preparation List Provided</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === "credentials" && (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-2xl border ${
                  isLight
                    ? "bg-amber-50/70 border-amber-200"
                    : "bg-amber-950/20 border-amber-500/30"
                }`}
              >
                <div className="flex items-center gap-2 mb-2 font-bold text-sm text-amber-900 dark:text-amber-300">
                  <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Veda Pathashala Verification Dossier</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-semibold text-stone-900 dark:text-stone-200">
                      Certifying Institution:
                    </span>{" "}
                    <span className="text-stone-700 dark:text-stone-300">
                      {pandit.verificationDetails?.institution || "Verified Vedic Gurukulam"}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-stone-900 dark:text-stone-200">
                      Vedic Tradition:
                    </span>{" "}
                    <span className="text-stone-700 dark:text-stone-300">{pandit.tradition}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-stone-900 dark:text-stone-200">
                      Lineage / Guru:
                    </span>{" "}
                    <span className="text-stone-700 dark:text-stone-300">
                      {pandit.verificationDetails?.lineageOrGuru || "Guru-Shishya Parampara"}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-stone-900 dark:text-stone-200">
                      Credential ID:
                    </span>{" "}
                    <span className="font-mono text-stone-700 dark:text-stone-300">
                      {pandit.verificationDetails?.credentialId || "SS-VERIFIED-2024"}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-stone-900 dark:text-stone-200">
                      Date Verified:
                    </span>{" "}
                    <span className="text-stone-700 dark:text-stone-300">
                      {pandit.verificationDetails?.verifiedDate || "2024"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 text-xs text-stone-700 dark:text-stone-300 space-y-1">
                <span className="font-semibold text-stone-900 dark:text-stone-200 block">
                  Zero-Fee Facilitation Promise:
                </span>
                <p>
                  sutraSparsh charges 0% commission. Devotees and Purohits connect with complete
                  freedom. Any voluntary Dakshina or ritual honorarium is decided directly between
                  the devotee and the Panditji in accordance with Vedic tradition.
                </p>
              </div>
            </div>
          )}

          {activeTab === "endorsements" && (
            <div className="space-y-3">
              {pandit.peerEndorsements.map((pe) => (
                <div
                  key={pe.id}
                  className={`p-3.5 rounded-xl border text-xs leading-relaxed space-y-1.5 ${
                    isLight
                      ? "bg-white border-sky-200 shadow-xs"
                      : "bg-stone-800/60 border-sky-500/20"
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-stone-900 dark:text-stone-100">
                    <div className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                      <span>{pe.endorserName}</span>
                    </div>
                    <span className="text-[10px] font-normal text-stone-600 dark:text-stone-300">
                      {pe.date}
                    </span>
                  </div>

                  <div className="text-[11px] text-sky-800 dark:text-sky-300/90 font-medium">
                    {pe.endorserTitle}
                    {pe.institution && ` • ${pe.institution}`}
                  </div>

                  <p className="italic text-stone-600 dark:text-stone-300 text-[11.5px] pt-1">
                    &ldquo;{pe.comment}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 sm:p-5 border-t border-amber-500/15 bg-amber-500/[0.03] space-y-2.5">
          {/* Pre-formatted message preview */}
          <div
            className={`p-2 rounded-lg text-[11px] border font-mono truncate ${
              isLight
                ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                : "bg-emerald-950/20 border-emerald-800/40 text-emerald-300"
            }`}
          >
            <span className="font-semibold block text-[10px] uppercase font-sans tracking-wider text-emerald-800 dark:text-emerald-400">
              WhatsApp Inquiry:
            </span>
            &ldquo;{whatsAppInfo.rawMessage}&rdquo;
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href={whatsAppInfo.url}
              onClick={handleWhatsAppClick}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] transition-all shadow-md cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
              <span>Connect via WhatsApp</span>
            </a>

            <a
              href={`tel:${formatWhatsAppPhoneNumber(pandit.phone)}`}
              className={`flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                isLight
                  ? "bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-300"
                  : "bg-stone-800 hover:bg-stone-700 text-amber-300 border-amber-500/30"
              }`}
            >
              <Phone className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Direct Call</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

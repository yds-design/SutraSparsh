import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  ShieldCheck,
  Award,
  Sparkles,
  Heart,
  Phone,
  MessageSquare,
  CheckCircle2,
  Calendar,
  X,
  Compass,
  Building2,
  BookOpen,
  Info,
} from "lucide-react";
import { PANDIT_CORPUS } from "../../data/panditCorpus";
import type { PanditProfile } from "../../types/pandit";
import { PanditProfileCard } from "./PanditProfileCard";
import { PanditProfileModal } from "./PanditProfileModal";
import { type AppTheme } from "../../types";

export interface PanditServicesViewProps {
  theme?: AppTheme;
  onNavigateTab?: (tab: string) => void;
}

export const PanditServicesView: React.FC<PanditServicesViewProps> = ({
  theme = "light",
  onNavigateTab,
}) => {
  const isLight = theme === "light";

  // Filter States
  const [selectedTradition, setSelectedTradition] = useState<string>("All");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("All");
  const [selectedRitualCategory, setSelectedRitualCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [peerEndorsedOnly, setPeerEndorsedOnly] = useState<boolean>(false);

  // Selected Pandit for modal detail
  const [selectedPanditForModal, setSelectedPanditForModal] = useState<PanditProfile | null>(null);

  // Unique Traditions & Languages
  const traditions = useMemo(() => {
    const list = Array.from(new Set(PANDIT_CORPUS.map((p) => p.tradition)));
    return ["All", ...list];
  }, []);

  const languages = useMemo(() => {
    const set = new Set<string>();
    PANDIT_CORPUS.forEach((p) => p.languages.forEach((l) => set.add(l)));
    return ["All", ...Array.from(set)];
  }, []);

  const ritualCategories = ["All", "Samskara", "Puja", "Homa"];

  // Filtered List
  const filteredPandits = useMemo(() => {
    return PANDIT_CORPUS.filter((pandit) => {
      // 1. Tradition filter
      if (selectedTradition !== "All" && pandit.tradition !== selectedTradition) {
        return false;
      }
      // 2. Language filter
      if (selectedLanguage !== "All" && !pandit.languages.includes(selectedLanguage)) {
        return false;
      }
      // 3. Ritual category
      if (selectedRitualCategory !== "All") {
        const cat = selectedRitualCategory.toLowerCase();
        const hasRitualInCat = pandit.rituals.some((r) => r.category === cat);
        if (!hasRitualInCat) return false;
      }
      // 4. Verified Only
      if (verifiedOnly && !pandit.isVerified) {
        return false;
      }
      // 5. Peer Endorsed Only
      if (peerEndorsedOnly && (!pandit.peerEndorsements || pandit.peerEndorsements.length === 0)) {
        return false;
      }
      // 6. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = pandit.name.toLowerCase().includes(q);
        const matchesTitle = pandit.title.toLowerCase().includes(q);
        const matchesCity = pandit.location.city.toLowerCase().includes(q);
        const matchesState = pandit.location.state.toLowerCase().includes(q);
        const matchesRitual = pandit.rituals.some(
          (r) =>
            r.name.toLowerCase().includes(q) || (r.sanskritName && r.sanskritName.includes(q))
        );
        const matchesTradition = pandit.tradition.toLowerCase().includes(q);
        return (
          matchesName ||
          matchesTitle ||
          matchesCity ||
          matchesState ||
          matchesRitual ||
          matchesTradition
        );
      }
      return true;
    });
  }, [
    selectedTradition,
    selectedLanguage,
    selectedRitualCategory,
    verifiedOnly,
    peerEndorsedOnly,
    searchQuery,
  ]);

  // Schema.org Structured Data for SEO (ProfessionalService / LocalBusiness schema)
  const structuredData = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Verified Vedic Pandit Directory & Ritual Services - sutraSparsh",
      description:
        "Direct connection with verified Vedic Purohits, Acharyas, and Ghanapaathis for authentic home and temple rituals with zero platform fees.",
      itemListElement: filteredPandits.map((p, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        item: {
          "@type": "ProfessionalService",
          name: p.name,
          description: `${p.title} with ${p.experienceYears} years experience. Specializing in ${p.rituals.map((r) => r.name).join(", ")}.`,
          address: {
            "@type": "PostalAddress",
            addressLocality: p.location.city,
            addressRegion: p.location.state,
            addressCountry: "IN",
          },
          telephone: p.phone,
          knowsAbout: p.rituals.map((r) => r.name),
          knowsLanguage: p.languages,
          priceRange: "0 (Zero Platform Fees - Direct Facilitator)",
        },
      })),
    };
  }, [filteredPandits]);

  return (
    <div
      className={`pandit-services-container max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 ${
        isLight ? "text-stone-900" : "text-stone-100"
      }`}
    >
      {/* Inject JSON-LD Schema into DOM */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* ════════════ 1. HERO BANNER: Zero-Fee Pure Facilitator Model ════════════ */}
      <section
        className={`p-6 sm:p-8 rounded-3xl border shadow-sm relative overflow-hidden ${
          isLight
            ? "bg-gradient-to-br from-amber-500/10 via-amber-100/50 to-orange-100/30 border-amber-300"
            : "bg-gradient-to-br from-amber-950/40 via-stone-900 to-stone-950 border-amber-500/30"
        }`}
      >
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-900 dark:text-amber-300 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Zero-Fee Sacred Seva Facilitator</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold font-serif tracking-tight leading-tight">
            Vedic Purohit Directory & Services
          </h1>
          <p className="text-sm sm:text-base leading-relaxed text-stone-700 dark:text-stone-300 font-normal">
            Discover, filter, and directly connect with verified Panditjis via WhatsApp or Phone.
            sutraSparsh charges <strong>0% platform fees or commissions</strong>—bridging devotees
            and authentic Vedic traditions with complete transparency and Maryada.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-stone-700 dark:text-stone-300">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <span>Veda Pathashala Verified</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0" />
              <span>Peer Purohit Endorsements</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span>Direct WhatsApp & Call Connect</span>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ 2. 24-HOUR COMMITMENT & NO-SHOW MITIGATION NOTICE ════════════ */}
      <aside
        className={`p-4 rounded-2xl border flex items-start gap-3 text-xs leading-relaxed ${
          isLight
            ? "bg-stone-50 border-stone-200 text-stone-700"
            : "bg-stone-900/60 border-stone-800 text-stone-300"
        }`}
        aria-label="Mutual Commitment Protocol"
      >
        <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-stone-900 dark:text-stone-200 block">
            Mutual Devotion & 24h Confirmation Protocol:
          </span>
          <p>
            Because sutraSparsh operates on a sacred zero-deposit trust model, an automated WhatsApp
            double-confirmation loop is recommended 24 hours prior to your ritual to ensure full
            preparedness of samagri, muhurta alignment, and priest schedule.
          </p>
        </div>
      </aside>

      {/* ════════════ 3. FILTERING & SEARCH TOOLBAR ════════════ */}
      <section
        className={`p-4 sm:p-5 rounded-2xl border space-y-4 ${
          isLight
            ? "bg-white/95 border-amber-900/10 shadow-xs"
            : "bg-stone-900/90 border-amber-500/20 shadow-xs"
        }`}
        aria-label="Directory Filters"
      >
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-600 dark:text-stone-300" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Panditji name, ritual (Griha Pravesha, Satyanarayan, Rudrabhishek), or city (Varanasi, Bengaluru)..."
            aria-label="Search Pandit directory"
            className={`w-full pl-10 pr-9 py-2.5 rounded-xl text-xs sm:text-sm border transition-colors outline-none ${
              isLight
                ? "bg-stone-50 border-stone-200 focus:border-amber-500 focus:bg-white text-stone-900"
                : "bg-stone-800/80 border-stone-700 focus:border-amber-500/70 text-stone-100"
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-100"
              aria-label="Clear search query"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown Selectors: Tradition, Language, Ritual */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Tradition Filter */}
          <div>
            <label className="block text-[10.5px] font-bold uppercase tracking-wider mb-1 text-stone-700 dark:text-stone-300">
              Vedic Tradition:
            </label>
            <select
              value={selectedTradition}
              onChange={(e) => setSelectedTradition(e.target.value)}
              className={`w-full px-3 py-2 text-xs rounded-xl border cursor-pointer font-medium ${
                isLight
                  ? "bg-stone-50 border-stone-200 text-stone-900"
                  : "bg-stone-800/80 border-stone-700 text-stone-100"
              }`}
            >
              {traditions.map((t) => (
                <option key={t} value={t}>
                  {t === "All" ? "All Traditions" : t}
                </option>
              ))}
            </select>
          </div>

          {/* Language Filter */}
          <div>
            <label className="block text-[10.5px] font-bold uppercase tracking-wider mb-1 text-stone-700 dark:text-stone-300">
              Language / Regional:
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className={`w-full px-3 py-2 text-xs rounded-xl border cursor-pointer font-medium ${
                isLight
                  ? "bg-stone-50 border-stone-200 text-stone-900"
                  : "bg-stone-800/80 border-stone-700 text-stone-100"
              }`}
            >
              {languages.map((l) => (
                <option key={l} value={l}>
                  {l === "All" ? "All Languages" : l}
                </option>
              ))}
            </select>
          </div>

          {/* Ritual Category Filter */}
          <div>
            <label className="block text-[10.5px] font-bold uppercase tracking-wider mb-1 text-stone-700 dark:text-stone-300">
              Ritual Type:
            </label>
            <select
              value={selectedRitualCategory}
              onChange={(e) => setSelectedRitualCategory(e.target.value)}
              className={`w-full px-3 py-2 text-xs rounded-xl border cursor-pointer font-medium ${
                isLight
                  ? "bg-stone-50 border-stone-200 text-stone-900"
                  : "bg-stone-800/80 border-stone-700 text-stone-100"
              }`}
            >
              {ritualCategories.map((rc) => (
                <option key={rc} value={rc}>
                  {rc === "All" ? "All Ritual Types" : rc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Toggles: Verified Only & Peer Endorsed Only */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-amber-500/10">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              aria-pressed={verifiedOnly}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                verifiedOnly
                  ? "bg-amber-500 text-stone-950 border-amber-600 shadow-xs font-bold"
                  : isLight
                  ? "bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100"
                  : "bg-stone-800 text-amber-300 border-stone-700 hover:bg-stone-700"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Only</span>
            </button>

            <button
              type="button"
              onClick={() => setPeerEndorsedOnly(!peerEndorsedOnly)}
              aria-pressed={peerEndorsedOnly}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                peerEndorsedOnly
                  ? "bg-sky-500 text-white border-sky-600 shadow-xs font-bold"
                  : isLight
                  ? "bg-sky-50 text-sky-900 border-sky-200 hover:bg-sky-100"
                  : "bg-stone-800 text-sky-300 border-stone-700 hover:bg-stone-700"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Peer Endorsed Only</span>
            </button>
          </div>

          <div className="text-xs text-stone-700 dark:text-stone-300 font-medium">
            Showing <strong>{filteredPandits.length}</strong> verified Vedic priest
            {filteredPandits.length === 1 ? "" : "s"}
          </div>
        </div>
      </section>

      {/* ════════════ 4. PANDIT DIRECTORY GRID ════════════ */}
      {filteredPandits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {filteredPandits.map((pandit) => (
            <PanditProfileCard
              key={pandit.id}
              pandit={pandit}
              theme={theme}
              onOpenDetails={(p) => setSelectedPanditForModal(p)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div
          className={`p-10 rounded-3xl border text-center space-y-3 ${
            isLight ? "bg-amber-50/50 border-amber-200" : "bg-stone-900/50 border-amber-500/20"
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center text-2xl mx-auto">
            🔍
          </div>
          <h3 className="text-base font-bold font-serif">No Purohits Found Matching Criteria</h3>
          <p className="text-xs text-stone-700 dark:text-stone-300 max-w-md mx-auto">
            Try resetting your search query or selecting &ldquo;All Traditions&rdquo; to explore all
            available verified Vedic scholars.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedTradition("All");
              setSelectedLanguage("All");
              setSelectedRitualCategory("All");
              setSearchQuery("");
              setVerifiedOnly(false);
              setPeerEndorsedOnly(false);
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-stone-950 transition-colors shadow-sm cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* ════════════ 5. MODAL FOR FULL PROFILE CREDENTIALS ════════════ */}
      <PanditProfileModal
        pandit={selectedPanditForModal}
        isOpen={Boolean(selectedPanditForModal)}
        onClose={() => setSelectedPanditForModal(null)}
        theme={theme}
      />
    </div>
  );
};

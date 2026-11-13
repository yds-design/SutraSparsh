import React, { useState } from "react";
import {
  Search,
  Filter,
  Sparkles,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Volume2,
  ArrowRight,
  Sun,
  Flame,
} from "lucide-react";
import type { ContentItem } from "../types";
import { soundEngine } from "../utils/audio";
import { matchesSanskritQuery } from "../utils/sanskritSearch";
import { Chip } from "./Chip";

interface SearchViewProps {
  verses: ContentItem[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedTradition: string;
  setSelectedTradition: (tradition: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  bookmarks: string[];
  onToggleBookmark: (id: string) => void;
  onOpenVerseModal: (verse: ContentItem) => void;
  theme?: "sandstone" | "amethyst" | "light" | "festival" | "golden-hour" | "prism-pulse";
}

const POPULAR_SPIRITUAL_QUERIES = [
  { label: "Peace in Turmoil", query: "peace" },
  { label: "Action without Anxiety (Nishkama)", query: "karmanye" },
  { label: "Stillness of Mind (Chitta Vritti)", query: "chitta" },
  { label: "True Self (Atman & Brahman)", query: "atman" },
  { label: "Surrender & Devotion", query: "bhakti" },
  { label: "Duty & Righteousness (Dharma)", query: "dharma" },
];

const TRADITIONS = ["All", "Bhagavad Gita", "Patanjali", "Upanishads", "Vedas"];
const CATEGORIES = [
  "All",
  "Karma Yoga",
  "Raja Yoga",
  "Mind & Meditation",
  "Jnana / Vedanta",
  "Vedic Chants",
];

export const SearchView: React.FC<SearchViewProps> = ({
  verses,
  searchTerm,
  setSearchTerm,
  selectedTradition,
  setSelectedTradition,
  selectedCategory,
  setSelectedCategory,
  bookmarks,
  onToggleBookmark,
  onOpenVerseModal,
  theme: propTheme,
}) => {
  const currentTheme =
    propTheme ||
    (typeof window !== "undefined"
      ? (localStorage.getItem("sutrasparsh_theme") as any) || "sandstone"
      : "sandstone");

  const isLight = currentTheme === "light";
  const isFestival = currentTheme === "festival";
  const isAmethyst = currentTheme === "amethyst";

  const [queryError, setQueryError] = useState<string | null>(null);

  const handleSearchInputChange = (rawVal: string) => {
    if (/[<>]/.test(rawVal)) {
      setQueryError("Angle brackets (<, >) are not supported in scripture queries.");
      setSearchTerm(rawVal.replace(/[<>]/g, ""));
      return;
    }
    if (rawVal.length > 160) {
      setQueryError("Search query trimmed to the 160-character maximum.");
      setSearchTerm(rawVal.slice(0, 160));
      return;
    }
    setQueryError(null);
    setSearchTerm(rawVal);
  };

  const filteredVerses = verses.filter((v) => {
    if (!v) return false;
    const authorStr = (v.metadata?.author || (v as any).source || v.title || "").toLowerCase();
    const categoryStr = (v.metadata?.category || (v as any).category || "").toLowerCase();
    const tagsList = Array.isArray(v.metadata?.tags) ? v.metadata.tags : [];

    const matchesTradition =
      selectedTradition === "All" ||
      authorStr.includes(selectedTradition.toLowerCase()) ||
      (v.title && v.title.toLowerCase().includes(selectedTradition.toLowerCase()));

    const matchesCategory =
      selectedCategory === "All" ||
      categoryStr === selectedCategory.toLowerCase();

    const matchesSearch =
      !searchTerm.trim() ||
      matchesSanskritQuery(v.title || "", searchTerm) ||
      matchesSanskritQuery(v.body || "", searchTerm) ||
      (v.transliteration && matchesSanskritQuery(v.transliteration, searchTerm)) ||
      (v.meaning && matchesSanskritQuery(v.meaning, searchTerm)) ||
      tagsList.some((t) => matchesSanskritQuery(t, searchTerm));

    return matchesTradition && matchesCategory && matchesSearch;
  });

  const handlePlayChime = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.playTempleBell(220);
  };

  const bannerBgClass = isLight
    ? "bg-white border border-[#cfcbe0] text-[#1d1b2e] shadow-[0_1px_2px_rgb(27_23_64_/_0.06)] hover:shadow-[0_10px_30px_-12px_rgb(27_23_64_/_0.28)] hover:border-[#d9a441] rounded-[28px]"
    : isFestival
    ? "bg-[#450A12]/90 border-[#FF8A00]/30 text-[#FFF6E3] shadow-xl rounded-3xl"
    : isAmethyst
    ? "bg-[#180C2C]/90 border-[#52297A]/40 text-[#EDE0F8] shadow-xl rounded-3xl"
    : "bg-stone-900/60 border-stone-800 text-stone-100 shadow-xl rounded-3xl";

  const cardBgClass = isLight
    ? "bg-white hover:bg-[#faf9fd] border-[#cfcbe0] hover:border-[#d9a441] text-[#1d1b2e] shadow-[0_1px_2px_rgb(27_23_64_/_0.06)] hover:shadow-[0_10px_30px_-12px_rgb(27_23_64_/_0.28)] rounded-[20px]"
    : isFestival
    ? "bg-[#480C14]/90 border-[#FF8A00]/30 hover:border-[#FF8A00]/60 text-[#FFF6E3] shadow-md rounded-2xl"
    : isAmethyst
    ? "bg-[#180C2C]/90 border-[#52297A]/40 hover:border-[#8A4AC7]/60 text-[#EDE0F8] shadow-md rounded-2xl"
    : "bg-stone-900/60 border-stone-800 hover:border-amber-500/40 text-stone-100 shadow-md rounded-2xl";

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Search Header Banner */}
      <div className={`border rounded-[28px] p-6 sm:p-10 space-y-6 relative overflow-hidden transition-all ${bannerBgClass}`}>
        <div className="space-y-2 max-w-2xl">
          <div className={`flex items-center space-x-2 text-[10.5px] font-extrabold tracking-widest uppercase ${
            isLight ? "text-[#b8801f]" : "text-amber-300"
          }`}>
            <Search className={`w-3.5 h-3.5 ${isLight ? "text-[#b8801f]" : "text-amber-400"}`} />
            <span>Intent-Driven Discovery • ज्ञान खोज</span>
          </div>
          <h1
            className={`font-serif-sacred text-2xl sm:text-4xl font-bold tracking-tight ${
              isLight ? "text-[#1b1740]" : "text-amber-100"
            }`}
          >
            Search Timeless Wisdom
          </h1>
          <p
            className={`text-xs sm:text-sm font-light leading-relaxed ${
              isLight ? "text-[#55526b]" : "text-stone-300"
            }`}
          >
            Search sacred scriptures by Sanskrit Devanagari, IAST transliteration, English keywords, or spiritual questions.
          </p>
        </div>

        {/* Search Input Bar */}
        <div className="space-y-1.5">
          <div className="relative">
            <Search
              aria-hidden="true"
              className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isLight ? "text-[#b8801f]" : "text-amber-500"}`}
            />
            <input
              type="text"
              value={searchTerm}
              maxLength={161}
              aria-label="Search Sanskrit shlokas or keywords"
              aria-invalid={!!queryError}
              aria-describedby="search-validation-hint"
              onChange={(e) => handleSearchInputChange(e.target.value)}
              placeholder="Type a Sanskrit shloka, keyword (e.g., 'detachment', 'chitta', 'dharma', 'Gita 2.47')..."
              className={`w-full pl-12 pr-14 py-3.5 rounded-full text-sm focus:outline-none shadow-xs border transition-all ${
                queryError
                  ? "border-red-500 focus:border-red-500"
                  : isLight
                  ? "bg-[#f7f6fb] border-[#cfcbe0] focus:border-[#d9a441] text-[#1d1b2e] placeholder-[#55526b]"
                  : "bg-stone-950/90 border-stone-800 focus:border-amber-500/60 text-stone-100 placeholder-stone-500"
              }`}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setQueryError(null);
                  setSearchTerm("");
                }}
                className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs transition-colors cursor-pointer ${
                  isLight ? "text-[#55526b] hover:text-[#1b1740]" : "text-stone-400 hover:text-stone-200"
                }`}
              >
                Clear
              </button>
            )}
          </div>
          <div id="search-validation-hint" className="flex items-center justify-between px-3 text-[11px]">
            {queryError ? (
              <span role="alert" className={isLight ? "text-red-700 font-semibold" : "text-red-300 font-semibold"}>
                {queryError}
              </span>
            ) : (
              <span className={isLight ? "text-[#55526b]" : "text-stone-400"}>
                Supports Devanagari, IAST, and English philosophical terms
              </span>
            )}
            <span className={`font-mono ${isLight ? "text-[#55526b]" : "text-stone-400"}`}>
              {searchTerm.length}/160
            </span>
          </div>
        </div>

        {/* Suggested Spiritual Queries */}
        <div className="space-y-2">
          <span
            className={`text-[10.5px] font-extrabold tracking-widest uppercase block ${
              isLight ? "text-[#b8801f]" : "text-stone-400"
            }`}
          >
            Suggested Contemplation Queries:
          </span>
          <div className="flex flex-wrap gap-2 py-1 px-0.5">
            {POPULAR_SPIRITUAL_QUERIES.map((sq) => {
              const isSelected = searchTerm === sq.query;
              return (
                <Chip
                  key={sq.label}
                  selected={isSelected}
                  onClick={() => setSearchTerm(sq.query)}
                  theme={currentTheme}
                  variant="suggestion"
                  size="md"
                  dataTestId={`search-query-${sq.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {sq.label}
                </Chip>
              );
            })}
          </div>
        </div>

        {/* Filter Pills */}
        <div
          className={`pt-4 border-t flex flex-wrap gap-4 items-center justify-between text-xs ${
            isLight ? "border-[#efedf6]" : "border-stone-800"
          }`}
        >
          <div className="flex items-center space-x-2 py-1 px-0.5">
            <span className={`font-medium ${isLight ? "text-[#55526b]" : "text-stone-500"}`}>
              Tradition:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {TRADITIONS.map((t) => {
                const isSelected = selectedTradition === t;
                return (
                  <Chip
                    key={t}
                    selected={isSelected}
                    onClick={() => setSelectedTradition(t)}
                    theme={currentTheme}
                    variant="filter"
                    size="sm"
                    dataTestId={`search-tradition-${t.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {t}
                  </Chip>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-2 py-1 px-0.5">
            <span className={`font-medium ${isLight ? "text-[#55526b]" : "text-stone-500"}`}>
              Category:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => {
                const isSelected = selectedCategory === c;
                return (
                  <Chip
                    key={c}
                    selected={isSelected}
                    onClick={() => setSelectedCategory(c)}
                    theme={currentTheme}
                    variant="filter"
                    size="sm"
                    dataTestId={`search-category-${c.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  >
                    {c}
                  </Chip>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Search Results Summary */}
      <div
        className={`flex items-center justify-between text-xs px-1 ${
          isLight ? "text-[#55526b]" : "text-stone-400"
        }`}
      >
        <span>Found {filteredVerses.length} sacred verses</span>
        {(searchTerm || selectedTradition !== "All" || selectedCategory !== "All") && (
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedTradition("All");
              setSelectedCategory("All");
            }}
            className={`font-semibold hover:underline cursor-pointer ${
              isLight ? "text-[#b8801f]" : "text-amber-500"
            }`}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Results Grid */}
      {filteredVerses.length === 0 ? (
        <div
          className={`border rounded-[20px] p-12 text-center space-y-3 ${
            isLight
              ? "bg-white border-[#cfcbe0] text-[#1d1b2e] shadow-[0_1px_2px_rgb(27_23_64_/_0.06)]"
              : "bg-stone-900/40 border-stone-800 text-stone-300"
          }`}
        >
          <Search className={`w-8 h-8 mx-auto ${isLight ? "text-[#b8801f]" : "text-stone-400"}`} />
          <p className={`text-sm font-serif-sacred font-bold ${isLight ? "text-[#1b1740]" : "text-stone-100"}`}>
            No verses found matching your query.
          </p>
          <p className={`text-xs ${isLight ? "text-[#55526b]" : "text-stone-400"}`}>
            Try searching for broader spiritual concepts like "peace", "dharma", "gita", or "chitta".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVerses.map((verse) => {
            const isSaved = bookmarks.includes(verse.id);

            // Clean source to never show "json" or "production"
            const cleanSource =
              verse.metadata?.source &&
              !["json", "production", "manual"].includes(verse.metadata.source.toLowerCase())
                ? verse.metadata.source
                : verse.metadata?.author &&
                  !["json", "production", "manual"].includes(verse.metadata.author.toLowerCase())
                ? verse.metadata.author
                : (verse as any).source &&
                  !["json", "production", "manual"].includes(String((verse as any).source).toLowerCase())
                ? (verse as any).source
                : (verse.title || "").includes("Gita")
                ? "Bhagavad Gita"
                : (verse.title || "").includes("Yoga")
                ? "Patanjali Yoga Sutras"
                : "Timeless Scripture";

            return (
              <div
                key={verse.id}
                onClick={() => onOpenVerseModal(verse)}
                className={`group border rounded-[20px] p-5 space-y-3 transition-all cursor-pointer flex flex-col justify-between hover:-translate-y-0.5 ${cardBgClass}`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                        isLight
                          ? "bg-[#fbf0d6] text-[#b8801f] border-[#f0cf8a]/60"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}
                    >
                      {verse.metadata?.category || (verse as any).category || "Scripture"}
                    </span>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={handlePlayChime}
                        className={`p-1.5 rounded-full transition-colors ${
                          isLight ? "text-[#55526b] hover:text-[#1b1740] hover:bg-[#efedf6]" : "text-stone-400 hover:text-amber-300"
                        }`}
                        title="Chime"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleBookmark(verse.id);
                        }}
                        className={`p-1.5 rounded-full transition-colors ${
                          isLight ? "text-[#55526b] hover:text-[#b8801f] hover:bg-[#efedf6]" : "text-stone-400 hover:text-amber-400"
                        }`}
                        title="Save to Sanctuary"
                      >
                        {isSaved ? (
                          <BookmarkCheck
                            className={`w-4 h-4 ${
                              isLight ? "text-[#b8801f] fill-[#d9a441]/30" : "text-amber-400 fill-amber-400/20"
                            }`}
                          />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <h3
                    className={`font-serif-sacred font-bold text-sm transition-colors ${
                      isLight
                        ? "text-[#1b1740] group-hover:text-[#b8801f]"
                        : "text-amber-100 group-hover:text-amber-300"
                    }`}
                  >
                    {verse.title}
                  </h3>

                  <p
                    className={`font-sanskrit text-sm leading-relaxed ${
                      isLight ? "text-[#1b1740] font-semibold" : "text-amber-200/90"
                    }`}
                  >
                    {verse.body}
                  </p>

                  {verse.meaning && (
                    <p
                      className={`text-xs italic leading-relaxed pt-1.5 border-t ${
                        isLight
                          ? "text-[#1d1b2e] border-[#cfcbe0] border-dashed"
                          : "text-stone-300 border-stone-800/60"
                      }`}
                    >
                      "{verse.meaning}"
                    </p>
                  )}
                </div>

                <div
                  className={`pt-3 border-t flex items-center justify-between text-xs ${
                    isLight ? "border-[#cfcbe0] border-dashed text-[#b8801f]" : "border-stone-800/80 text-amber-400/90"
                  }`}
                >
                  <span
                    className={`text-[11px] font-semibold ${
                      isLight ? "text-[#55526b]" : "text-stone-400"
                    }`}
                  >
                    {cleanSource}
                  </span>
                  <span className="flex items-center space-x-1 font-semibold group-hover:translate-x-1 transition-transform">
                    <span>Read Full Commentary</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

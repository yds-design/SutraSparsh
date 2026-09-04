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
  theme?: "sandstone" | "amethyst" | "light" | "festival";
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

  const filteredVerses = verses.filter((v) => {
    const matchesTradition =
      selectedTradition === "All" ||
      v.metadata.author?.toLowerCase().includes(selectedTradition.toLowerCase()) ||
      v.title.toLowerCase().includes(selectedTradition.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" ||
      v.metadata.category?.toLowerCase() === selectedCategory.toLowerCase();

    const matchesSearch =
      !searchTerm.trim() ||
      matchesSanskritQuery(v.title, searchTerm) ||
      matchesSanskritQuery(v.body, searchTerm) ||
      (v.transliteration && matchesSanskritQuery(v.transliteration, searchTerm)) ||
      (v.meaning && matchesSanskritQuery(v.meaning, searchTerm)) ||
      (v.metadata.tags && v.metadata.tags.some((t) => matchesSanskritQuery(t, searchTerm)));

    return matchesTradition && matchesCategory && matchesSearch;
  });

  const handlePlayChime = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.playTempleBell(220);
  };

  const bannerBgClass = isLight
    ? "bg-white border-stone-200 text-stone-900 shadow-md"
    : isFestival
    ? "bg-[#450A12]/90 border-[#FF8A00]/30 text-[#FFF6E3] shadow-xl"
    : isAmethyst
    ? "bg-[#180C2C]/90 border-[#52297A]/40 text-[#EDE0F8] shadow-xl"
    : "bg-stone-900/60 border-stone-800 text-stone-100 shadow-xl";

  const cardBgClass = isLight
    ? "bg-white border-stone-200 hover:border-amber-400 text-stone-900 shadow-sm hover:shadow-md"
    : isFestival
    ? "bg-[#480C14]/90 border-[#FF8A00]/30 hover:border-[#FF8A00]/60 text-[#FFF6E3] shadow-md"
    : isAmethyst
    ? "bg-[#180C2C]/90 border-[#52297A]/40 hover:border-[#8A4AC7]/60 text-[#EDE0F8] shadow-md"
    : "bg-stone-900/60 border-stone-800 hover:border-amber-500/40 text-stone-100 shadow-md";

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Search Header Banner */}
      <div className={`border rounded-3xl p-6 sm:p-10 space-y-6 relative overflow-hidden ${bannerBgClass}`}>
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center space-x-2 text-amber-500 text-xs font-mono uppercase tracking-wider">
            <Search className="w-3.5 h-3.5" />
            <span>Intent-Driven Discovery • ज्ञान खोज</span>
          </div>
          <h1
            className={`font-serif-sacred text-2xl sm:text-4xl font-bold ${
              isLight ? "text-[#221509]" : "text-amber-100"
            }`}
          >
            Search Timeless Wisdom
          </h1>
          <p
            className={`text-xs sm:text-sm font-light ${
              isLight ? "text-[#5C4533]" : "text-stone-300"
            }`}
          >
            Search sacred scriptures by Sanskrit Devanagari, IAST transliteration, English keywords, or spiritual questions.
          </p>
        </div>

        {/* Search Input Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Type a Sanskrit shloka, keyword (e.g., 'detachment', 'chitta', 'dharma', 'Gita 2.47')..."
            className={`w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm focus:outline-none shadow-inner border transition-all ${
              isLight
                ? "bg-[#FAF7F2] border-stone-300 focus:border-amber-600 text-stone-900 placeholder-stone-400"
                : "bg-stone-950/90 border-stone-800 focus:border-amber-500/60 text-stone-100 placeholder-stone-500"
            }`}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs transition-colors ${
                isLight ? "text-stone-500 hover:text-stone-900" : "text-stone-400 hover:text-stone-200"
              }`}
            >
              Clear
            </button>
          )}
        </div>

        {/* Suggested Spiritual Queries */}
        <div className="space-y-2">
          <span
            className={`text-[11px] font-mono uppercase tracking-wider block ${
              isLight ? "text-stone-600 font-semibold" : "text-stone-400"
            }`}
          >
            Suggested Contemplation Queries:
          </span>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SPIRITUAL_QUERIES.map((sq) => {
              const isSelected = searchTerm === sq.query;
              return (
                <button
                  key={sq.label}
                  onClick={() => setSearchTerm(sq.query)}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                    isSelected
                      ? isLight
                        ? "bg-amber-100 text-amber-900 border-amber-400 font-semibold shadow-sm"
                        : "bg-amber-500/20 text-amber-200 border-amber-500/50 shadow-sm"
                      : isLight
                      ? "bg-[#F5EFE6] border-stone-300 text-stone-800 hover:border-amber-400 hover:text-amber-900 hover:bg-amber-50"
                      : "bg-stone-950 border-stone-800/80 text-stone-300 hover:border-amber-500/40 hover:text-amber-300"
                  }`}
                >
                  {sq.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Pills */}
        <div
          className={`pt-4 border-t flex flex-wrap gap-4 items-center justify-between text-xs ${
            isLight ? "border-stone-200" : "border-stone-800"
          }`}
        >
          <div className="flex items-center space-x-2">
            <span className={`font-medium ${isLight ? "text-stone-700" : "text-stone-500"}`}>
              Tradition:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {TRADITIONS.map((t) => {
                const isSelected = selectedTradition === t;
                return (
                  <button
                    key={t}
                    onClick={() => setSelectedTradition(t)}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-colors border ${
                      isSelected
                        ? isLight
                          ? "bg-amber-100 text-amber-900 border-amber-400 font-semibold"
                          : "bg-amber-500/20 text-amber-200 border-amber-500/40"
                        : isLight
                        ? "bg-[#FBF8F3] text-stone-700 border-stone-300 hover:bg-stone-100"
                        : "bg-stone-950 text-stone-400 border-stone-800 hover:text-stone-200"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`font-medium ${isLight ? "text-stone-700" : "text-stone-500"}`}>
              Category:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => {
                const isSelected = selectedCategory === c;
                return (
                  <button
                    key={c}
                    onClick={() => setSelectedCategory(c)}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-colors border ${
                      isSelected
                        ? isLight
                          ? "bg-amber-100 text-amber-900 border-amber-400 font-semibold"
                          : "bg-amber-500/20 text-amber-200 border-amber-500/40"
                        : isLight
                        ? "bg-[#FBF8F3] text-stone-700 border-stone-300 hover:bg-stone-100"
                        : "bg-stone-950 text-stone-400 border-stone-800 hover:text-stone-200"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Search Results Summary */}
      <div
        className={`flex items-center justify-between text-xs px-1 ${
          isLight ? "text-stone-600" : "text-stone-400"
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
            className="text-amber-500 font-semibold hover:underline"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Results Grid */}
      {filteredVerses.length === 0 ? (
        <div
          className={`border rounded-3xl p-12 text-center space-y-3 ${
            isLight ? "bg-white border-stone-200 text-stone-700" : "bg-stone-900/40 border-stone-800 text-stone-300"
          }`}
        >
          <Search className="w-8 h-8 text-stone-400 mx-auto" />
          <p className="text-sm font-serif-sacred font-bold">
            No verses found matching your query.
          </p>
          <p className={`text-xs ${isLight ? "text-stone-500" : "text-stone-400"}`}>
            Try searching for broader spiritual concepts like "peace", "dharma", "gita", or "chitta".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVerses.map((verse) => {
            const isSaved = bookmarks.includes(verse.id);

            // Clean source to never show "json" or "production"
            const cleanSource =
              verse.metadata.source &&
              !["json", "production", "manual"].includes(verse.metadata.source.toLowerCase())
                ? verse.metadata.source
                : verse.metadata.author &&
                  !["json", "production", "manual"].includes(verse.metadata.author.toLowerCase())
                ? verse.metadata.author
                : verse.title.includes("Gita")
                ? "Bhagavad Gita"
                : verse.title.includes("Yoga")
                ? "Patanjali Yoga Sutras"
                : "Timeless Scripture";

            return (
              <div
                key={verse.id}
                onClick={() => onOpenVerseModal(verse)}
                className={`group border rounded-2xl p-5 space-y-3 transition-all cursor-pointer flex flex-col justify-between hover:-translate-y-0.5 ${cardBgClass}`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                        isLight
                          ? "bg-amber-100 text-amber-900 border-amber-300"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}
                    >
                      {verse.metadata.category || "Scripture"}
                    </span>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={handlePlayChime}
                        className={`p-1 transition-colors ${
                          isLight ? "text-stone-500 hover:text-amber-800" : "text-stone-400 hover:text-amber-300"
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
                        className={`p-1 transition-colors ${
                          isLight ? "text-stone-500 hover:text-amber-800" : "text-stone-400 hover:text-amber-400"
                        }`}
                        title="Save to Sanctuary"
                      >
                        {isSaved ? (
                          <BookmarkCheck
                            className={`w-4 h-4 ${
                              isLight ? "text-amber-700 fill-amber-700/20" : "text-amber-400 fill-amber-400/20"
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
                        ? "text-[#221509] group-hover:text-amber-800"
                        : "text-amber-100 group-hover:text-amber-300"
                    }`}
                  >
                    {verse.title}
                  </h3>

                  <p
                    className={`font-sanskrit text-sm leading-relaxed ${
                      isLight ? "text-[#1C0F05] font-semibold" : "text-amber-200/90"
                    }`}
                  >
                    {verse.body}
                  </p>

                  {verse.meaning && (
                    <p
                      className={`text-xs italic leading-relaxed pt-1.5 border-t ${
                        isLight
                          ? "text-[#4D3929] border-stone-200"
                          : "text-stone-300 border-stone-800/60"
                      }`}
                    >
                      "{verse.meaning}"
                    </p>
                  )}
                </div>

                <div
                  className={`pt-3 border-t flex items-center justify-between text-xs ${
                    isLight ? "border-stone-200 text-amber-800" : "border-stone-800/80 text-amber-400/90"
                  }`}
                >
                  <span
                    className={`text-[11px] font-semibold ${
                      isLight ? "text-stone-600" : "text-stone-400"
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

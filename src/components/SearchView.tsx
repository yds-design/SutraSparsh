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
}) => {
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

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Search Header Banner */}
      <div className="bg-stone-900/60 border border-stone-800 rounded-3xl p-6 sm:p-10 space-y-6 shadow-xl relative overflow-hidden">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono uppercase tracking-wider">
            <Search className="w-3.5 h-3.5" />
            <span>Intent-Driven Discovery • ज्ञान खोज</span>
          </div>
          <h1 className="font-serif-sacred text-2xl sm:text-4xl font-bold text-amber-100">
            Search Timeless Wisdom
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm font-light">
            Search sacred scriptures by Sanskrit Devanagari, IAST transliteration, English keywords, or spiritual questions.
          </p>
        </div>

        {/* Search Input Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Type a Sanskrit shloka, keyword (e.g., 'detachment', 'chitta', 'dharma', 'Gita 2.47')..."
            className="w-full pl-12 pr-4 py-3.5 bg-stone-950/90 border border-stone-800 focus:border-amber-500/60 rounded-2xl text-sm text-stone-100 placeholder-stone-500 focus:outline-none shadow-inner"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-200"
            >
              Clear
            </button>
          )}
        </div>

        {/* Suggested Spiritual Queries */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wider block">
            Suggested Contemplation Queries:
          </span>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SPIRITUAL_QUERIES.map((sq) => (
              <button
                key={sq.label}
                onClick={() => setSearchTerm(sq.query)}
                className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                  searchTerm === sq.query
                    ? "bg-amber-500/20 text-amber-200 border-amber-500/50 shadow-sm"
                    : "bg-stone-950 border-stone-800/80 text-stone-300 hover:border-amber-500/40 hover:text-amber-300"
                }`}
              >
                {sq.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="pt-4 border-t border-stone-800 flex flex-wrap gap-4 items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-stone-500 font-medium">Tradition:</span>
            <div className="flex flex-wrap gap-1.5">
              {TRADITIONS.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTradition(t)}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
                    selectedTradition === t
                      ? "bg-amber-500/20 text-amber-200 border border-amber-500/40"
                      : "bg-stone-950 text-stone-400 border border-stone-800 hover:text-stone-200"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-stone-500 font-medium">Category:</span>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
                    selectedCategory === c
                      ? "bg-amber-500/20 text-amber-200 border border-amber-500/40"
                      : "bg-stone-950 text-stone-400 border border-stone-800 hover:text-stone-200"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Search Results Summary */}
      <div className="flex items-center justify-between text-xs text-stone-400 px-1">
        <span>Found {filteredVerses.length} sacred verses</span>
        {(searchTerm || selectedTradition !== "All" || selectedCategory !== "All") && (
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedTradition("All");
              setSelectedCategory("All");
            }}
            className="text-amber-400 hover:underline"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Results Grid */}
      {filteredVerses.length === 0 ? (
        <div className="bg-stone-900/40 border border-stone-800 rounded-3xl p-12 text-center space-y-3">
          <Search className="w-8 h-8 text-stone-600 mx-auto" />
          <p className="text-stone-300 text-sm font-serif-sacred">
            No verses found matching your query.
          </p>
          <p className="text-xs text-stone-500">
            Try searching for broader spiritual concepts like "peace", "dharma", "gita", or "chitta".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVerses.map((verse) => {
            const isSaved = bookmarks.includes(verse.id);
            return (
              <div
                key={verse.id}
                onClick={() => onOpenVerseModal(verse)}
                className="group bg-stone-900/60 border border-stone-800 hover:border-amber-500/40 rounded-2xl p-5 space-y-3 transition-all cursor-pointer flex flex-col justify-between hover:shadow-xl hover:-translate-y-0.5"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {verse.metadata.category || "Scripture"}
                    </span>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={handlePlayChime}
                        className="p-1 text-stone-400 hover:text-amber-300"
                        title="Chime"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleBookmark(verse.id);
                        }}
                        className="p-1 text-stone-400 hover:text-amber-400"
                        title="Save to Sanctuary"
                      >
                        {isSaved ? (
                          <BookmarkCheck className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <h3 className="font-serif-sacred font-bold text-amber-100 text-sm group-hover:text-amber-300 transition-colors">
                    {verse.title}
                  </h3>

                  <p className="font-sanskrit text-amber-200/90 text-sm leading-relaxed line-clamp-3">
                    {verse.body}
                  </p>

                  {verse.meaning && (
                    <p className="text-stone-400 text-xs italic line-clamp-2 pt-1 border-t border-stone-800/60">
                      "{verse.meaning}"
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs text-amber-400/90">
                  <span className="text-[11px] text-stone-500">{verse.metadata.source}</span>
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

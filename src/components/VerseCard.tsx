import React from "react";
import { Bookmark, BookmarkCheck, Volume2, Sparkles, ArrowRight } from "lucide-react";
import type { ContentItem } from "../types";
import { soundEngine } from "../utils/audio";

interface VerseCardProps {
  item: ContentItem;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onSelect: (item: ContentItem) => void;
  theme?: "sandstone" | "amethyst" | "light" | "festival";
}

export const VerseCard: React.FC<VerseCardProps> = ({
  item,
  isBookmarked,
  onToggleBookmark,
  onSelect,
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

  const handleChime = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.playTempleBell(261.63); // Middle C harmonic chime
  };

  // Sanitize author and source so technical terms like "json" or "production" never show
  const cleanAuthor =
    item.metadata.author && !["json", "production", "manual"].includes(item.metadata.author.toLowerCase())
      ? item.metadata.author
      : item.title.includes("Gita")
      ? "Bhagavad Gita"
      : item.title.includes("Yoga")
      ? "Patanjali"
      : item.title.includes("Upanishad")
      ? "Upanishads"
      : "Scripture";

  // Sanitize tags: strictly authentic spiritual tags like Patanjali, Yoga, Gita
  const displayTags = (item.metadata.tags || [])
    .filter(
      (t) =>
        !["json", "production", "manual", "publisher", "api", "database", "test"].includes(
          t.toLowerCase()
        )
    )
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1));

  const spiritualTags =
    displayTags.length > 0
      ? displayTags
      : item.title.includes("Gita")
      ? ["Gita", "Yoga", "Karma"]
      : item.title.includes("Yoga")
      ? ["Patanjali", "Yoga", "Mind"]
      : ["Wisdom", "Sutra", "Vedanta"];

  const cardBgClass = isLight
    ? "bg-white hover:bg-[#FFFDF9] border-stone-200 hover:border-amber-500/50 text-stone-900 shadow-sm hover:shadow-md"
    : isFestival
    ? "bg-[#480C14]/90 hover:bg-[#57101B] border-[#FF8A00]/30 hover:border-[#FF8A00]/60 text-[#FFF6E3] shadow-md"
    : isAmethyst
    ? "bg-[#180C2C]/90 hover:bg-[#23123F] border-[#52297A]/40 hover:border-[#8A4AC7]/60 text-[#EDE0F8] shadow-md"
    : "bg-stone-900/70 hover:bg-stone-900 border-stone-800 hover:border-amber-500/40 text-stone-100";

  return (
    <div
      id={`verse-card-${item.id}`}
      onClick={() => onSelect(item)}
      className={`group relative rounded-2xl p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between border ${cardBgClass}`}
    >
      <div>
        {/* Top Header metadata */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                isLight
                  ? "bg-amber-100/80 text-amber-900 border-amber-300/80"
                  : "bg-amber-500/10 text-amber-300 border-amber-500/20"
              }`}
            >
              {cleanAuthor}
            </span>
            {item.metadata.category && (
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] border ${
                  isLight
                    ? "bg-stone-100 text-stone-700 border-stone-200"
                    : "bg-stone-800 text-stone-300 border-stone-700"
                }`}
              >
                {item.metadata.category}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={handleChime}
              title="Chime Meditative Bell"
              className={`p-1.5 rounded-lg transition-colors ${
                isLight
                  ? "text-stone-500 hover:text-amber-800 hover:bg-stone-100"
                  : "text-stone-400 hover:text-amber-300 hover:bg-stone-800"
              }`}
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(item.id);
              }}
              title={isBookmarked ? "Remove Bookmark" : "Bookmark Verse"}
              className={`p-1.5 rounded-lg transition-colors ${
                isLight
                  ? "text-stone-500 hover:text-amber-800 hover:bg-stone-100"
                  : "text-stone-400 hover:text-amber-300 hover:bg-stone-800"
              }`}
            >
              {isBookmarked ? (
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

        {/* Title */}
        <h3
          className={`font-serif-sacred text-lg font-bold transition-colors mb-1 ${
            isLight
              ? "text-[#221509] group-hover:text-amber-800"
              : "text-amber-100 group-hover:text-amber-300"
          }`}
        >
          {item.title}
        </h3>
        {item.subtitle && (
          <p
            className={`text-xs mb-3 italic ${
              isLight ? "text-[#8C4A00]" : "text-amber-400/80"
            }`}
          >
            {item.subtitle}
          </p>
        )}

        {/* Sanskrit Devanagari Body */}
        <div
          className={`rounded-xl p-4 border mb-4 transition-colors ${
            isLight
              ? "bg-[#FAF7F0] border-[#E8DCCB] group-hover:border-amber-300"
              : "bg-stone-950/60 border-stone-800/80 group-hover:border-stone-700/80"
          }`}
        >
          <p
            className={`font-sanskrit text-base sm:text-lg leading-relaxed whitespace-pre-line text-center ${
              isLight ? "text-[#1C0F05] font-semibold" : "text-amber-200/90"
            }`}
          >
            {item.body}
          </p>
        </div>

        {/* Transliteration */}
        {item.transliteration && (
          <p
            className={`text-xs font-mono italic mb-3 line-clamp-2 ${
              isLight ? "text-[#614E3E]" : "text-stone-400"
            }`}
          >
            {item.transliteration}
          </p>
        )}

        {/* English Meaning */}
        {item.meaning && (
          <p
            className={`text-sm leading-relaxed line-clamp-3 ${
              isLight ? "text-[#3B291B]" : "text-stone-300"
            }`}
          >
            {item.meaning}
          </p>
        )}
      </div>

      {/* Footer tags and read more */}
      <div
        className={`mt-5 pt-4 border-t flex items-center justify-between ${
          isLight ? "border-stone-200" : "border-stone-800/60"
        }`}
      >
        <div className="flex flex-wrap gap-1.5">
          {spiritualTags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-md ${
                isLight
                  ? "bg-amber-100/70 text-amber-900 border border-amber-200"
                  : "bg-stone-800/80 text-amber-300/80 border border-white/5"
              }`}
            >
              #{tag}
            </span>
          ))}
        </div>

        <div
          className={`flex items-center space-x-1 text-xs font-semibold group-hover:translate-x-1 transition-transform ${
            isLight ? "text-amber-800" : "text-amber-400"
          }`}
        >
          <span>Explore</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};

import React from "react";
import { Bookmark, BookmarkCheck, Volume2, Sparkles, ArrowRight } from "lucide-react";
import type { ContentItem } from "../types";
import { recitationEngine } from "../utils/recitationEngine";

interface VerseCardProps {
  item: ContentItem;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onSelect: (item: ContentItem) => void;
  theme?: "sandstone" | "amethyst" | "light" | "festival" | "golden-hour" | "prism-pulse";
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
  const isGoldenHour = currentTheme === "golden-hour";
  const isPrismPulse = currentTheme === "prism-pulse";
  const isLightCanvas = isLight || isPrismPulse;

  const handleListen = (e: React.MouseEvent) => {
    e.stopPropagation();
    recitationEngine.play(item.id, item.body, 0.85);
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

  const cardBgClass = isLightCanvas
    ? isPrismPulse
      ? "bg-white hover:bg-slate-50/90 border-stone-200 hover:border-[#936BFA]/50 text-[#1e1b2e] shadow-xs hover:shadow-md"
      : "bg-white hover:bg-[#FFFDF9] border-stone-200 hover:border-amber-500/50 text-stone-900 shadow-sm hover:shadow-md"
    : isFestival
    ? "bg-[#480C14]/90 hover:bg-[#57101B] border-[#FF8A00]/30 hover:border-[#FF8A00]/60 text-[#FFF6E3] shadow-md"
    : isAmethyst
    ? "bg-[#180C2C]/90 hover:bg-[#23123F] border-[#52297A]/40 hover:border-[#8A4AC7]/60 text-[#EDE0F8] shadow-md"
    : isGoldenHour
    ? "bg-[#281B12]/90 hover:bg-[#38261A] border-[#C9822B]/35 hover:border-[#C9822B]/70 text-[#FFF4D8] shadow-md"
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
                isLightCanvas
                  ? isPrismPulse
                    ? "bg-[#936BFA]/10 text-[#6D28D9] border-[#936BFA]/30"
                    : "bg-amber-100/80 text-amber-900 border-amber-300/80"
                  : "bg-amber-500/10 text-amber-300 border-amber-500/20"
              }`}
            >
              {cleanAuthor}
            </span>
            {item.metadata.category && (
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] border ${
                  isLightCanvas
                    ? isPrismPulse
                      ? "bg-stone-100 text-stone-700 border-stone-200"
                      : "bg-stone-100 text-stone-700 border-stone-200"
                    : "bg-stone-800 text-stone-300 border-stone-700"
                }`}
              >
                {item.metadata.category}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={handleListen}
              title="Listen to verse recitation"
              aria-label="Listen to verse recitation"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isLightCanvas
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
                isLightCanvas
                  ? "text-stone-500 hover:text-amber-800 hover:bg-stone-100"
                  : "text-stone-400 hover:text-amber-300 hover:bg-stone-800"
              }`}
            >
              {isBookmarked ? (
                <BookmarkCheck
                  className={`w-4 h-4 ${
                    isLightCanvas
                      ? isPrismPulse
                        ? "text-[#936BFA] fill-[#936BFA]/20"
                        : "text-amber-700 fill-amber-700/20"
                      : "text-amber-400 fill-amber-400/20"
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
            isLightCanvas
              ? isPrismPulse
                ? "text-[#1e1b2e] group-hover:text-[#936BFA]"
                : "text-[#221509] group-hover:text-amber-800"
              : "text-amber-100 group-hover:text-amber-300"
          }`}
        >
          {item.title}
        </h3>
        {item.subtitle && (
          <p
            className={`text-xs mb-3 italic ${
              isLightCanvas
                ? isPrismPulse
                  ? "text-[#7C3AED]"
                  : "text-[#8C4A00]"
                : "text-amber-400/80"
            }`}
          >
            {item.subtitle}
          </p>
        )}

        {/* Sanskrit Devanagari Body */}
        <div
          className={`rounded-xl p-4 border mb-4 transition-colors ${
            isLightCanvas
              ? isPrismPulse
                ? "bg-[#F8FAFC] border-stone-200 group-hover:border-[#936BFA]/40"
                : "bg-[#FAF7F0] border-[#E8DCCB] group-hover:border-amber-300"
              : "bg-stone-950/60 border-stone-800/80 group-hover:border-stone-700/80"
          }`}
        >
          <div
            className={`font-sanskrit text-base sm:text-lg leading-relaxed whitespace-pre-line text-center select-text ${
              isLightCanvas
                ? isPrismPulse
                  ? "text-[#181326] font-bold"
                  : "text-[#1C0F05] font-semibold"
                : "text-amber-200/90"
            }`}
          >
            {item.body.split("\n").map((line, lIdx) => {
              const chunks = line.split(/(\s+|[।॥,]+)/);
              return (
                <div key={lIdx} className="flex flex-wrap items-center justify-center">
                  {chunks.map((chunk, cIdx) => {
                    const isWord = !/^[\s।॥,]+$/.test(chunk) && chunk.trim().length > 0;
                    if (!isWord) return <span key={cIdx}>{chunk}</span>;
                    return (
                      <button
                        key={cIdx}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          recitationEngine.play(item.id, item.body, 0.85);
                        }}
                        className="group inline-block px-1 py-0.5 mx-0.5 rounded cursor-pointer hover:bg-amber-400/20 hover:scale-[1.04] transition-all focus:outline-none focus:ring-1 focus:ring-amber-400"
                        title={`Click word to listen to verse recitation · "${chunk}"`}
                      >
                        {chunk}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Transliteration */}
        {item.transliteration && (
          <p
            className={`text-xs font-mono italic mb-3 leading-relaxed ${
              isLightCanvas
                ? isPrismPulse
                  ? "text-[#6B46C1] font-medium"
                  : "text-[#5C4533]"
                : "text-stone-300"
            }`}
          >
            {item.transliteration}
          </p>
        )}

        {/* English Meaning */}
        {item.meaning && (
          <p
            className={`text-sm leading-relaxed ${
              isLightCanvas
                ? isPrismPulse
                  ? "text-[#2D3748] font-normal"
                  : "text-[#2B1B10] font-normal"
                : "text-stone-200"
            }`}
          >
            {item.meaning}
          </p>
        )}
      </div>

      {/* Footer tags and read more */}
      <div
        className={`mt-5 pt-4 border-t flex items-center justify-between ${
          isLightCanvas ? "border-stone-200" : "border-stone-800/60"
        }`}
      >
        <div className="flex flex-wrap gap-1.5">
          {spiritualTags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-md ${
                isLightCanvas
                  ? isPrismPulse
                    ? "bg-[#936BFA]/10 text-[#6D28D9] border border-[#936BFA]/20"
                    : "bg-amber-100/70 text-amber-900 border border-amber-200"
                  : "bg-stone-800/80 text-amber-300/80 border border-white/5"
              }`}
            >
              #{tag}
            </span>
          ))}
        </div>

        <div
          className={`flex items-center space-x-1 text-xs font-semibold group-hover:translate-x-1 transition-transform ${
            isLightCanvas
              ? isPrismPulse
                ? "text-[#7C3AED]"
                : "text-amber-800"
              : "text-amber-400"
          }`}
        >
          <span>Explore</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};

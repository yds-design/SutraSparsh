import React from "react";
import { Bookmark, BookmarkCheck, Volume2, ArrowRight, Compass } from "lucide-react";
import type { ContentItem } from "../types";
import { recitationEngine } from "../utils/recitationEngine";

export interface VerseCardProps {
  item: ContentItem;
  isBookmarked: boolean;
  onToggleBookmark: (id: string, title?: string) => void;
  onSelect: (item: ContentItem) => void;
  onOpenJourney?: (item: ContentItem) => void;
  theme?: "sandstone" | "amethyst" | "light" | "festival" | "golden-hour" | "prism-pulse";
}

const VerseCardComponent: React.FC<VerseCardProps> = ({
  item,
  isBookmarked,
  onToggleBookmark,
  onSelect,
  onOpenJourney,
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
    item.metadata?.author && !["json", "production", "manual"].includes(item.metadata.author.toLowerCase())
      ? item.metadata.author
      : (item as any).source && !["json", "production", "manual"].includes(String((item as any).source).toLowerCase())
      ? (item as any).source
      : (item.title || "").includes("Gita")
      ? "Bhagavad Gita"
      : (item.title || "").includes("Yoga")
      ? "Patanjali"
      : (item.title || "").includes("Upanishad")
      ? "Upanishads"
      : "Scripture";

  // Sanitize tags: strictly authentic spiritual tags like Patanjali, Yoga, Gita
  const rawTags: string[] = Array.isArray(item.metadata?.tags)
    ? item.metadata!.tags
    : Array.isArray((item as any).tags)
    ? (item as any).tags
    : [];
  const displayTags: string[] = rawTags
    .filter(
      (t: string) =>
        !["json", "production", "manual", "publisher", "api", "database", "test"].includes(
          t.toLowerCase()
        )
    )
    .map((t: string) => t.charAt(0).toUpperCase() + t.slice(1));

  const spiritualTags: string[] =
    displayTags.length > 0
      ? displayTags
      : (item.title || "").includes("Gita")
      ? ["Gita", "Yoga", "Karma"]
      : (item.title || "").includes("Yoga")
      ? ["Patanjali", "Yoga", "Mind"]
      : ["Wisdom", "Sutra", "Vedanta"];

  const verseBodyText: string = (item.body as string) || (item.metadata?.devanagari as string) || ((item as any)?.sanskrit as string) || "";
  const verseLines: string[] = verseBodyText.split("\n");

  const cardBgClass = isLight
    ? "bg-white hover:bg-[#faf9fd] border-[#cfcbe0] hover:border-[#d9a441] text-[#1d1b2e] shadow-[0_1px_2px_rgb(27_23_64_/_0.06)] hover:shadow-[0_10px_30px_-12px_rgb(27_23_64_/_0.28)]"
    : isPrismPulse
    ? "bg-white hover:bg-slate-50/90 border-stone-200 hover:border-[#936BFA]/50 text-[#1e1b2e] shadow-xs hover:shadow-md"
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
      className={`group relative rounded-[20px] p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between border animate-verseCardIn transform hover:-translate-y-1 ${cardBgClass}`}
    >
      <div>
        {/* Top Header metadata */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                isLight
                  ? "bg-[#fbf0d6] text-[#b8801f] border-[#f0cf8a]/60"
                  : isPrismPulse
                  ? "bg-[#936BFA]/10 text-[#6D28D9] border-[#936BFA]/30"
                  : "bg-amber-500/10 text-amber-300 border-amber-500/20"
              }`}
            >
              {cleanAuthor}
            </span>
            {(item.metadata?.category || (item as any).category) && (
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] border ${
                  isLight
                    ? "bg-[#efedf6] text-[#55526b] border-[#cfcbe0]"
                    : isPrismPulse
                    ? "bg-stone-100 text-stone-700 border-stone-200"
                    : "bg-stone-800 text-stone-300 border-stone-700"
                }`}
              >
                {item.metadata?.category || (item as any).category}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={handleListen}
              title="Listen to verse recitation"
              aria-label="Listen to verse recitation"
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                isLight
                  ? "text-[#55526b] hover:text-[#1b1740] hover:bg-[#efedf6]"
                  : isLightCanvas
                  ? "text-stone-500 hover:text-amber-800 hover:bg-stone-100"
                  : "text-stone-400 hover:text-amber-300 hover:bg-stone-800"
              }`}
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(item.id, item.title);
              }}
              title={isBookmarked ? "Remove Bookmark" : "Bookmark Verse"}
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                isLight
                  ? "text-[#55526b] hover:text-[#1b1740] hover:bg-[#efedf6]"
                  : isLightCanvas
                  ? "text-stone-500 hover:text-amber-800 hover:bg-stone-100"
                  : "text-stone-400 hover:text-amber-300 hover:bg-stone-800"
              }`}
            >
              {isBookmarked ? (
                <BookmarkCheck
                  className={`w-4 h-4 ${
                    isLight
                      ? "text-[#b8801f] fill-[#d9a441]/30"
                      : isPrismPulse
                      ? "text-[#936BFA] fill-[#936BFA]/20"
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
            isLight
              ? "text-[#1b1740] group-hover:text-[#b8801f]"
              : isPrismPulse
              ? "text-[#1e1b2e] group-hover:text-[#936BFA]"
              : "text-amber-100 group-hover:text-amber-300"
          }`}
        >
          {item.title}
        </h3>
        {item.subtitle && (
          <p
            className={`text-xs mb-3 italic ${
              isLight
                ? "text-[#55526b] font-medium"
                : isPrismPulse
                ? "text-[#7C3AED]"
                : "text-amber-400/80"
            }`}
          >
            {item.subtitle}
          </p>
        )}

        {/* Sanskrit Devanagari Body (High-contrast gold on deep sacred container) */}
        <div
          className={`rounded-2xl p-4 border mb-4 transition-colors ${
            isLight
              ? "bg-[#efedf6]/70 border-[#cfcbe0] group-hover:border-[#d9a441]/60"
              : isPrismPulse
              ? "bg-[#F8FAFC] border-stone-200 group-hover:border-[#936BFA]/40"
              : "bg-stone-950/60 border-stone-800/80 group-hover:border-stone-700/80"
          }`}
        >
          <div
            className={`font-sanskrit text-base sm:text-lg leading-relaxed whitespace-pre-line text-center select-text ${
              isLight
                ? "text-[#1b1740] font-semibold"
                : isPrismPulse
                ? "text-[#181326] font-bold"
                : "text-amber-200/90"
            }`}
          >
            {verseLines.map((line: string, lIdx: number) => {
              const chunks: string[] = line.split(/(\s+|[।॥,]+)/);
              return (
                <div key={lIdx} className="flex flex-wrap items-center justify-center">
                  {chunks.map((chunk: string, cIdx: number) => {
                    const isWord = !/^[\s।॥,]+$/.test(chunk) && chunk.trim().length > 0;
                    if (!isWord) return <span key={cIdx}>{chunk}</span>;
                    return (
                      <button
                        key={cIdx}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          recitationEngine.play(item.id, verseBodyText, 0.85);
                        }}
                        className={`group inline-block px-1 py-0.5 mx-0.5 rounded cursor-pointer hover:scale-[1.04] transition-all focus:outline-none ${
                          isLight
                            ? "hover:bg-[#d9a441]/20 hover:text-[#b8801f] focus:ring-1 focus:ring-[#d9a441]"
                            : "hover:bg-amber-400/20 focus:ring-1 focus:ring-amber-400"
                        }`}
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
              isLight
                ? "text-[#55526b] font-medium"
                : isPrismPulse
                ? "text-[#6B46C1] font-medium"
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
              isLight
                ? "text-[#1d1b2e] font-serif-sacred font-normal"
                : isPrismPulse
                ? "text-[#2D3748] font-normal"
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
          isLight
            ? "border-[#cfcbe0] border-dashed"
            : isPrismPulse
            ? "border-stone-200"
            : "border-stone-800/60"
        }`}
      >
        <div className="flex flex-wrap gap-1.5">
          {spiritualTags.slice(0, 3).map((tag: string) => (
            <span
              key={tag}
              className={`text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full border ${
                isLight
                  ? "bg-[#efedf6] text-[#55526b] border-[#cfcbe0]"
                  : isPrismPulse
                  ? "bg-[#936BFA]/10 text-[#6D28D9] border-[#936BFA]/20"
                  : "bg-stone-800/80 text-amber-300/80 border-white/5"
              }`}
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Explore & My Journey Action Area */}
        <div className="flex items-center space-x-1.5 flex-shrink-0">
          {onOpenJourney && (
            <button
              type="button"
              id={`btn-verse-journey-${item.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onOpenJourney(item);
              }}
              title={`View ${item.title} in My Journey sanctuary`}
              aria-label={`View ${item.title} in My Journey`}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border flex items-center space-x-1 transition-all cursor-pointer hover:scale-105 shadow-2xs ${
                isLight
                  ? "bg-[#fbf0d6] hover:bg-[#f0cf8a] text-[#b8801f] border-[#f0cf8a]"
                  : "bg-stone-800 hover:bg-stone-700 text-amber-300 border-amber-500/30"
              }`}
            >
              <Compass className={`w-3 h-3 ${isLight ? "text-[#b8801f]" : "text-amber-500"} flex-shrink-0`} />
              <span>Journey</span>
            </button>
          )}

          <button
            type="button"
            id={`btn-explore-verse-${item.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(item);
            }}
            aria-label={`Explore and study ${item.title} in depth`}
            className={`flex items-center space-x-1 text-xs font-bold px-3 py-1 rounded-full transition-all cursor-pointer group-hover:translate-x-0.5 ${
              isLight
                ? "text-[#1b1740] hover:text-[#b8801f] hover:bg-[#efedf6]"
                : isPrismPulse
                ? "text-[#7C3AED] hover:bg-[#936BFA]/10"
                : "text-amber-300 hover:bg-amber-500/20"
            }`}
          >
            <span>Explore</span>
            <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const VerseCard = React.memo<VerseCardProps>(VerseCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item === nextProps.item &&
    prevProps.isBookmarked === nextProps.isBookmarked &&
    prevProps.theme === nextProps.theme &&
    prevProps.onToggleBookmark === nextProps.onToggleBookmark &&
    prevProps.onSelect === nextProps.onSelect
  );
});

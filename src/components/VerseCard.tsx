import React from "react";
import { Bookmark, BookmarkCheck, Volume2, Sparkles, ArrowRight } from "lucide-react";
import type { ContentItem } from "../types";
import { soundEngine } from "../utils/audio";

interface VerseCardProps {
  item: ContentItem;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onSelect: (item: ContentItem) => void;
}

export const VerseCard: React.FC<VerseCardProps> = ({
  item,
  isBookmarked,
  onToggleBookmark,
  onSelect,
}) => {
  const handleChime = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.playTempleBell(261.63); // Middle C harmonic chime
  };

  return (
    <div
      id={`verse-card-${item.id}`}
      onClick={() => onSelect(item)}
      className="group relative bg-stone-900/70 hover:bg-stone-900 border border-stone-800 hover:border-amber-500/40 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Top Header metadata */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
              {item.metadata.author || "Scripture"}
            </span>
            {item.metadata.category && (
              <span className="px-2 py-0.5 rounded-full text-[11px] bg-stone-800 text-stone-300 border border-stone-700">
                {item.metadata.category}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={handleChime}
              title="Chime Meditative Bell"
              className="p-1.5 rounded-lg text-stone-400 hover:text-amber-300 hover:bg-stone-800 transition-colors"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(item.id);
              }}
              title={isBookmarked ? "Remove Bookmark" : "Bookmark Verse"}
              className="p-1.5 rounded-lg text-stone-400 hover:text-amber-300 hover:bg-stone-800 transition-colors"
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-4 h-4 text-amber-400 fill-amber-400/20" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-serif-sacred text-lg font-bold text-amber-100 group-hover:text-amber-300 transition-colors mb-1">
          {item.title}
        </h3>
        {item.subtitle && (
          <p className="text-xs text-amber-400/80 mb-3 italic">
            {item.subtitle}
          </p>
        )}

        {/* Sanskrit Devanagari Body */}
        <div className="bg-stone-950/60 rounded-xl p-4 border border-stone-800/80 mb-4 group-hover:border-stone-700/80 transition-colors">
          <p className="font-sanskrit text-base sm:text-lg text-amber-200/90 leading-relaxed whitespace-pre-line text-center">
            {item.body}
          </p>
        </div>

        {/* Transliteration */}
        {item.transliteration && (
          <p className="text-xs text-stone-400 font-mono italic mb-3 line-clamp-2">
            {item.transliteration}
          </p>
        )}

        {/* English Meaning */}
        {item.meaning && (
          <p className="text-sm text-stone-300 leading-relaxed line-clamp-3">
            {item.meaning}
          </p>
        )}
      </div>

      {/* Footer tags and read more */}
      <div className="mt-5 pt-4 border-t border-stone-800/60 flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {item.metadata.tags?.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded bg-stone-800/80 text-stone-400"
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center space-x-1 text-xs font-semibold text-amber-400 group-hover:translate-x-1 transition-transform">
          <span>Explore</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};

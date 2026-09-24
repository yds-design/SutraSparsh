import React, { useState } from "react";
import {
  X,
  Search,
  BookOpen,
  Layers,
  Award,
  Sparkles,
  BookMarked,
  Volume2,
  Share2,
  Check,
  ChevronDown,
} from "lucide-react";
import type { SanskritWord, WordExplorerViewMode } from "../types/wordExplorer.types";
import { WordHeader } from "./WordHeader";
import { WordBreakdown } from "./WordBreakdown";
import { WordComponentView } from "./WordComponentView";
import { WordMeaning } from "./WordMeaning";
import { WordGrammar } from "./WordGrammar";
import { WordSandhi } from "./WordSandhi";
import { WordOccurrences } from "./WordOccurrences";
import { WordSources } from "./WordSources";
import { soundEngine } from "../../../utils/audio";
import { ModalPortal } from "../../../components/ModalPortal";

interface WordExplorerProps {
  isOpen: boolean;
  word: SanskritWord | null;
  selectedComponentId: string | null;
  activeTab: WordExplorerViewMode;
  isLoading: boolean;
  searchResults: SanskritWord[];
  onClose: () => void;
  onSelectComponent: (componentId: string | null) => void;
  onSelectWord: (word: SanskritWord | string) => void;
  onTabChange: (tab: WordExplorerViewMode) => void;
  onSearch: (query: string) => void;
}

export const WordExplorer: React.FC<WordExplorerProps> = ({
  isOpen,
  word,
  selectedComponentId,
  activeTab,
  isLoading,
  searchResults,
  onClose,
  onSelectComponent,
  onSelectWord,
  onTabChange,
  onSearch,
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  if (!isOpen) return null;

  const activeComponent = word?.components?.find(
    (c) => c.id === selectedComponentId
  ) || word?.components?.[0];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchInput);
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/80 backdrop-blur-md transition-opacity">
        {/* ── Main Container: Responsive Mobile Bottom-Sheet & Tablet/Desktop Elevated Panel ── */}
        <div
          id="word-explorer-drawer"
          role="dialog"
          aria-label="SutraSparsh Word Explorer"
          className="relative w-full sm:max-w-3xl lg:max-w-4xl max-h-[92vh] sm:max-h-[85vh] bg-stone-900 border-t sm:border border-amber-900/40 dark:border-stone-800 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slideUp sm:animate-fadeIn"
        >
        {/* Mobile Swipe / Drag Handle */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1 cursor-grab">
          <div className="w-12 h-1.5 rounded-full bg-stone-700/80" />
        </div>

        {/* ── Top App Bar ── */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center space-x-2.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-300">
                SutraSparsh Word Explorer
              </span>
              <span className="hidden sm:inline text-[11px] text-stone-400 ml-2 font-sanskrit">
                पद-ज्ञान कोष्ठ
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={`p-2 rounded-xl text-xs flex items-center space-x-1.5 transition-colors ${
                searchOpen
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "bg-stone-800/80 hover:bg-stone-700 text-stone-300"
              }`}
              title="Search verified Sanskrit words"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Search Lexicon</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
              title="Close Word Explorer (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Tray (collapsible) */}
        {searchOpen && (
          <div className="p-4 bg-stone-950/90 border-b border-stone-800 space-y-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  onSearch(e.target.value);
                }}
                placeholder="Search Sanskrit word, root (e.g. कृ, योग), or meaning..."
                className="w-full bg-stone-900 border border-amber-500/30 rounded-xl px-4 py-2.5 pl-10 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                autoFocus
              />
              <Search className="w-4 h-4 text-amber-400/80 absolute left-3.5 top-3.5" />
            </form>

            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto">
              {searchResults.map((res) => (
                <button
                  key={res.id}
                  onClick={() => {
                    onSelectWord(res);
                    setSearchOpen(false);
                  }}
                  className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-stone-900 border border-stone-800 hover:border-amber-400/50 text-xs transition-colors"
                >
                  <span className="font-sanskrit font-bold text-amber-200">
                    {res.surfaceForm}
                  </span>
                  <span className="italic text-stone-400">({res.transliteration})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Sub-navigation Tabs ── */}
        {word && (
          <div className="flex border-b border-stone-800 px-4 sm:px-6 bg-stone-950/40 overflow-x-auto no-scrollbar">
            <button
              onClick={() => onTabChange("overview")}
              className={`py-3 px-3 sm:px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
                activeTab === "overview"
                  ? "border-amber-400 text-amber-300"
                  : "border-transparent text-stone-400 hover:text-stone-200"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Overview & Meaning</span>
            </button>

            {word.components && word.components.length > 0 && (
              <button
                onClick={() => onTabChange("components")}
                className={`py-3 px-3 sm:px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
                  activeTab === "components"
                    ? "border-amber-400 text-amber-300"
                    : "border-transparent text-stone-400 hover:text-stone-200"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Components ({word.components.length})</span>
              </button>
            )}

            <button
              onClick={() => onTabChange("grammar")}
              className={`py-3 px-3 sm:px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
                activeTab === "grammar"
                  ? "border-amber-400 text-amber-300"
                  : "border-transparent text-stone-400 hover:text-stone-200"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Grammar & Dhātu</span>
            </button>

            {word.sandhi?.isSandhi && (
              <button
                onClick={() => onTabChange("sandhi")}
                className={`py-3 px-3 sm:px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
                  activeTab === "sandhi"
                    ? "border-amber-400 text-amber-300"
                    : "border-transparent text-stone-400 hover:text-stone-200"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sandhi Rules</span>
              </button>
            )}

            {word.occurrences && word.occurrences.length > 0 && (
              <button
                onClick={() => onTabChange("occurrences")}
                className={`py-3 px-3 sm:px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
                  activeTab === "occurrences"
                    ? "border-amber-400 text-amber-300"
                    : "border-transparent text-stone-400 hover:text-stone-200"
                }`}
              >
                <BookMarked className="w-3.5 h-3.5" />
                <span>Corpus Occurrences</span>
              </button>
            )}
          </div>
        )}

        {/* ── Scrollable Body Content ── */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {isLoading ? (
            <div className="py-16 text-center text-stone-400 space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin mx-auto" />
              <p className="text-xs font-medium">Illuminating Sanskrit linguistic layers...</p>
            </div>
          ) : !word ? (
            <div className="py-16 text-center text-stone-400 space-y-2">
              <BookOpen className="w-10 h-10 text-amber-500/40 mx-auto" />
              <p className="text-sm font-semibold text-stone-200">No Sanskrit word selected</p>
              <p className="text-xs text-stone-500">
                Tap any Sanskrit word in any verse, or search the verified lexicon above.
              </p>
            </div>
          ) : (
            <>
              {/* Word Header */}
              <WordHeader word={word} />

              {/* Tab 1: Overview & Meaning */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Decomposition Strip */}
                  {word.components && word.components.length > 0 && (
                    <WordBreakdown
                      components={word.components}
                      selectedComponentId={selectedComponentId}
                      onSelectComponent={onSelectComponent}
                      fullWordSurface={word.surfaceForm}
                    />
                  )}

                  {/* Active Component Card if selected */}
                  {activeComponent && word.components && word.components.length > 1 && (
                    <WordComponentView component={activeComponent} />
                  )}

                  {/* General & Contextual Meaning */}
                  <WordMeaning word={word} />

                  {/* Sources Transparency */}
                  <WordSources
                    sources={word.sources}
                    isVerified={word.isVerified}
                    unavailableReason={word.unavailableReason}
                  />
                </div>
              )}

              {/* Tab 2: Components Deep Dive */}
              {activeTab === "components" && word.components && (
                <div className="space-y-6">
                  <WordBreakdown
                    components={word.components}
                    selectedComponentId={selectedComponentId}
                    onSelectComponent={onSelectComponent}
                    fullWordSurface={word.surfaceForm}
                  />

                  {activeComponent ? (
                    <WordComponentView component={activeComponent} />
                  ) : (
                    <p className="text-xs text-stone-400 italic">
                      Select any constituent above to view its root and grammatical function.
                    </p>
                  )}
                </div>
              )}

              {/* Tab 3: Grammar & Dhatu */}
              {activeTab === "grammar" && (
                <div className="space-y-6">
                  <WordGrammar grammar={word.grammar} root={word.root} />
                </div>
              )}

              {/* Tab 4: Sandhi Synthesis */}
              {activeTab === "sandhi" && (
                <div className="space-y-6">
                  <WordSandhi sandhi={word.sandhi} surfaceForm={word.surfaceForm} />
                </div>
              )}

              {/* Tab 5: Corpus Occurrences */}
              {activeTab === "occurrences" && (
                <div className="space-y-6">
                  <WordOccurrences
                    occurrences={word.occurrences}
                    wordSurface={word.surfaceForm}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-5 py-3 border-t border-stone-800/80 bg-stone-950/70 flex flex-wrap items-center justify-between text-[11px] text-stone-400 gap-2">
          <span>SutraSparsh Lexicon • Paninian Morphological Analysis</span>
          <span className="italic font-serif text-amber-300/80">
            "Don't just read the translation. Explore the word."
          </span>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
};

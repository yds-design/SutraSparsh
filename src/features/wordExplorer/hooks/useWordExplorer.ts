import { useState, useCallback } from "react";
import type {
  SanskritWord,
  WordExplorerViewMode,
} from "../types/wordExplorer.types";
import { WordExplorerService } from "../services/wordExplorer.service";
import type { VerseContext } from "../services/paninianEngine";

export interface UseWordExplorerReturn {
  isOpen: boolean;
  selectedWord: SanskritWord | null;
  currentWord: SanskritWord | null;
  selectedComponentId: string | null;
  activeTab: WordExplorerViewMode;
  isLoading: boolean;
  searchQuery: string;
  searchResults: SanskritWord[];
  openWord: (wordOrSurface: string | SanskritWord, contextVerse?: VerseContext | null) => Promise<void>;
  selectWord: (wordOrSurface: string | SanskritWord, contextVerse?: VerseContext | null) => Promise<void>;
  close: () => void;
  closeWord: () => void;
  selectComponent: (componentId: string | null) => void;
  setActiveTab: (tab: WordExplorerViewMode) => void;
  setSearchQuery: (query: string) => void;
  search: (query: string) => Promise<void>;
}

export function useWordExplorer(): UseWordExplorerReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedWord, setSelectedWord] = useState<SanskritWord | null>(null);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<WordExplorerViewMode>("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SanskritWord[]>(
    WordExplorerService.getAllCuratedWords()
  );

  const openWord = useCallback(async (wordOrSurface: string | SanskritWord, contextVerse?: VerseContext | null) => {
    setIsLoading(true);
    setIsOpen(true);

    try {
      let resolvedWord: SanskritWord | null = null;
      if (typeof wordOrSurface === "string") {
        resolvedWord = await WordExplorerService.getWordBySurface(wordOrSurface, contextVerse);
        setSelectedWord(resolvedWord);
        setSelectedComponentId(resolvedWord?.components?.[0]?.id || null);
      } else {
        resolvedWord = wordOrSurface;
        setSelectedWord(wordOrSurface);
        setSelectedComponentId(wordOrSurface.components?.[0]?.id || null);
      }

      // Track 'word_selected' event (FR-12 Analytics Tracking)
      WordExplorerService.trackEvent("word_selected", {
        wordId: resolvedWord?.id || "unknown",
        surfaceForm: resolvedWord?.surfaceForm || (typeof wordOrSurface === "string" ? wordOrSurface : ""),
        isVerified: resolvedWord?.isVerified ?? false,
      });

      setActiveTab("overview");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setSelectedComponentId(null);
  }, []);

  const selectComponent = useCallback((componentId: string | null) => {
    setSelectedComponentId(componentId);
    if (componentId) {
      WordExplorerService.trackEvent("word_component_selected", {
        componentId,
      });
    }
  }, []);

  const search = useCallback(async (query: string) => {
    setSearchQuery(query);
    const results = await WordExplorerService.searchWords(query);
    setSearchResults(results);
  }, []);

  return {
    isOpen,
    selectedWord,
    currentWord: selectedWord,
    selectedComponentId,
    activeTab,
    isLoading,
    searchQuery,
    searchResults,
    openWord,
    selectWord: openWord,
    close,
    closeWord: close,
    selectComponent,
    setActiveTab,
    setSearchQuery,
    search,
  };
}

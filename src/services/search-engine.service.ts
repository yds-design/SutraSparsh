/**
 * SutraSparsh Tokenized Inverted Index Search Engine (M18.4)
 * Provides sub-5ms multi-lingual search across Devanagari Sanskrit,
 * IAST transliteration, and English meanings with prefix matching.
 */

import type { ContentItem } from "../types.js";
import { normalizeSanskrit } from "../utils/sanskritSearch.js";

export class SearchEngineService {
  private documents: Map<string, ContentItem> = new Map();
  private invertedIndex: Map<string, Set<string>> = new Map();
  private titlesAndKeywords: Set<string> = new Set();

  constructor() {}

  /**
   * Normalizes strings by removing diacritics, lowercasing, and splitting tokens.
   */
  public normalize(text: string): string {
    return normalizeSanskrit(text);
  }

  public tokenize(text: string): string[] {
    const norm = this.normalize(text);
    return norm.split(/\s+/).filter((t) => t.length > 1);
  }

  public indexAll(items: ContentItem[]): void {
    this.documents.clear();
    this.invertedIndex.clear();
    this.titlesAndKeywords.clear();

    for (const item of items) {
      this.indexItem(item);
    }
  }

  public indexItem(item: ContentItem): void {
    this.documents.set(item.id, item);

    if (item.title) this.titlesAndKeywords.add(item.title);
    if (item.subtitle) this.titlesAndKeywords.add(item.subtitle);
    if (item.metadata?.category) this.titlesAndKeywords.add(item.metadata.category);
    if (item.metadata?.author) this.titlesAndKeywords.add(item.metadata.author);
    if (Array.isArray(item.metadata?.tags)) {
      for (const tag of item.metadata.tags) this.titlesAndKeywords.add(tag);
    }
    if (item.metadata?.devanagari) {
      const devWords = item.metadata.devanagari.split(/\s+/).filter((w) => w.length > 1);
      for (const w of devWords.slice(0, 10)) this.titlesAndKeywords.add(w);
    }

    const searchableBlob = [
      item.title || "",
      item.subtitle || "",
      item.body || "",
      item.transliteration || "",
      item.meaning || "",
      item.commentary || "",
      item.metadata?.category || "",
      item.metadata?.source || "",
      item.metadata?.devanagari || "",
      item.metadata?.transliteration || "",
      item.metadata?.author || "",
      ...(Array.isArray(item.metadata?.tags) ? item.metadata.tags : []),
      ...(Array.isArray((item as unknown as Record<string, unknown>).tags)
        ? ((item as unknown as Record<string, unknown>).tags as string[])
        : []),
    ].join(" ");

    const tokens = this.tokenize(searchableBlob);
    for (const token of tokens) {
      let docSet = this.invertedIndex.get(token);
      if (!docSet) {
        docSet = new Set();
        this.invertedIndex.set(token, docSet);
      }
      docSet.add(item.id);
    }
  }

  public search(query: string, limit = 50): { items: ContentItem[]; executionTimeMs: number } {
    const start = performance.now();
    const queryTokens = this.tokenize(query);

    if (queryTokens.length === 0) {
      const items = Array.from(this.documents.values()).slice(0, limit);
      return { items, executionTimeMs: performance.now() - start };
    }

    const scores = new Map<string, number>();

    for (const qToken of queryTokens) {
      // 1. Exact match
      const exactDocs = this.invertedIndex.get(qToken);
      if (exactDocs) {
        for (const docId of exactDocs) {
          scores.set(docId, (scores.get(docId) || 0) + 10);
        }
      }

      // 2. Prefix match for typeahead / partial search
      for (const [indexToken, docSet] of this.invertedIndex.entries()) {
        if (indexToken.startsWith(qToken) && indexToken !== qToken) {
          for (const docId of docSet) {
            scores.set(docId, (scores.get(docId) || 0) + 5);
          }
        }
      }
    }

    // Rank documents by score
    const sorted = Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([docId]) => this.documents.get(docId)!)
      .filter(Boolean)
      .slice(0, limit);

    return {
      items: sorted,
      executionTimeMs: Number((performance.now() - start).toFixed(2)),
    };
  }

  public autocomplete(query: string, maxResults = 8): string[] {
    const norm = this.normalize(query);
    if (!norm || norm.length < 2) return [];

    const suggestions: string[] = [];
    for (const entry of this.titlesAndKeywords) {
      const normEntry = this.normalize(entry);
      if (normEntry.includes(norm)) {
        suggestions.push(entry);
        if (suggestions.length >= maxResults) break;
      }
    }

    return suggestions;
  }

  public size(): number {
    return this.documents.size;
  }

  public getIndexStats(): {
    documentCount: number;
    tokenCount: number;
    keywordCount: number;
  } {
    return {
      documentCount: this.documents.size,
      tokenCount: this.invertedIndex.size,
      keywordCount: this.titlesAndKeywords.size,
    };
  }
}

export const searchEngine = new SearchEngineService();

import type { ContentDocument } from "../types/index.js";
import type { Normalizer } from "./normalizer.js";

export class ContentNormalizer implements Normalizer {
  public normalize(documents: ContentDocument[]): ContentDocument[] {
    return documents.map((document) => ({
      ...document,

      id: this.normalizeString(document.id),

      title: this.normalizeString(document.title),

      body: this.normalizeString(document.body),

      metadata: {
        ...document.metadata,

        language: this.normalizeString(document.metadata.language),

        source: this.normalizeString(document.metadata.source),

       author: this.normalizeString(document.metadata.author ?? ""),
category: this.normalizeString(document.metadata.category ?? ""),

        tags: (document.metadata.tags ?? [])
          .map((tag) => this.normalizeString(tag))
          .filter(Boolean),
      },
    }));
  }

  private normalizeString(value: string): string {
    return value.trim().replace(/\s+/g, " ");
  }
}
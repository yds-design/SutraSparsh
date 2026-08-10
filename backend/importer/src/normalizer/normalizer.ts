import type { ContentDocument } from "../types/index.js";

export interface Normalizer {
  normalize(documents: ContentDocument[]): ContentDocument[];
}
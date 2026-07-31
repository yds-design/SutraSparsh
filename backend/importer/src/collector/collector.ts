import type { ContentDocument } from "../types/index.js";

export interface Collector {
  collect(): Promise<ContentDocument[]>;
}
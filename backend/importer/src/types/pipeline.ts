import type { ContentDocument } from "./content.js";

export interface PipelineContext {
  jobId: string;
  source: string;
  documents: ContentDocument[];
}
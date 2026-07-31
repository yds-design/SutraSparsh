export interface ContentMetadata {
  language: string;
  source: string;
  author?: string;
  category?: string;
  tags?: string[];
}

export interface ContentDocument {
  id: string;
  title: string;
  body: string;
  metadata: ContentMetadata;
}
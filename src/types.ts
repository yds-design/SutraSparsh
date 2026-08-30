export interface ContentMetadata {
  language: string;
  source: string;
  author?: string;
  category?: string;
  chapter?: number;
  verse?: number;
  tags?: string[];
}

export interface ContentItem {
  id: string;
  title: string;
  subtitle?: string;
  body: string;
  transliteration?: string;
  meaning?: string;
  commentary?: string;
  audioUrl?: string;
  metadata: ContentMetadata;
}

export interface ContentResponse {
  success: boolean;
  data: ContentItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface ImportJob {
  jobId: string;
  source: string;
  status: "running" | "completed" | "failed";
  startedAt: string;
  completedAt?: string;
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
  error?: string;
}

export interface ImportStats {
  total: number;
  completed: number;
  failed: number;
}

export interface JournalEntry {
  id: string;
  verseId: string;
  verseTitle: string;
  note: string;
  createdAt: string;
}

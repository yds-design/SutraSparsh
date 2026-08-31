/**
 * Phase 26 — Continue Where I Left Off (Progress & Resume Subsystem)
 * Milestones M53 to M74
 */

export type ProgressStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export type ContentProgressType = "scripture" | "chapter" | "verse" | "audio" | "guided_path";

export interface ReadingPosition {
  type: "verse" | "section" | "scroll";
  verseId: string;
  verseIndex?: number;
  chapterId?: string;
  sectionIndex?: number;
  scrollOffset?: number;
}

export interface AudioPosition {
  contentId: string;
  audioUrl?: string;
  timestampSeconds: number;
  durationSeconds: number;
  playbackRate?: number;
}

export interface ReadingProgress {
  userId?: string; // empty for anonymous users
  contentId: string;
  contentType: ContentProgressType;
  scriptureId: string;
  scriptureTitle: string;
  chapterId?: string;
  chapterTitle?: string;
  verseId: string;
  verseTitle: string;
  sanskritSnippet: string;
  meaningSnippet?: string;
  position: ReadingPosition;
  audioPosition?: AudioPosition;
  progressPercent: number; // 0 to 100
  status: ProgressStatus;
  firstReadAt: string;
  lastReadAt: string;
  completedAt?: string;
  totalTimeSpentSeconds: number;
  deviceId?: string;
  version: number;
}

export interface ProgressSyncPayload {
  anonymousDeviceId: string;
  items: ReadingProgress[];
  lastSyncTimestamp: string;
}

export interface ProgressAnalyticsSummary {
  activeReaders: number;
  resumeCardViews: number;
  resumeClicks: number;
  resumeSuccessRate: number;
  averageProgressPercent: number;
  completionRate: number;
  syncFailures: number;
}

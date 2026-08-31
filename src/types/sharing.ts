/**
 * Phase 25 — Shloka Sharing & Social Distribution Type Definitions
 * Milestones M37 to M52
 */

export type ShareChannel =
  | "whatsapp"
  | "telegram"
  | "x"
  | "facebook"
  | "email"
  | "native"
  | "copy_link"
  | "card_download";

export type ShareCardTemplate =
  | "minimal"
  | "traditional_gold"
  | "meditation_indigo"
  | "sunrise_saffron"
  | "vedic_parchment";

export type ShareCardDimension = "square" | "story" | "landscape";

export interface ShareCardDimensionConfig {
  id: ShareCardDimension;
  label: string;
  subLabel: string;
  width: number;
  height: number;
  aspectRatio: string;
}

export interface ShareableContent {
  id: string;
  title: string;
  subtitle?: string;
  sanskritText: string;
  transliteration?: string;
  meaning?: string;
  commentaryExcerpt?: string;
  source: string;
  category?: string;
  tags?: string[];
  canonicalUrl?: string;
}

export interface ShareEvent {
  id: string;
  contentId: string;
  contentTitle: string;
  channel: ShareChannel;
  timestamp: string;
  refCode: string;
  cardTemplate?: ShareCardTemplate;
  cardDimension?: ShareCardDimension;
  recipientLanded?: boolean;
  userAgent?: string;
}

export interface ShareAnalyticsSummary {
  totalShares: number;
  totalRecipientClicks: number;
  viralCoefficient: number;
  topSharedVerses: Array<{
    contentId: string;
    title: string;
    source: string;
    shareCount: number;
    clickCount: number;
  }>;
  channelBreakdown: Record<ShareChannel, number>;
  sharesByDay: Array<{
    date: string;
    shares: number;
    clicks: number;
  }>;
}

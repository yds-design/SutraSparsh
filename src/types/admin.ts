/**
 * SutraSparsh Admin Architecture & RBAC Type Definitions
 * Phase 22 — Milestones M38 to M46
 */

export type AdminRole =
  | "SUPER_ADMIN"
  | "CONTENT_ADMIN"
  | "IMPORT_ADMIN"
  | "OPERATIONS_ADMIN"
  | "MONETIZATION_ADMIN"
  | "SUPPORT_ADMIN";

export type AdminDomain =
  | "dashboard"
  | "content"
  | "imports"
  | "users"
  | "monetization"
  | "operations"
  | "settings";

export type AdminAction = "view" | "create" | "edit" | "delete" | "publish" | "execute" | "export";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  avatarUrl?: string;
  assignedTraditions?: string[];
  mfaEnabled: boolean;
  lastLoginAt: string;
}

export interface AdminAuditEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: AdminRole;
  domain: AdminDomain;
  action: string;
  resourceId?: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  status: "SUCCESS" | "DENIED" | "FAILED";
}

export interface SystemHealthCard {
  subsystem: "API Gateway" | "Firestore Corpus" | "Importer Pipeline" | "Search Engine" | "Billing & Webhooks" | "Storage & CDN";
  status: "HEALTHY" | "DEGRADED" | "DOWN";
  latencyMs: number;
  uptimePct: number;
  lastCheck: string;
  message?: string;
}

export interface ContentStatsSummary {
  totalVerses: number;
  publishedVerses: number;
  draftVerses: number;
  totalCategories: number;
  totalTraditions: number;
  totalCommentaries: number;
  totalChantAudios: number;
}

export interface UserManagementRecord {
  id: string;
  displayName: string;
  email: string;
  tier: "FREE" | "SADHAKA" | "RISHI";
  subscriptionStatus: "ACTIVE" | "TRIALING" | "PAST_DUE" | "CANCELED" | "NONE";
  joinedDate: string;
  lastActive: string;
  totalChantsCompleted: number;
  isScholarship: boolean;
  notes?: string;
}

export interface PlatformFeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  environment: "ALL" | "PRODUCTION" | "STAGING" | "DEVELOPMENT";
  targetTiers: ("FREE" | "SADHAKA" | "RISHI")[];
}

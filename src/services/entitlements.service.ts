/**
 * Phase 18 — Entitlements & Premium Access Architecture (M28)
 * Provides robust backend authorization, TTL caching, admin overrides, and multi-device sync.
 */

import type {
  EntitlementKey,
  UserEntitlementsRecord,
  SubscriptionStatus,
  SubscriptionPlanId,
} from "../types/monetization.js";
import { SUBSCRIPTION_PLANS } from "../config/monetization.config.js";
import { billingService } from "./billing.service.js";

class EntitlementsCache {
  private cache: Map<string, UserEntitlementsRecord> = new Map();

  public get(userId: string): UserEntitlementsRecord | null {
    const record = this.cache.get(userId);
    if (!record) return null;

    const cachedTime = new Date(record.cachedAt).getTime();
    const now = Date.now();
    if (now - cachedTime > record.cacheTtlSeconds * 1000) {
      this.cache.delete(userId);
      return null;
    }
    return record;
  }

  public set(userId: string, record: UserEntitlementsRecord): void {
    this.cache.set(userId, record);
  }

  public invalidate(userId: string): void {
    this.cache.delete(userId);
  }

  public clear(): void {
    this.cache.clear();
  }
}

export class EntitlementsService {
  private cache = new EntitlementsCache();
  private adminOverrides: Map<string, UserEntitlementsRecord["adminOverride"]> = new Map();

  /**
   * M28.1 / M28.2: Compute effective entitlements for a user
   */
  public async getUserEntitlements(userId: string): Promise<UserEntitlementsRecord> {
    // 1. Check cache first
    const cached = this.cache.get(userId);
    if (cached) return cached;

    // 2. Check Admin Overrides (Comp accounts / extensions) (M28.7)
    const adminOverride = this.adminOverrides.get(userId);
    if (adminOverride?.isOverridden) {
      const isExpired = adminOverride.expiresAt && new Date(adminOverride.expiresAt).getTime() < Date.now();
      if (!isExpired) {
        const record: UserEntitlementsRecord = {
          userId,
          planId: "ashram_patron",
          status: "ACTIVE",
          expiresAt: adminOverride.expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          activeEntitlements: SUBSCRIPTION_PLANS.ashram_patron.entitlements,
          cachedAt: new Date().toISOString(),
          cacheTtlSeconds: 300,
          adminOverride,
        };
        this.cache.set(userId, record);
        return record;
      }
    }

    // 3. Look up active subscription in billing service
    const subscription = billingService.getUserSubscription(userId);
    let planId: SubscriptionPlanId = "free";
    let status: SubscriptionStatus = "EXPIRED";
    let expiresAt = new Date().toISOString();
    let activeEntitlements: EntitlementKey[] = [];

    if (subscription) {
      const now = Date.now();
      const periodEnd = new Date(subscription.currentPeriodEndsAt).getTime();
      const graceEnd = subscription.gracePeriodEndsAt ? new Date(subscription.gracePeriodEndsAt).getTime() : periodEnd;

      if (subscription.status === "ACTIVE" || subscription.status === "TRIAL") {
        if (now <= periodEnd) {
          planId = subscription.planId;
          status = subscription.status;
          expiresAt = subscription.currentPeriodEndsAt;
          activeEntitlements = SUBSCRIPTION_PLANS[planId]?.entitlements || [];
        } else {
          status = "EXPIRED";
        }
      } else if (subscription.status === "GRACE_PERIOD") {
        if (now <= graceEnd) {
          planId = subscription.planId;
          status = "GRACE_PERIOD";
          expiresAt = subscription.gracePeriodEndsAt || subscription.currentPeriodEndsAt;
          activeEntitlements = SUBSCRIPTION_PLANS[planId]?.entitlements || [];
        } else {
          status = "EXPIRED";
        }
      }
    }

    const record: UserEntitlementsRecord = {
      userId,
      planId,
      status,
      expiresAt,
      activeEntitlements,
      cachedAt: new Date().toISOString(),
      cacheTtlSeconds: 300,
      adminOverride: undefined,
    };

    this.cache.set(userId, record);
    return record;
  }

  /**
   * M28.3: Backend Authorization: Check if user holds a specific entitlement
   */
  public async hasEntitlement(userId: string, key: EntitlementKey): Promise<boolean> {
    const entitlements = await this.getUserEntitlements(userId);
    return entitlements.activeEntitlements.includes(key);
  }

  /**
   * M28.5: Server-side Enforcement for Protected Resources
   */
  public async checkFeatureAccess(
    userId: string,
    feature: "advancedSearch" | "exclusiveCommentaries" | "premiumAudio" | "offlineAccess" | "wisdomJournalSync"
  ): Promise<{ granted: boolean; reason?: string; requiredPlan?: SubscriptionPlanId }> {
    const record = await this.getUserEntitlements(userId);
    const hasAccess = record.activeEntitlements.includes(feature);

    if (hasAccess) {
      return { granted: true };
    }

    return {
      granted: false,
      reason: `Feature '${feature}' requires an active Sādhaka or Rishi membership.`,
      requiredPlan: feature === "offlineAccess" ? "rishi_annual" : "sadhaka_monthly",
    };
  }

  /**
   * M28.7: Admin Entitlement Controls (Grant, Comp, Revoke)
   */
  public grantAdminOverride(
    userId: string,
    grantedBy: string,
    reason: string,
    durationDays = 365
  ): UserEntitlementsRecord {
    const override = {
      isOverridden: true,
      grantedBy,
      grantedAt: new Date().toISOString(),
      reason,
      expiresAt: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString(),
    };
    this.adminOverrides.set(userId, override);
    this.cache.invalidate(userId);

    return {
      userId,
      planId: "ashram_patron",
      status: "ACTIVE",
      expiresAt: override.expiresAt,
      activeEntitlements: SUBSCRIPTION_PLANS.ashram_patron.entitlements,
      cachedAt: new Date().toISOString(),
      cacheTtlSeconds: 300,
      adminOverride: override,
    };
  }

  public revokeAdminOverride(userId: string): void {
    this.adminOverrides.delete(userId);
    this.cache.invalidate(userId);
  }

  /**
   * M28.6: Invalidate cache for multi-device sync
   */
  public invalidateUserCache(userId: string): void {
    this.cache.invalidate(userId);
  }
}

export const entitlementsService = new EntitlementsService();

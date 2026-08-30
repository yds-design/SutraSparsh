/**
 * SutraSparsh Monetization Architecture & Domain Types (Phases 16-21)
 */

export type SubscriptionPlanId = "free" | "sadhaka_monthly" | "rishi_annual" | "ashram_patron" | "institutional";

export type SubscriptionStatus =
  | "TRIAL"
  | "ACTIVE"
  | "RENEWING"
  | "PAST_DUE"
  | "GRACE_PERIOD"
  | "CANCELLED"
  | "EXPIRED"
  | "REFUNDED";

export type EntitlementKey =
  | "premium"
  | "advancedSearch"
  | "unlimitedBookmarks"
  | "premiumAudio"
  | "exclusiveCommentaries"
  | "offlineAccess"
  | "wisdomJournalSync"
  | "expertQnA"
  | "commercialUse";

export interface PlanPricing {
  currency: "INR" | "USD" | "EUR" | "GBP";
  amount: number;
  interval: "month" | "year" | "lifetime";
  displayPrice: string;
  savingsPercentage?: number;
  introductoryPrice?: {
    amount: number;
    durationDays: number;
    displayPrice: string;
  };
}

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  name: { en: string; hi: string };
  badge?: { en: string; hi: string };
  description: { en: string; hi: string };
  pricing: Record<"INR" | "USD", PlanPricing>;
  trialDays: number;
  gracePeriodDays: number;
  entitlements: EntitlementKey[];
  features: Array<{ en: string; hi: string; included: boolean; highlight?: boolean }>;
  popular?: boolean;
}

export interface UserSubscription {
  id: string;
  userId: string;
  userEmail?: string;
  planId: SubscriptionPlanId;
  status: SubscriptionStatus;
  provider: "razorpay" | "stripe" | "manual_admin" | "apple_iap" | "google_play";
  providerSubscriptionId?: string;
  providerCustomerId?: string;
  currency: string;
  amount: number;
  trialStartedAt?: string;
  trialEndsAt?: string;
  currentPeriodStartsAt: string;
  currentPeriodEndsAt: string;
  gracePeriodEndsAt?: string;
  cancelAtPeriodEnd: boolean;
  cancelledAt?: string;
  cancellationReason?: string;
  pausedAt?: string;
  resumedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserEntitlementsRecord {
  userId: string;
  planId: SubscriptionPlanId;
  status: SubscriptionStatus;
  expiresAt: string;
  activeEntitlements: EntitlementKey[];
  cachedAt: string;
  cacheTtlSeconds: number;
  adminOverride?: {
    isOverridden: boolean;
    grantedBy: string;
    grantedAt: string;
    reason: string;
    expiresAt?: string;
  };
}

export interface BillingTransaction {
  id: string;
  userId: string;
  subscriptionId?: string;
  provider: "razorpay" | "stripe" | "manual";
  providerPaymentId: string;
  providerOrderId?: string;
  type: "SUBSCRIPTION_CHARGE" | "RENEWAL" | "ONE_TIME_DONATION" | "REFUND" | "TRIAL_HOLD";
  amount: number;
  currency: string;
  status: "SUCCESS" | "PENDING" | "FAILED" | "REFUNDED" | "DISPUTED";
  paymentMethod: "UPI" | "CARD" | "NETBANKING" | "WALLET" | "INTERNATIONAL_CARD";
  invoiceNumber: string;
  invoiceUrl?: string;
  receiptNumber: string;
  taxAmount: number;
  taxRatePercent: number;
  failureReason?: string;
  refundedAmount?: number;
  refundedAt?: string;
  createdAt: string;
}

export interface WebhookEventRecord {
  id: string;
  provider: "razorpay" | "stripe";
  eventId: string;
  eventType: string;
  payload: Record<string, unknown>;
  signature: string;
  signatureVerified: boolean;
  status: "RECEIVED" | "PROCESSING" | "PROCESSED" | "FAILED" | "DUPLICATE";
  idempotencyKey: string;
  attempts: number;
  errorMessage?: string;
  receivedAt: string;
  processedAt?: string;
}

export interface DonationRecord {
  id: string;
  userId?: string;
  donorName: string;
  donorEmail: string;
  donorPan?: string; // For 80G Indian Tax Exemption
  amount: number;
  currency: "INR" | "USD";
  category: "TEMPLE_PRESERVATION" | "VEDIC_SCHOLARS" | "OPEN_ACCESS_SERIES" | "GENERAL_GURUDAKSHINA";
  isAnonymous: boolean;
  paymentMethod: string;
  providerPaymentId: string;
  receiptNumber: string;
  taxExemptionEligible: boolean;
  status: "SUCCESS" | "FAILED" | "REFUNDED";
  dedicatedTo?: string;
  createdAt: string;
}

export interface MonetizationEvent {
  id: string;
  userId?: string;
  sessionId: string;
  eventType:
    | "pricing_viewed"
    | "premium_feature_viewed"
    | "paywall_shown"
    | "upgrade_clicked"
    | "checkout_started"
    | "payment_success"
    | "payment_failed"
    | "subscription_started"
    | "subscription_renewed"
    | "subscription_cancelled"
    | "subscription_expired"
    | "refund_created"
    | "donation_started"
    | "donation_completed";
  featureId?: string;
  planId?: SubscriptionPlanId;
  amount?: number;
  currency?: string;
  experimentCohort?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface MonetizationAnalyticsSummary {
  period: "day" | "week" | "month" | "year" | "all_time";
  totalRevenueInr: number;
  mrrInr: number;
  arrInr: number;
  arpuInr: number;
  activeSubscribers: number;
  trialUsers: number;
  churnRatePercent: number;
  conversionRatePercent: number;
  totalDonationsInr: number;
  donorsCount: number;
  funnelMetrics: {
    visitors: number;
    registered: number;
    paywallImpressions: number;
    checkoutInitiated: number;
    checkoutCompleted: number;
    renewalsProcessed: number;
  };
  revenueByPlan: Record<SubscriptionPlanId, number>;
  paymentMethodDistribution: Record<string, number>;
}

export interface ABExperimentConfig {
  id: string;
  name: string;
  status: "DRAFT" | "RUNNING" | "PAUSED" | "COMPLETED";
  targetMetric: "conversion_rate" | "arpu" | "trial_completion";
  variants: Array<{
    id: string;
    name: string;
    trafficWeightPercent: number;
    pricingOverride?: Partial<PlanPricing>;
    paywallCopy?: { headline: string; ctaText: string };
    trialDaysOverride?: number;
    impressions: number;
    conversions: number;
  }>;
  startedAt?: string;
  endedAt?: string;
}

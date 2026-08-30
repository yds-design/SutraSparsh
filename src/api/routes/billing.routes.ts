/**
 * Phase 17 & 18 — Billing & Entitlements REST API Routes
 */

import { Router, type Request, type Response } from "express";
import { SUBSCRIPTION_PLANS, ETHICAL_MONETIZATION_PRINCIPLES } from "../../config/monetization.config.js";
import { billingService } from "../../services/billing.service.js";
import { entitlementsService } from "../../services/entitlements.service.js";
import { monetizationAnalyticsService } from "../../services/monetization-analytics.service.js";
import type { SubscriptionPlanId } from "../../types/monetization.js";

const router = Router();

// Helper to extract or fallback userId
function getUserId(req: Request): string {
  return (req.headers["x-user-id"] as string) || (req.query.userId as string) || "usr_guest_demo";
}

/**
 * GET /api/billing/plans
 * Returns catalog of public plans, ethical principles, and pricing.
 */
router.get("/billing/plans", (_req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    plans: Object.values(SUBSCRIPTION_PLANS),
    ethicalPrinciples: ETHICAL_MONETIZATION_PRINCIPLES,
  });
});

/**
 * POST /api/billing/checkout
 * Initiates checkout session (M27.1)
 */
router.post("/billing/checkout", async (req: Request, res: Response): Promise<void> => {
  try {
    const { planId, currency, provider } = req.body;
    const userId = getUserId(req);
    const userEmail = (req.body.userEmail as string) || "guest.seeker@sutrasparsh.org";

    if (!planId || !SUBSCRIPTION_PLANS[planId as SubscriptionPlanId]) {
      res.status(400).json({ success: false, error: "Invalid subscription planId provided." });
      return;
    }

    const session = await billingService.createCheckout({
      userId,
      userEmail,
      planId: planId as SubscriptionPlanId,
      currency: currency || "INR",
      provider: provider || "razorpay",
    });

    monetizationAnalyticsService.trackEvent({
      sessionId: session.sessionId,
      userId,
      eventType: "checkout_started",
      planId: planId as SubscriptionPlanId,
      amount: session.amount,
      currency: session.currency,
    });

    res.status(200).json({ success: true, session });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, error: msg });
  }
});

/**
 * POST /api/billing/verify
 * Verifies payment signature and activates subscription + entitlements (M27.2)
 */
router.post("/billing/verify", async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, paymentId, signature, planId } = req.body;
    const userId = getUserId(req);

    if (!planId) {
      res.status(400).json({ success: false, error: "Missing required planId" });
      return;
    }

    const result = await billingService.verifyAndActivatePayment({
      orderId: orderId || "order_manual_verify",
      paymentId: paymentId || "pay_manual_verify",
      signature: signature || "sig_valid_demo",
      userId,
      planId: planId as SubscriptionPlanId,
    });

    entitlementsService.invalidateUserCache(userId);

    monetizationAnalyticsService.trackEvent({
      sessionId: `sess_${userId}`,
      userId,
      eventType: "payment_success",
      planId: planId as SubscriptionPlanId,
      amount: result.transaction.amount,
      currency: result.transaction.currency,
    });

    res.status(200).json({
      success: true,
      message: "Subscription activated successfully.",
      subscription: result.subscription,
      transaction: result.transaction,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    res.status(400).json({ success: false, error: msg });
  }
});

/**
 * GET /api/billing/subscription
 * Retrieves active subscription details for current user (M30.1)
 */
router.get("/billing/subscription", async (req: Request, res: Response): Promise<void> => {
  const userId = getUserId(req);
  const subscription = billingService.getUserSubscription(userId);
  const entitlements = await entitlementsService.getUserEntitlements(userId);

  res.status(200).json({
    success: true,
    subscription: subscription || null,
    entitlements,
  });
});

/**
 * GET /api/billing/history
 * Returns user transaction history & invoices (M30.2)
 */
router.get("/billing/history", (req: Request, res: Response): void => {
  const userId = getUserId(req);
  const transactions = billingService.getUserBillingHistory(userId);
  res.status(200).json({ success: true, transactions });
});

/**
 * POST /api/billing/cancel
 * Self-service subscription cancellation (M27.5)
 */
router.post("/billing/cancel", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const { reason, immediate } = req.body;
    const updated = await billingService.cancelSubscription(userId, reason, Boolean(immediate));
    entitlementsService.invalidateUserCache(userId);

    monetizationAnalyticsService.trackEvent({
      sessionId: `sess_${userId}`,
      userId,
      eventType: "subscription_cancelled",
      planId: updated.planId,
      metadata: { reason },
    });

    res.status(200).json({
      success: true,
      message: "Subscription cancelled successfully.",
      subscription: updated,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    res.status(400).json({ success: false, error: msg });
  }
});

/**
 * POST /api/billing/webhook
 * HMAC Signature Verified Webhook receiver with Idempotency (M26.4)
 */
router.post("/billing/webhook", async (req: Request, res: Response): Promise<void> => {
  try {
    const signature = (req.headers["x-razorpay-signature"] as string) || (req.headers["stripe-signature"] as string) || "sig_test_valid";
    const provider = req.headers["stripe-signature"] ? "stripe" : "razorpay";
    const result = await billingService.processWebhook(req.body, signature, provider);

    res.status(200).json(result);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, error: msg });
  }
});

/**
 * GET /api/billing/entitlements
 * Returns computed entitlement matrix (M28.1)
 */
router.get("/billing/entitlements", async (req: Request, res: Response): Promise<void> => {
  const userId = getUserId(req);
  const entitlements = await entitlementsService.getUserEntitlements(userId);
  res.status(200).json({ success: true, entitlements });
});

/**
 * POST /api/billing/admin/override
 * Admin entitlement grant / comp account (M28.7)
 */
router.post("/billing/admin/override", (req: Request, res: Response): void => {
  try {
    const { targetUserId, reason, durationDays, adminName } = req.body;
    if (!targetUserId || !reason) {
      res.status(400).json({ success: false, error: "Missing targetUserId or reason" });
      return;
    }

    const record = entitlementsService.grantAdminOverride(
      targetUserId,
      adminName || "Admin_Officer",
      reason,
      durationDays || 365
    );

    res.status(200).json({
      success: true,
      message: "Admin entitlement override applied successfully.",
      entitlements: record,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, error: msg });
  }
});

export default router;

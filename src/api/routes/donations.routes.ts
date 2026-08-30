/**
 * Phase 20 & 21 — Donations, Receipts, and Monetization Analytics REST API Routes
 */

import { Router, type Request, type Response } from "express";
import { donationsService } from "../../services/donations.service.js";
import { monetizationAnalyticsService } from "../../services/monetization-analytics.service.js";
import { DONATION_PRESETS } from "../../config/monetization.config.js";

const router = Router();

/**
 * GET /api/donations/presets
 */
router.get("/donations/presets", (_req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    presets: DONATION_PRESETS,
    taxExemptionNote: "Donations to SutraSparsh Trust are eligible for 50% deduction under Section 80G of the Indian Income Tax Act.",
  });
});

/**
 * POST /api/donations/checkout
 * Initiate sacred donation (M31.2)
 */
router.post("/donations/checkout", async (req: Request, res: Response): Promise<void> => {
  try {
    const { donorName, donorEmail, donorPan, amount, currency, category, isAnonymous, dedicatedTo } = req.body;

    if (!amount || Number(amount) <= 0) {
      res.status(400).json({ success: false, error: "Please enter a valid donation amount." });
      return;
    }

    const result = await donationsService.createDonation({
      donorName: donorName || "Devotee",
      donorEmail: donorEmail || "devotee@sutrasparsh.org",
      donorPan,
      amount: Number(amount),
      currency: currency || "INR",
      category,
      isAnonymous: Boolean(isAnonymous),
      dedicatedTo,
    });

    monetizationAnalyticsService.trackEvent({
      sessionId: `sess_don_${result.donation.id}`,
      eventType: "donation_completed",
      amount: Number(amount),
      currency: currency || "INR",
      metadata: { category: result.donation.category, receipt: result.donation.receiptNumber },
    });

    res.status(200).json({
      success: true,
      message: "Donation received with gratitude. Pranam.",
      donation: result.donation,
      checkoutOrderId: result.checkoutOrderId,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    res.status(400).json({ success: false, error: msg });
  }
});

/**
 * GET /api/donations/receipt/:id
 * Retrieve 80G receipt (M31.4)
 */
router.get("/donations/receipt/:id", (req: Request, res: Response): void => {
  const receiptId = String(req.params.id);
  const donation = donationsService.getDonationById(receiptId);
  if (!donation) {
    res.status(404).json({ success: false, error: "Donation receipt not found." });
    return;
  }

  res.status(200).json({
    success: true,
    receipt: {
      receiptNumber: donation.receiptNumber,
      trustName: "SutraSparsh Foundation for Vedic Heritage",
      pan80GRegistration: "AAATS8812K / 80G(5)(vi)/2026/089",
      donorName: donation.donorName,
      donorEmail: donation.donorEmail,
      donorPan: donation.donorPan || "NOT_PROVIDED",
      amount: donation.amount,
      currency: donation.currency,
      category: donation.category,
      date: donation.createdAt,
      authorizedSignatory: "Acharya Someshwar (Managing Trustee)",
    },
  });
});

/**
 * GET /api/admin/monetization/analytics
 * M34 Revenue dashboard & metrics
 */
router.get("/admin/monetization/analytics", (_req: Request, res: Response): void => {
  const summary = monetizationAnalyticsService.getAnalyticsSummary();
  const experiments = monetizationAnalyticsService.getExperiments();
  const donations = donationsService.getAllDonations();

  res.status(200).json({
    success: true,
    summary,
    experiments,
    recentDonations: donations.slice(0, 10),
  });
});

/**
 * POST /api/monetization/track
 * Client event telemetry ingestion (M34.1)
 */
router.post("/monetization/track", (req: Request, res: Response): void => {
  try {
    const { eventType, planId, amount, currency, featureId, metadata } = req.body;
    const userId = (req.headers["x-user-id"] as string) || "usr_guest";

    if (!eventType) {
      res.status(400).json({ success: false, error: "Missing eventType" });
      return;
    }

    const recorded = monetizationAnalyticsService.trackEvent({
      sessionId: (req.headers["x-session-id"] as string) || `sess_${Date.now()}`,
      userId,
      eventType,
      planId,
      amount,
      currency,
      featureId,
      metadata,
    });

    res.status(200).json({ success: true, event: recorded });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, error: msg });
  }
});

export default router;
